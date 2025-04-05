#!/bin/bash
export NODE_ENV=development
export PORT=5001
export MONGODB_URI=mongodb://localhost:27017/beam_ecommerce
export JWT_SECRET=your_jwt_secret

node server.js 