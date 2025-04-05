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
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getProducts);
router.get('/top', getTopProducts);
router.route('/:id').get(getProductById);

// Private routes
router.route('/:id/reviews').post(protect, createProductReview);

// Admin routes
router
  .route('/')
  .post(protect, admin, createProduct);

router
  .route('/:id')
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

module.exports = router; 