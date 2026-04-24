const RegularizationRequest = require('../models/RegularizationRequest');
const Attendance = require('../models/Attendance');
const { asyncHandler } = require('../middleware/errorHandler');
const { OFFICE_TIMING } = require('../config/office');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a Date object from a YYYY-MM-DD string + HH:MM string.
 * Returns null if either part is missing / invalid.
 */
const buildDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

// ─── Employee Endpoints ───────────────────────────────────────────────────────

// @desc  Submit a regularization request
// @route POST /api/regularization/request
// @access Private (employee)
const createRequest = asyncHandler(async (req, res) => {
  const { date, requestType, checkInTime, checkOutTime, reason } = req.body;

  if (!date || !requestType || !reason) {
    return res.status(400).json({
      success: false,
      message: 'date, requestType and reason are required',
    });
  }

  const validTypes = ['missing_checkin', 'missing_checkout', 'both', 'absent_correction'];
  if (!validTypes.includes(requestType)) {
    return res.status(400).json({ success: false, message: 'Invalid requestType' });
  }

  // Cannot request future dates
  const today = new Date().toISOString().slice(0, 10);
  if (date > today) {
    return res.status(400).json({ success: false, message: 'Cannot regularize a future date' });
  }

  // Validate that required times are provided for the request type
  const needsCheckIn  = ['missing_checkin', 'both', 'absent_correction'].includes(requestType);
  const needsCheckOut = ['missing_checkout', 'both', 'absent_correction'].includes(requestType);

  const requestedCheckIn  = needsCheckIn  ? buildDateTime(date, checkInTime)  : null;
  const requestedCheckOut = needsCheckOut ? buildDateTime(date, checkOutTime) : null;

  if (needsCheckIn && !requestedCheckIn) {
    return res.status(400).json({ success: false, message: 'A valid check-in time (HH:MM) is required for this request type' });
  }
  if (needsCheckOut && !requestedCheckOut) {
    return res.status(400).json({ success: false, message: 'A valid check-out time (HH:MM) is required for this request type' });
  }

  if (requestedCheckIn && requestedCheckOut && requestedCheckIn >= requestedCheckOut) {
    return res.status(400).json({ success: false, message: 'Check-in time must be before check-out time' });
  }

  // Enforce: only one pending request per date per user
  const existing = await RegularizationRequest.findOne({
    userId: req.user._id,
    date,
    status: 'pending',
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending regularization request for this date',
    });
  }

  // Snapshot the current attendance record (if any) for audit
  const currentRecord = await Attendance.findOne({ userId: req.user._id, date });
  const snapshotBefore = currentRecord
    ? {
        checkInTime:  currentRecord.checkInTime,
        checkOutTime: currentRecord.checkOutTime,
        status:       currentRecord.status,
        workHours:    currentRecord.workHours,
      }
    : null;

  const request = await RegularizationRequest.create({
    userId: req.user._id,
    date,
    requestType,
    requestedCheckIn,
    requestedCheckOut,
    reason,
    snapshotBefore,
  });

  res.status(201).json({
    success: true,
    message: 'Regularization request submitted successfully',
    request,
  });
});

// @desc  Get own regularization requests
// @route GET /api/regularization/my-requests
// @access Private (employee)
const getMyRequests = asyncHandler(async (req, res) => {
  const { status, year } = req.query;
  const query = { userId: req.user._id };
  if (status) query.status = status;
  if (year)   query.date = { $regex: `^${year}` };

  const requests = await RegularizationRequest.find(query)
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// @desc  Cancel own pending regularization request
// @route DELETE /api/regularization/:id
// @access Private (employee)
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await RegularizationRequest.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
  }

  await request.deleteOne();
  res.json({ success: true, message: 'Regularization request cancelled' });
});

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

// @desc  Get all regularization requests
// @route GET /api/regularization/requests
// @access Private (admin)
const getAllRequests = asyncHandler(async (req, res) => {
  const { status, userId, year } = req.query;
  const query = {};
  if (status) query.status = status;
  if (userId) query.userId = userId;
  if (year)   query.date = { $regex: `^${year}` };

  const requests = await RegularizationRequest.find(query)
    .populate('userId', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });

  const formatted = requests.map(r => ({
    ...r.toJSON(),
    userName:       r.userId?.name,
    userEmail:      r.userId?.email,
    reviewedByName: r.reviewedBy?.name || null,
  }));

  res.json({ success: true, requests: formatted });
});

// @desc  Approve a regularization request — patches the Attendance record
// @route PUT /api/regularization/requests/:id/approve
// @access Private (admin)
const approveRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await RegularizationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Request is not pending' });
  }

  // Build the attendance patch
  const patch = {};

  if (request.requestedCheckIn)  patch.checkInTime  = request.requestedCheckIn;
  if (request.requestedCheckOut) patch.checkOutTime = request.requestedCheckOut;

  // Recalculate work hours if both times are now available
  // We find the existing record first to merge with any times not being changed
  let attendanceRecord = await Attendance.findOne({ userId: request.userId, date: request.date });

  const finalCheckIn  = patch.checkInTime  || attendanceRecord?.checkInTime  || null;
  const finalCheckOut = patch.checkOutTime || attendanceRecord?.checkOutTime || null;

  if (finalCheckIn && finalCheckOut) {
    const diffMs = new Date(finalCheckOut) - new Date(finalCheckIn);
    patch.workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  // Determine status using the same office timing config as the main attendance controller
  if (finalCheckIn) {
    const checkInDate = new Date(finalCheckIn);
    const dayOfWeek   = new Date(request.date + 'T00:00:00').getDay(); // 0=Sun,6=Sat
    const isSaturday  = dayOfWeek === 6;
    const lateHour    = isSaturday ? OFFICE_TIMING.saturdayStartHour   : OFFICE_TIMING.weekdayStartHour;
    const lateMin     = isSaturday ? OFFICE_TIMING.saturdayStartMinute : OFFICE_TIMING.weekdayStartMinute;
    const checkInHour = checkInDate.getHours();
    const checkInMin  = checkInDate.getMinutes();
    const isLate      = checkInHour > lateHour || (checkInHour === lateHour && checkInMin > lateMin);
    patch.status = isLate ? 'late' : 'present';
  }

  patch.notes = `Regularized: ${request.requestType.replace(/_/g, ' ')} — ${request.reason}`;

  if (attendanceRecord) {
    Object.assign(attendanceRecord, patch);
    await attendanceRecord.save();
  } else {
    // Create a new attendance record if there wasn't one (e.g. absent_correction)
    await Attendance.create({
      userId: request.userId,
      date:   request.date,
      ...patch,
    });
  }

  // Mark request as approved
  request.status     = 'approved';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote  = adminNote || '';
  await request.save();

  res.json({
    success: true,
    message: 'Regularization request approved and attendance record updated',
    request,
  });
});

// @desc  Reject a regularization request
// @route PUT /api/regularization/requests/:id/reject
// @access Private (admin)
const rejectRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await RegularizationRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Request is not pending' });
  }

  request.status     = 'rejected';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.adminNote  = adminNote || '';
  await request.save();

  res.json({ success: true, message: 'Regularization request rejected', request });
});

// @desc  Get pending regularization count (for admin badge)
// @route GET /api/regularization/requests/pending-count
// @access Private (admin)
const getPendingCount = asyncHandler(async (req, res) => {
  const count = await RegularizationRequest.countDocuments({ status: 'pending' });
  res.json({ success: true, count });
});

module.exports = {
  createRequest,
  getMyRequests,
  cancelRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  getPendingCount,
};