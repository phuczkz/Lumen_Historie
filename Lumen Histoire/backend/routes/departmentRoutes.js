const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  searchDepartments
} = require('../controllers/departmentController');

// We might want to protect these routes later with authentication middleware

// @route   POST api/departments
// @desc    Create a new department
// @access  Public (for now, should be Admin)
router.post('/', createDepartment);

// @route   GET api/departments
// @desc    Get all departments
// @access  Public
router.get('/', getAllDepartments);

// @route   GET api/departments/search
// @desc    Search departments by name or description
// @access  Public
// Important: This route must be defined BEFORE '/:id' to avoid 'search' being treated as an ID.
router.get('/search', searchDepartments);

// @route   GET api/departments/:id
// @desc    Get a single department by ID
// @access  Public
router.get('/:id', getDepartmentById);

// @route   PUT api/departments/:id
// @desc    Update a department
// @access  Public (for now, should be Admin)
router.put('/:id', updateDepartment);

// @route   DELETE api/departments/:id
// @desc    Delete a department
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteDepartment);

module.exports = router; 