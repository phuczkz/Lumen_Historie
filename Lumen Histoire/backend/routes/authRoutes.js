const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, registerClient, loginClient, getAdminProfile, updateAdminProfile, getClientProfile, updateClientProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Client routes
// @route   POST api/auth/client/register
// @desc    Register a client
// @access  Public
router.post('/client/register', registerClient);

// @route   GET api/auth/admin/profile
// @desc    Get admin profile
// @access  Private
router.get('/admin/profile', auth.adminAuth, getAdminProfile);


// Admin routes
// @route   POST api/auth/admin/register
// @desc    Register an admin
// @access  Public
router.post('/admin/register', registerAdmin);

// @route   POST api/auth/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/admin/login', loginAdmin);


// @route   PUT api/auth/admin/profile
// @desc    Update admin profile
// @access  Private
router.put('/admin/profile', auth.adminAuth, updateAdminProfile);



// @route   POST api/auth/client/login
// @desc    Authenticate client & get token
// @access  Public
router.post('/client/login', loginClient);

// @route   GET api/auth/client/profile
// @desc    Get client profile
// @access  Private
router.get('/client/profile', auth.clientAuth, getClientProfile);

// @route   PUT api/auth/client/profile
// @desc    Update client profile
// @access  Private
router.put('/client/profile', auth.clientAuth, updateClientProfile);

module.exports = router;