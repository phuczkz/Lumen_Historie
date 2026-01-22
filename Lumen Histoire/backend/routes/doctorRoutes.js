const express = require('express');
const router = express.Router();
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  searchDoctors,
  addQualification,
  updateQualification,
  deleteQualification,
  addExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/doctorController');

// @route   POST api/doctors
// @desc    Create a new doctor
// @access  Public (for now, should be Admin)
router.post('/', createDoctor);

// @route   GET api/doctors
// @desc    Get all doctors (with department details)
// @access  Public
router.get('/', getAllDoctors);

// @route   GET api/doctors/search
// @desc    Search doctors by full_name, email, or specialty (with department details)
// @access  Public
// Important: This must be BEFORE '/:id'
router.get('/search', searchDoctors);

// @route   GET api/doctors/:id
// @desc    Get a single doctor by ID (with department details, qualifications, and experiences)
// @access  Public
router.get('/:id', getDoctorById);

// @route   PUT api/doctors/:id
// @desc    Update a doctor
// @access  Public (for now, should be Admin)
router.put('/:id', updateDoctor);

// @route   DELETE api/doctors/:id
// @desc    Delete a doctor
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteDoctor);

// ===== QUALIFICATIONS ROUTES =====

// @route   POST api/doctors/:doctorId/qualifications
// @desc    Add a qualification for a doctor
// @access  Public (for now, should be Admin)
router.post('/:doctorId/qualifications', addQualification);

// @route   PUT api/doctors/qualifications/:qualificationId
// @desc    Update a qualification
// @access  Public (for now, should be Admin)
router.put('/qualifications/:qualificationId', updateQualification);

// @route   DELETE api/doctors/qualifications/:qualificationId
// @desc    Delete a qualification
// @access  Public (for now, should be Admin)
router.delete('/qualifications/:qualificationId', deleteQualification);

// ===== EXPERIENCES ROUTES =====

// @route   POST api/doctors/:doctorId/experiences
// @desc    Add an experience for a doctor
// @access  Public (for now, should be Admin)
router.post('/:doctorId/experiences', addExperience);

// @route   PUT api/doctors/experiences/:experienceId
// @desc    Update an experience
// @access  Public (for now, should be Admin)
router.put('/experiences/:experienceId', updateExperience);

// @route   DELETE api/doctors/experiences/:experienceId
// @desc    Delete an experience
// @access  Public (for now, should be Admin)
router.delete('/experiences/:experienceId', deleteExperience);

module.exports = router; 