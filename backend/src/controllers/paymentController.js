const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: 'rzp_test_Bv9HsrboraxaMb',
  key_secret: '5WPZUiy6yn23ya0TTWQZTdFf'
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log('Create order request received:', req.body);
    const { amount, currency = 'INR' } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Convert to number and ensure proper format for Razorpay (paise)
    const amountInPaise = Math.round(amount * 100);
    
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    
    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack 
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", '5WPZUiy6yn23ya0TTWQZTdFf')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      // Here you can update your database with the order status
      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// @desc    Test Razorpay connection
// @route   GET /api/payment/test-connection
// @access  Public
const testConnection = async (req, res) => {
  try {
    const isRazorpayInitialized = !!razorpay;
    res.json({ 
      success: true, 
      message: 'Razorpay connection successful',
      initialized: isRazorpayInitialized
    });
  } catch (error) {
    console.error('Error testing Razorpay connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize Razorpay', 
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  testConnection
}; 