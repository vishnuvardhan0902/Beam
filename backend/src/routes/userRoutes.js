const express = require('express');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  googleAuth,
  updateUserCart,
  getUserCart,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authUser);
router.post('/google', googleAuth);
router.post('/google-login', googleAuth);

// Add the cart route first (specific routes should come before parameterized routes)
router.route('/cart')
  .get(protect, getUserCart)
  .put(protect, updateUserCart);

// Private routes (require authentication)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router; 