const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getSellerProducts,
} = require('../controllers/productController');
const { protect, admin, sellerAuth } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getProducts);
router.get('/top', getTopProducts);

// Seller routes - must come before :id routes to avoid conflict
router.route('/seller').get(protect, sellerAuth, getSellerProducts);

// Product details route
router.route('/:id').get(getProductById);

// Private routes
router.route('/:id/reviews').post(protect, createProductReview);

// Admin and Seller routes for creating products
router
  .route('/')
  .post(protect, (req, res, next) => {
    // Allow both sellers and admins to create products
    if (req.user.isAdmin || req.user.isSeller) {
      return next();
    }
    res.status(401);
    throw new Error('Not authorized as an admin or seller');
  }, createProduct);

// Admin and Seller routes for updating products
// The product controller will verify that sellers can only update their own products
router
  .route('/:id')
  .delete(protect, admin, deleteProduct)
  .put(protect, (req, res, next) => {
    // Allow both sellers and admins to update products
    // The controller will verify product ownership for sellers
    if (req.user.isAdmin || req.user.isSeller) {
      return next();
    }
    res.status(401);
    throw new Error('Not authorized as an admin or seller');
  }, updateProduct);

module.exports = router; 