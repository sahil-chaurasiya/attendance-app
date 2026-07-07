const Holiday = require('../models/Holiday');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get holidays (optionally filtered by month/year)
// @route   GET /api/holidays?month=&year=
// @access  Private (any logged-in user)
const getHolidays = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  let query = {};

  if (month && year) {
    const m = String(month).padStart(2, '0');
    query.date = { $regex: `^${year}-${m}` };
  } else if (year) {
    query.date = { $regex: `^${year}` };
  }

  const holidays = await Holiday.find(query).sort({ date: 1 });
  res.json({ success: true, holidays });
});

// @desc    Create a holiday — marks every active employee as present (status
//          'holiday') for that date so it never counts against them as absent
// @route   POST /api/holidays
// @access  Admin
const createHoliday = asyncHandler(async (req, res) => {
  const { date, name, label } = req.body;

  if (!date || !name) {
    return res.status(400).json({ success: false, message: 'date and name are required' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'date must be in YYYY-MM-DD format' });
  }

  const existing = await Holiday.findOne({ date });
  if (existing) {
    return res.status(400).json({ success: false, message: `A holiday ("${existing.name}") is already set for this date` });
  }

  const holiday = await Holiday.create({
    date,
    name: name.trim(),
    label: (label || '').trim(),
    createdBy: req.user._id,
  });

  // Apply to every active employee — upsert their attendance record for the
  // day as 'holiday' so dashboards/reports treat them as accounted-for
  // (never absent) without wiping out any real check-in they may already have.
  const employees = await User.find({ role: 'employee', isActive: true }).select('_id');

  await Promise.all(
    employees.map((emp) =>
      Attendance.findOneAndUpdate(
        { userId: emp._id, date },
        {
          $set: {
            status: 'holiday',
            holidayName: name.trim(),
            notes: `Holiday: ${name.trim()}`,
          },
          $setOnInsert: {
            checkInTime: null,
            checkOutTime: null,
            workHours: 0,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  res.status(201).json({
    success: true,
    message: `Holiday "${holiday.name}" added — applied to ${employees.length} employee(s)`,
    holiday,
  });
});

// @desc    Delete a holiday — reverts the auto-marked attendance records
// @route   DELETE /api/holidays/:id
// @access  Admin
const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);
  if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });

  // Only remove attendance records that were purely auto-generated for the
  // holiday (nobody actually checked in) — never touch real attendance data.
  await Attendance.deleteMany({ date: holiday.date, status: 'holiday', checkInTime: null });

  await holiday.deleteOne();
  res.json({ success: true, message: `Holiday "${holiday.name}" removed` });
});

module.exports = { getHolidays, createHoliday, deleteHoliday };