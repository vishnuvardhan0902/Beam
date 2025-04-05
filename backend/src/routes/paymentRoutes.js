const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, testConnection } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/test-connection', testConnection);
// For initial testing, let's make create-order public as well
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router; 