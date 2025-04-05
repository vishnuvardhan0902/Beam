# Beam E-commerce Backend

This is the backend API for the Beam e-commerce application built with Node.js, Express, and MongoDB.

## Features

- RESTful API with Express
- MongoDB database with Mongoose ODM
- Authentication with JSON Web Tokens (JWT)
- User, Product, and Order models with complete CRUD operations
- Error handling middleware
- Data validation
- Development tools: Nodemon for auto-restart on changes

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local installation or MongoDB Atlas)

## Setup

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a .env file in the root of the backend directory with the following variables:

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/beam_ecommerce
JWT_SECRET=your_jwt_secret
```

## Running the Server

### Development mode

```
npm run server
```

### Production mode

```
npm start
```

## Seed the Database

### Import data

```
npm run data:import
```

### Destroy data

```
npm run data:destroy
```

## API Endpoints

### Products

- GET /api/products - Get all products
- GET /api/products/:id - Get a product by ID
- GET /api/products/top - Get top rated products
- POST /api/products - Create a new product (Admin only)
- PUT /api/products/:id - Update a product (Admin only)
- DELETE /api/products/:id - Delete a product (Admin only)
- POST /api/products/:id/reviews - Create a product review

### Users

- POST /api/users - Register a new user
- POST /api/users/login - Authenticate user & get token
- GET /api/users/profile - Get user profile (Protected)
- PUT /api/users/profile - Update user profile (Protected)
- GET /api/users - Get all users (Admin only)
- GET /api/users/:id - Get a user by ID (Admin only)
- PUT /api/users/:id - Update a user (Admin only)
- DELETE /api/users/:id - Delete a user (Admin only)

### Orders

- POST /api/orders - Create a new order
- GET /api/orders/:id - Get an order by ID
- PUT /api/orders/:id/pay - Update order to paid status
- PUT /api/orders/:id/deliver - Update order to delivered status
- GET /api/orders/myorders - Get logged in user's orders
- GET /api/orders - Get all orders (Admin only) 