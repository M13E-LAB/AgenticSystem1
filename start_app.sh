#!/bin/bash

# 🚀 Multi-Agent Research Assistant - Startup Script
# This script starts both backend and frontend

echo "🚀 Starting Multi-Agent Research Assistant..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start Backend
echo -e "${GREEN}📊 Starting Backend API...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    touch venv/.installed
fi

# Start backend
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started on http://localhost:8000${NC}"

cd ..

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node dependencies...${NC}"
    npm install
fi

# Start frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started on http://localhost:5173${NC}"

cd ..

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Application is running!${NC}"
echo ""
echo "  📊 Backend API: http://localhost:8000"
echo "  📚 API Docs:    http://localhost:8000/docs"
echo "  🎨 Frontend:    http://localhost:5173"
echo "  🏗️  Architecture: http://localhost:5173/architecture"
echo ""
echo "  Note: Grafana is running on http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo "=============================================="

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

