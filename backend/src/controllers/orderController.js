const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const SellerSales = require('../models/sellerSalesModel');
const User = require('../models/userModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Ensure each order item has a seller ID
    const validatedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        // If seller ID is missing, get it from the product
        if (!item.seller) {
          try {
            const product = await Product.findById(item.product);
            if (product) {
              item.seller = product.user;
              console.log(`Added seller ID ${product.user} to item ${item.name}`);
            } else {
              throw new Error(`Product not found: ${item.product}`);
            }
          } catch (error) {
            console.error('Error fetching product for seller ID:', error);
            throw new Error(`Could not validate seller for item: ${item.name}`);
          }
        }
        return item;
      })
    );

    const order = new Order({
      orderItems: validatedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  // Find order and populate with user's name and email
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    // Check if the order belongs to the user or if the user is an admin
    if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
      res.json(order);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    // This would come from the payment provider like PayPal or Razorpay
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    // Record sales data for each seller involved in the order
    try {
      // Process each order item
      for (const item of order.orderItems) {
        // Skip if no seller ID (should not happen in proper data)
        if (!item.seller) {
          console.log('No seller ID found for item:', item.name);
          continue;
        }

        // Get product details
        const product = await Product.findById(item.product);
        if (!product) {
          console.log('Product not found:', item.product);
          continue;
        }

        // Update product sales count
        product.sales = (product.sales || 0) + item.qty;
        await product.save();

        // Get seller details
        const seller = await User.findById(item.seller);
        if (!seller) {
          console.log('Seller not found:', item.seller);
          continue;
        }

        // Create seller sales record
        const sellerSale = new SellerSales({
          seller: item.seller,
          order: order._id,
          product: item.product,
          productName: item.name,
          quantity: item.qty,
          price: item.price,
          totalAmount: item.price * item.qty,
          customerName: order.user.name || 'Customer',
          customerEmail: order.user.email || 'No email provided',
          orderDate: order.paidAt,
          status: 'completed',
        });

        await sellerSale.save();
        console.log(`Sales data recorded for seller ${seller.name} for product ${item.name}`);
      }
    } catch (error) {
      console.error('Error recording seller sales data:', error);
      // We don't want to fail the order payment if recording sales fails
      // Just log the error and continue
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
}; 