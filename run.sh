#!/bin/bash

# Display ASCII art for Beam
echo "
██████╗ ███████╗ █████╗ ███╗   ███╗
██╔══██╗██╔════╝██╔══██╗████╗ ████║
██████╔╝█████╗  ███████║██╔████╔██║
██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║
██████╔╝███████╗██║  ██║██║ ╚═╝ ██║
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
                                   
E-commerce Platform
"

echo "Starting Beam..."
echo "=============================="

# Start MongoDB if not already running
echo "Checking MongoDB status..."
if ! brew services list | grep mongodb-community | grep started > /dev/null; then
  echo "Starting MongoDB..."
  brew services start mongodb-community
  echo "MongoDB started."
else
  echo "MongoDB is already running."
fi

# Define terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start the backend server
echo -e "${BLUE}Starting backend server...${NC}"
cd backend && npm run server &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Wait a bit for backend to initialize
sleep 2

# Start the frontend development server
echo -e "${BLUE}Starting frontend development server...${NC}"
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"

echo -e "${GREEN}Beam is running!${NC}"
echo "Backend API: http://localhost:5001/api"
echo "Frontend: http://localhost:5173"
echo "=============================="
echo "Press Ctrl+C to stop both servers"

# Handle cleanup when script is terminated
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Shutting down Beam...'; exit" INT TERM

# Keep the script running
wait 