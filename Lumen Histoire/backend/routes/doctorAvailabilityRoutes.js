const express = require('express');
const router = express.Router();
const {
  createDoctorAvailability,
  getDoctorAvailabilityByDoctorId,
  getDoctorAvailabilityById,
  updateDoctorAvailability,
  deleteDoctorAvailability
} = require('../controllers/doctorAvailabilityController');

// @route   POST api/availability
// @desc    Create a new doctor availability slot
// @access  Public (for now, should be Doctor or Admin)
router.post('/', createDoctorAvailability);

// @route   GET api/availability/doctor/:doctorId
// @desc    Get all availability slots for a specific doctor (with filters for date range, status, isActive)
//          e.g., /api/availability/doctor/1?startDate=2023-01-01&endDate=2023-01-31&status=available
// @access  Public
router.get('/doctor/:doctorId', getDoctorAvailabilityByDoctorId);

// @route   GET api/availability/:id
// @desc    Get a single availability slot by its ID
// @access  Public
router.get('/:id', getDoctorAvailabilityById);

// @route   PUT api/availability/:id
// @desc    Update a doctor availability slot
// @access  Public (for now, should be Doctor or Admin)
router.put('/:id', updateDoctorAvailability);

// @route   DELETE api/availability/:id
// @desc    Delete a doctor availability slot
// @access  Public (for now, should be Doctor or Admin)
router.delete('/:id', deleteDoctorAvailability);

module.exports = router; 