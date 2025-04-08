const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const sellerRoutes = require('./src/routes/sellerRoutes');

// Load environment variables before anything else
dotenv.config();
const PORT = process.env.PORT || 5001;
console.log('Environment loaded, PORT =', PORT);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5001','https://beam-shop.onrender.com','https://beam-shopping.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'user-id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json()); // JSON parser

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (['POST', 'PUT'].includes(req.method)) {
    console.log('Body:', req.body);
  }
  next();
});

// Serve static frontend (React/Vite) in both dev and 
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sellers', sellerRoutes);

// Health check & PayPal config route
app.get('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

// Catch-all for frontend routing (except API)
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  } else {
    next();
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Global error safety
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
