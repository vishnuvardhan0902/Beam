const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isSeller, sellerInfo } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create new user
  const userData = {
    name,
    email,
    password,
    isSeller: isSeller || false,
  };
  
  // Add sellerInfo if user is registering as a seller
  if (isSeller && sellerInfo) {
    userData.sellerInfo = sellerInfo;
  }
  
  const user = await User.create(userData);

  if (user) {
    // If user is created successfully, send back user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      avatar: user.avatar,
      createdAt: user.createdAt,
      cart: user.cart || [],
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Handle seller status update
    if (req.body.isSeller !== undefined) {
      user.isSeller = req.body.isSeller;
    }
    
    // Handle seller info if provided
    if (req.body.sellerInfo) {
      user.sellerInfo = {
        ...user.sellerInfo || {}, // Keep existing sellerInfo if any
        ...req.body.sellerInfo
      };
    }
    
    // Update password if it's provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isSeller: updatedUser.isSeller,
      sellerInfo: updatedUser.sellerInfo,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Auth user with Google & get token
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { googleId, email, name, avatar } = req.body;

  if (!googleId || !email) {
    res.status(400);
    throw new Error('Missing required fields for Google authentication');
  }

  // Check if user already exists by googleId
  let user = await User.findOne({ googleId });

  // If not found by googleId, try to find by email
  if (!user) {
    user = await User.findOne({ email });
    
    // If user exists with this email but no googleId, update the user with googleId
    if (user) {
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      await user.save();
    } else {
      // Create a new user with Google data
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password for Google users
      });
    }
  }

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid Google user data');
  }
});

// @desc    Update user cart
// @route   PUT /api/users/cart
// @access  Private
const updateUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    try {
      // Validate cart items
      const cartItems = req.body.cartItems || [];
      
      // Check if cartItems is an array
      if (!Array.isArray(cartItems)) {
        return res.status(400).json({
          success: false,
          message: 'Cart items must be an array'
        });
      }
      
      // Validate cart item structure
      for (const item of cartItems) {
        if (!item.productId || !item.name || !item.image || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Invalid cart item structure'
          });
        }
      }
      
      // Update cart items
      user.cart = cartItems;
      
      const updatedUser = await user.save();

      res.json({
        success: true,
        cart: updatedUser.cart
      });
    } catch (error) {
      res.status(400);
      throw new Error('Error updating cart: ' + error.message);
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  googleAuth,
  updateUserCart
}; 