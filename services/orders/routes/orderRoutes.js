const express = require('express');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/orders', protect, getAllOrders);
router.get('/orders/:id', protect, getOrderById);
router.post('/orders', protect, createOrder);
router.patch('/orders/:id', protect, adminOnly, updateOrder);
router.delete('/orders/:id', protect, deleteOrder);

module.exports = router;