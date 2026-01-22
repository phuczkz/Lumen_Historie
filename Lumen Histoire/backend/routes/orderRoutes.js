const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateStatus
} = require('../controllers/orderController');

// @route   POST api/orders
// @desc    Create a new order
// @access  Public (for now, should be protected, e.g., Client or Admin)
router.post('/', createOrder);

// @route   GET api/orders
// @desc    Get all orders with details
// @access  Public (for now, should be Admin or specific user roles)
router.get('/', getAllOrders);

// @route   GET api/orders/:id
// @desc    Get a single order by ID with details and its sessions
// @access  Public (for now, should be Client (own), Doctor (associated), or Admin)
router.get('/:id', getOrderById);

// @route   PUT api/orders/:id
// @desc    Update an order (status, notes, payment, etc.)
// @access  Public (for now, should be Admin or specific roles for specific fields)
router.put('/:id', updateOrder);

// @route   DELETE api/orders/:id
// @desc    Delete an order (also deletes associated sessions due to CASCADE)
// @access  Public (for now, should be Admin)
router.delete('/:id', deleteOrder);

// @route   PATCH api/orders/:id/status
// @desc    Update order status
// @access  Public (for now, should be Admin or specific user roles)
router.patch('/:id/status', updateStatus);

module.exports = router; 