const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Auth user & get user data
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  console.log('Login attempt:', { email: req.body.email });
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    console.log('Login successful for user:', user._id);
    
    // Generate token
    const token = user.generateToken();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      token
    });
  } else {
    console.log('Login failed: Invalid email or password');
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  console.log('Registration attempt:', { name: req.body.name, email: req.body.email });
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    console.log('Registration failed: User already exists');
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    console.log('Registration successful for user:', user._id);
    
    // Generate token
    const token = user.generateToken();
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo,
      token
    });
  } else {
    console.log('Registration failed: Invalid user data');
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Google authentication
// @route   POST /api/users/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  console.log('Google auth request received:', req.body);
  const { googleId, email, name, avatar } = req.body;

  if (!googleId || !email) {
    console.log('Google auth failed: Missing required fields');
    res.status(400);
    throw new Error('Google ID and email are required');
  }

  // Check if user exists
  let user = await User.findOne({ email });
  console.log('User lookup result:', user ? 'User found' : 'User not found');

  if (user) {
    // If user exists but doesn't have googleId, update it
    if (!user.googleId) {
      console.log('Updating existing user with Google ID');
      user.googleId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    // Create new user
    console.log('Creating new user with Google credentials');
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      password: Math.random().toString(36).slice(-8) // Generate random password
    });
  }

  // Generate token
  const token = user.generateToken();

  console.log('Google auth successful for user:', user._id);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    sellerInfo: user.sellerInfo,
    token
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      sellerInfo: user.sellerInfo
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
  console.log('Updating user profile with data:', req.body);
  
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Handle password update if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Handle seller information if provided
    if (req.body.isSeller !== undefined) {
      user.isSeller = req.body.isSeller;
    }
    
    if (req.body.sellerInfo) {
      user.sellerInfo = {
        ...user.sellerInfo,
        ...req.body.sellerInfo
      };
    }

    const updatedUser = await user.save();
    console.log('User profile updated successfully');

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isSeller: updatedUser.isSeller,
      sellerInfo: updatedUser.sellerInfo
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

// Simple rate limiter for cart requests
const cartRequestLimiter = {
  requests: new Map(),
  maxRequestsPerMinute: 10,
  resetTime: 60000, // 1 minute

  canProcess(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || { count: 0, resetAt: now + this.resetTime };
    
    // Reset counter if time has elapsed
    if (now > userRequests.resetAt) {
      userRequests.count = 0;
      userRequests.resetAt = now + this.resetTime;
    }
    
    // Check if user has exceeded limit
    if (userRequests.count >= this.maxRequestsPerMinute) {
      return false;
    }
    
    // Increment counter
    userRequests.count++;
    this.requests.set(userId, userRequests);
    return true;
  }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
  // Add rate limiting
  if (!cartRequestLimiter.canProcess(req.user._id.toString())) {
    res.status(429);
    throw new Error('Too many requests. Please try again later.');
  }
  
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Return the user's cart from their profile
      res.json(user.cart || []);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error(`Error in getUserCart: ${error.message}`);
    res.status(500);
    throw new Error(`Error retrieving cart: ${error.message}`);
  }
});

// @desc    Update user cart
// @route   PUT /api/users/cart
// @access  Private
const updateUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items must be an array'
      });
    }
    
    // Rate limiting
    if (!cartRequestLimiter.canProcess(user._id.toString())) {
      return res.status(429).json({
        success: false,
        message: 'Too many cart updates. Please try again in a moment.'
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
    
    // Emit socket event for real-time cart updates
    const io = req.app.get('io');
    if (io) {
      const userRoomId = `user-${user._id}`;
      
      // Broadcast to all devices for this user
      io.to(userRoomId).emit('cart_updated', {
        cart: updatedUser.cart,
        userId: user._id.toString(),
        timestamp: new Date().toISOString(),
        source: 'server'
      });
    }

    res.json({
      success: true,
      cart: updatedUser.cart
    });
  } catch (error) {
    console.error(`Error updating cart: ${error.message}`);
    res.status(400);
    throw new Error('Error updating cart: ' + error.message);
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
  updateUserCart,
  getUserCart
}; 