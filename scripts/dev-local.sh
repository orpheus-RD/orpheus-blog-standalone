#!/bin/bash
# =============================================================================
# Local Development Script
# Starts both frontend and backend for local development
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Orpheus Blog Local Development ===${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your configuration before continuing.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pnpm install
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
pnpm dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 3

# Start frontend
echo -e "${GREEN}Starting frontend dev server...${NC}"
pnpm dev:client &
FRONTEND_PID=$!

echo -e "${GREEN}"
echo "==================================="
echo "  Development servers started!"
echo "==================================="
echo -e "${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait
