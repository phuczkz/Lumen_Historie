const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByAppointmentId,
  getReviewById,
  updateReview,
  deleteReview,
  getAllReviews,
  getReviewsByDoctorId
} = require('../controllers/reviewController');

// @route   GET api/reviews
// @desc    Get all reviews with pagination and search
// @access  Public
router.get('/', getAllReviews);

// @route   POST api/reviews
// @desc    Create a new review for an appointment
// @access  Public (for now, should be Client who attended the appointment)
router.post('/', createReview);

// @route   GET api/reviews/appointment/:appointmentId
// @desc    Get all reviews for a specific appointment
// @access  Public
router.get('/appointment/:appointmentId', getReviewsByAppointmentId);

// @route   GET api/reviews/doctor/:doctorId
// @desc    Get all reviews for a specific doctor
// @access  Public
router.get('/doctor/:doctorId', getReviewsByDoctorId);

// @route   GET api/reviews/:id
// @desc    Get a single review by its ID
// @access  Public
router.get('/:id', getReviewById);

// @route   PUT api/reviews/:id
// @desc    Update a review (rating, comment)
// @access  Public (for now, should be Client who wrote it or Admin)
router.put('/:id', updateReview);

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Public (for now, should be Client who wrote it or Admin)
router.delete('/:id', deleteReview);

module.exports = router; 