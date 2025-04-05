# Beam E-commerce Platform

A modern e-commerce platform with a React frontend and Express/MongoDB backend.

## Project Structure

- `frontend/`: React application with Tailwind CSS styling
- `backend/`: Express.js API server with MongoDB integration

## Setup and Running

### Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the development server
npm run server

# Or start with node directly
node server.js
```

### Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/beam_ecommerce
JWT_SECRET=your_jwt_secret
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

## Features

- User authentication (register, login, profile management)
- Product browsing and search
- Shopping cart functionality
- Order processing and history
- Admin dashboard for product and order management

## Technologies Used

- Frontend:
  - React (with TypeScript)
  - Vite
  - React Router DOM
  
- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - CORS
  - dotenv 