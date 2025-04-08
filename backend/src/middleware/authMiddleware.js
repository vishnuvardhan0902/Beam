const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  console.log('Headers received:', req.headers);
  let token;

  // Check for Authorization header or user-id header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['user-id']) {
    // Fallback to user-id header for backward compatibility
    const userId = req.headers['user-id'];
    console.log(`Using user-id header: ${userId}`);
    
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`User not found with ID: ${userId}`);
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      
      console.log(`User authenticated by ID: ${user.name}`);
      req.user = user;
      return next();
    } catch (error) {
      console.error(`Error in protect middleware using user-id: ${error.message}`);
      res.status(401);
      throw new Error(`Not authorized: ${error.message}`);
    }
  }
  
  // Check if token exists
  if (!token) {
    console.log('No token provided');
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'somesecrettoken');
    
    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }
    
    console.log(`User authenticated by token: ${req.user.name}`);
    next();
  } catch (error) {
    console.error(`Error in protect middleware: ${error.message}`);
    res.status(401);
    throw new Error('Not authorized, token failed');
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
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a seller');
  }
};

module.exports = { protect, admin, sellerAuth }; 