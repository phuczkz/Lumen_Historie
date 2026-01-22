const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Routes for appointments
router.get('/', appointmentController.getAllAppointments);
router.get('/week', appointmentController.getAppointmentsByWeek);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

module.exports = router; 