const express = require('express');
const router = express.Router();
const {
  createReminder,
  getAllReminders, // This will handle general fetching, client-specific, and session-specific
  getReminderById,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');

// @route   POST api/reminders
// @desc    Create a new reminder
// @access  Public (for now, should be Admin or System)
router.post('/', createReminder);

// @route   GET api/reminders
// @desc    Get all reminders (optionally filtered by clientId or sessionId in query params)
//          e.g., /api/reminders?clientId=1 or /api/reminders?sessionId=2
// @access  Public (for now, should be Admin or specific user roles)
router.get('/', getAllReminders);

// @route   GET api/reminders/:id
// @desc    Get a single reminder by its ID
// @access  Public (for now, Admin or specific user)
router.get('/:id', getReminderById);

// @route   PUT api/reminders/:id
// @desc    Update a reminder (type, scheduled_send, status, sent_at)
// @access  Public (for now, should be Admin or System)
router.put('/:id', updateReminder);

// @route   DELETE api/reminders/:id
// @desc    Delete a reminder
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteReminder);

module.exports = router; 