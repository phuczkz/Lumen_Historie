const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// Admin routes - specific routes first to avoid conflicts
// Get appointments by week (admin only)
router.get('/week', auth.adminAuth, appointmentController.getAppointmentsByWeek);

// Get appointments by doctor ID (admin only)
router.get('/doctor/:doctorId', auth.adminAuth, appointmentController.getAppointmentsByDoctorId);

// Get all appointments (admin only)
router.get('/all', auth.adminAuth, appointmentController.getAllAppointments);

// Client routes
// Get my appointments
router.get('/my', auth.clientAuth, appointmentController.getMyAppointments);

// Cancel an appointment
router.put('/:id/cancel', auth.clientAuth, appointmentController.cancelAppointment);

// Complete an appointment (admin/doctor)
router.put('/:id/complete', auth.adminAuth, appointmentController.completeAppointment);

// Update appointment status (admin only)
router.put('/:id/status', auth.adminAuth, appointmentController.updateAppointmentStatus);

// Reschedule appointment (admin only)
router.put('/:id/reschedule', auth.adminAuth, appointmentController.rescheduleAppointment);

module.exports = router;
