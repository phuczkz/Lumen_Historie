const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionsByOrderId,
  getSessionById,
  updateSession,
  deleteSession,
  updateStatus
} = require('../controllers/sessionController');

// @route   POST api/sessions
// @desc    Create a new session for an order
// @access  Public (for now, should be Admin or based on order status/ownership)
router.post('/', createSession);

// @route   GET api/sessions/order/:orderId
// @desc    Get all sessions for a specific order
// @access  Public (for now, should be Client (own), Doctor (associated), or Admin)
router.get('/order/:orderId', getSessionsByOrderId);

// @route   GET api/sessions/:id
// @desc    Get a single session by its ID
// @access  Public (for now, should be Client (own), Doctor (associated), or Admin)
router.get('/:id', getSessionById);

// @route   PUT api/sessions/:id
// @desc    Update a session (scheduled_at, status, notes)
// @access  Public (for now, should be Admin or Doctor for status/notes)
router.put('/:id', updateSession);

// @route   DELETE api/sessions/:id
// @desc    Delete a session
// @access  Public (for now, should be Admin or Doctor)
router.delete('/:id', deleteSession);

// @route   PATCH api/sessions/:id/status
// @desc    Update session status
// @access  Public (for now, should be Admin or Doctor)
router.patch('/:id/status', updateStatus);

module.exports = router; 