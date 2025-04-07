const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Middleware to protect routes - checks if user exists
const protect = asyncHandler(async (req, res, next) => {
  console.log('Headers received:', req.headers);
  const userId = req.headers['user-id'];
  
  if (!userId) {
    console.log('No user ID provided in headers');
    res.status(401);
    throw new Error('Not authorized, no user ID provided');
  }
  
  console.log(`Authenticating user with ID: ${userId}`);
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    
    console.log(`User authenticated: ${user.name}`);
    req.user = user;
    next();
  } catch (error) {
    console.error(`Error in protect middleware: ${error.message}`);
    res.status(401);
    throw new Error(`Not authorized: ${error.message}`);
  }
});

// Middleware to verify if user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Middleware to verify if user is a seller
const sellerAuth = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a seller');
  }
};

module.exports = { protect, admin, sellerAuth }; 