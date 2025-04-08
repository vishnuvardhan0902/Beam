const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { getSellerOrders } = require('../controllers/sellerController');
const { sellerAuth } = require('../middleware/authMiddleware');

// Private routes (require authentication)
// router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/seller').get(protect, sellerAuth, getSellerOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

module.exports = router;