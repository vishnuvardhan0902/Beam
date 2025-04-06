const express = require('express');
const router = express.Router();
const { protect, sellerAuth } = require('../middleware/authMiddleware');
const {
  getSellerDashboard,
  getSellerSales,
  getSellerOrders
} = require('../controllers/sellerController');

// All seller routes require authentication
router.use(protect);
router.use(sellerAuth);

// Get seller dashboard data
router.route('/dashboard').get(getSellerDashboard);

// Get seller sales data
router.route('/sales').get(getSellerSales);

// Get seller orders
router.route('/orders').get(getSellerOrders);

module.exports = router; 