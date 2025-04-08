const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5001',
      'https://beam-shop.onrender.com',
      'https://beam-shopping.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket'],
  maxHttpBufferSize: 1e6 // 1 MB
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Store user ID when they connect
  let userId = null;
  let heartbeatInterval;
  
  console.log(`Socket connected: ${socket.id}`);
  
  // Handle authentication
  socket.on('authenticate', (data) => {
    if (!data || !data.userId) {
      console.log(`Socket ${socket.id} authentication failed - no userId provided`);
      socket.emit('auth_error', { message: 'Authentication failed - userId required' });
      return;
    }
    
    try {
      userId = data.userId;
      // Leave any previous room if user was already in one
      if (socket.userData && socket.userData.room) {
        socket.leave(socket.userData.room);
      }
      
      const room = `user-${userId}`;
      // Join a room specific to this user
      socket.join(room);
      socket.userData = { userId, room };
      
      console.log(`Socket ${socket.id} authenticated for user ${userId}`);
      
      // Start heartbeat for this connection
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      heartbeatInterval = setInterval(() => {
        socket.emit('ping');
      }, 30000);
      
      // Inform the client authentication was successful
      socket.emit('authenticated', { 
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Socket ${socket.id} authentication error:`, error);
      socket.emit('auth_error', { message: 'Authentication failed - internal error' });
    }
  });
  
  // Handle cart updates with validation
  socket.on('cart_update', (data) => {
    if (!userId) {
      console.log(`Socket ${socket.id} attempted cart update without authentication`);
      socket.emit('auth_error', { message: 'Authentication required for cart updates' });
      return;
    }
    
    if (!data || !data.cart || !Array.isArray(data.cart)) {
      console.log(`Socket ${socket.id} sent invalid cart update data`);
      socket.emit('error', { message: 'Invalid cart data format' });
      return;
    }
    
    try {
      // Validate cart items
      const validCart = data.cart.every(item => 
        item && 
        item.productId && 
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
      
      if (!validCart) {
        socket.emit('error', { message: 'Invalid cart item format' });
        return;
      }
      
      console.log(`Valid cart update received from user ${userId}`);
      
      // Broadcast to all other devices of the same user
      socket.to(`user-${userId}`).emit('cart_updated', {
        cart: data.cart,
        userId: userId,
        timestamp: new Date().toISOString(),
        source: socket.id
      });
    } catch (error) {
      console.error(`Error processing cart update from socket ${socket.id}:`, error);
      socket.emit('error', { message: 'Error processing cart update' });
    }
  });
  
  // Handle heartbeat response
  socket.on('pong', () => {
    // Update last activity timestamp
    socket.lastPong = Date.now();
  });
  
  socket.on('error', (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id} disconnected: ${reason}`);
    if (userId) {
      socket.leave(`user-${userId}`);
    }
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  });
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://beam-shop.onrender.com',
    'https://beam-shopping.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'user-id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json()); // JSON parser

// Simple request logger - reduced logging
app.use((req, res, next) => {
  // Only log API routes and exclude common operations like health checks
  if (req.path.startsWith('/api/') && 
      !req.path.includes('/health') && 
      !req.path.includes('/heartbeat')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend (React/Vite) in both dev and prod
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all for frontend routing (except API)
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
  } else {
    // If it's an API route that wasn't handled, return 404
    res.status(404).json({ message: 'API endpoint not found' });
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

// Make io available to our router
app.set('io', io);

// Start server (using the HTTP server that wraps the Express app)
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
