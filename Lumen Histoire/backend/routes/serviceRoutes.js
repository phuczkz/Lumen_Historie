const express = require('express');
const router = express.Router();
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  searchServices
} = require('../controllers/serviceController');

// @route   POST api/services
// @desc    Create a new service
// @access  Public (for now, should be Admin)
router.post('/', createService);

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', getAllServices);

// @route   GET api/services/search
// @desc    Search services by name or description
// @access  Public
// Important: This must be BEFORE '/:id'
router.get('/search', searchServices);

// @route   GET api/services/:id
// @desc    Get a single service by ID
// @access  Public
router.get('/:id', getServiceById);

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Public (for now, should be Admin)
router.put('/:id', updateService);

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteService);

module.exports = router; 