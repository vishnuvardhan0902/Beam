const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const sellerRoutes = require('./src/routes/sellerRoutes');
const path = require('path');

// Load environment variables
dotenv.config();
console.log('Environment loaded, PORT=', process.env.PORT);

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001', 'https://beam-frontend.onrender.com'],  // Add all your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // Parse JSON request bodies

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body));
  }
  next();
});

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sellers', sellerRoutes);

// Create a simple health check endpoint
app.get('/api/config/paypal', (req, res) => 
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
);

// Root route for API check
app.get('/', (req, res) => {
  res.send('API is running on port ' + process.env.PORT);
});

// Serve static assets in both production and development
// Set static folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Any route that is not API will be redirected to index.html
app.get('*', (req, res, next) => {
  // Only redirect non-API routes to frontend
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  } else {
    next();
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 