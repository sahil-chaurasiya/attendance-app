const express = require('express');
const router  = express.Router();
const {
  createRequest,
  getMyRequests,
  cancelRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  getPendingCount,
} = require('../controllers/regularizationController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Employee routes ───────────────────────────────────────────────────────────
router.post('/request',        protect, createRequest);
router.get('/my-requests',     protect, getMyRequests);
router.delete('/:id',          protect, cancelRequest);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/requests',                      protect, adminOnly, getAllRequests);
router.get('/requests/pending-count',        protect, adminOnly, getPendingCount);
router.put('/requests/:id/approve',          protect, adminOnly, approveRequest);
router.put('/requests/:id/reject',           protect, adminOnly, rejectRequest);

module.exports = router;
