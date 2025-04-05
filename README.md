# Beam - MERN Stack Application

This is a MERN (MongoDB, Express.js, React, Node.js) stack application.

## Project Structure

```
beam/
├── frontend/     # React frontend (Vite)
└── backend/      # Node.js/Express backend
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/beam
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Running the Application

1. Start the backend server (from the backend directory):
   ```bash
   npm run dev
   ```

2. In a new terminal, start the frontend development server (from the frontend directory):
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

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