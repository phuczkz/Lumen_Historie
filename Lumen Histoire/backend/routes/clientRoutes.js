const express = require('express');
const router = express.Router();
const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients
} = require('../controllers/clientController');

// @route   POST api/clients
// @desc    Create a new client
// @access  Public (for now, consider protection for actual user registration flow)
router.post('/', createClient);

// @route   GET api/clients
// @desc    Get all clients
// @access  Public (for now, should likely be Admin or protected)
router.get('/', getAllClients);

// @route   GET api/clients/search
// @desc    Search clients by email or full_name
// @access  Public (for now, should likely be Admin or protected)
// Important: This must be BEFORE '/:id'
router.get('/search', searchClients);

// @route   GET api/clients/:id
// @desc    Get a single client by ID
// @access  Public (for now, could be self or Admin)
router.get('/:id', getClientById);

// @route   PUT api/clients/:id
// @desc    Update a client
// @access  Public (for now, could be self or Admin)
router.put('/:id', updateClient);

// @route   DELETE api/clients/:id
// @desc    Delete a client
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteClient);

module.exports = router; 