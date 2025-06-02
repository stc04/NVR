#!/bin/bash

# AI-IT Inc Security POS - Professional Startup Script
# Created by Steven Chason - 863-308-4979
# NOT FOR RESALE - Licensed Software

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Professional header
echo -e "${CYAN}===============================================================================${NC}"
echo -e "${WHITE}                AI-IT Inc Security POS - Starting...${NC}"
echo -e "${YELLOW}                        Created by Steven Chason${NC}"
echo -e "${YELLOW}                           Phone: 863-308-4979${NC}"
echo -e "${YELLOW}                      88 Perch St, Winterhaven FL 33881${NC}"
echo -e "${CYAN}===============================================================================${NC}"
echo ""
echo -e "${GREEN}[INFO] Starting AI-IT Inc Security POS system...${NC}"
echo -e "${YELLOW}[INFO] This software is NOT FOR RESALE - Licensed to client only${NC}"
echo -e "${GREEN}[INFO] Opening web browser to http://localhost:3000${NC}"
echo -e "${YELLOW}[INFO] Press Ctrl+C to stop the server${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed!${NC}"
    echo -e "${YELLOW}[INFO] Please install Node.js from: https://nodejs.org${NC}"
    echo -e "${YELLOW}[INFO] For support, contact Steven Chason at 863-308-4979${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed!${NC}"
    echo -e "${YELLOW}[INFO] Please install Node.js from: https://nodejs.org${NC}"
    echo -e "${YELLOW}[INFO] For support, contact Steven Chason at 863-308-4979${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${RED}[ERROR] Dependencies not installed!${NC}"
    echo -e "${YELLOW}[INFO] Please run the installation script first.${NC}"
    echo -e "${YELLOW}[INFO] For support, contact Steven Chason at 863-308-4979${NC}"
    exit 1
fi

# Function to open browser (cross-platform)
open_browser() {
    local url="http://localhost:3000"
    
    if command -v xdg-open &> /dev/null; then
        xdg-open "$url" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "$url" &> /dev/null &
    elif command -v start &> /dev/null; then
        start "$url" &> /dev/null &
    else
        echo -e "${YELLOW}[INFO] Please open your browser manually to: $url${NC}"
    fi
}

# Start the application
echo -e "${GREEN}[SUCCESS] Starting AI-IT Inc Security POS...${NC}"

# Open browser after a short delay
(sleep 3 && open_browser) &

# Start the Next.js application
npm run start

echo ""
echo -e "${YELLOW}[INFO] AI-IT Inc Security POS has been stopped.${NC}"
echo -e "${YELLOW}[INFO] For support, contact Steven Chason at 863-308-4979${NC}"
echo -e "${CYAN}[INFO] Thank you for using AI-IT Inc professional security solutions!${NC}"
