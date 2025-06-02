#!/bin/bash

# AI-IT Inc - Network Bridge Startup Script
# Creator: Steven Chason
# Company: AI-IT Inc
# Address: 88 Perch St, Winterhaven FL 33881
# Phone: 863-308-4979
# 
# NOT FOR RESALE - Proprietary Software
# © 2024 AI-IT Inc. All rights reserved.

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                           AI-IT Network Bridge                              ║"
echo "║                                                                              ║"
echo "║  Creator: Steven Chason                                                      ║"
echo "║  Company: AI-IT Inc                                                          ║"
echo "║  Address: 88 Perch St, Winterhaven FL 33881                                 ║"
echo "║  Phone: 863-308-4979                                                         ║"
echo "║                                                                              ║"
echo "║  Starting Network Bridge Service...                                         ║"
echo "║                                                                              ║"
echo "║  NOT FOR RESALE - Proprietary Software                                      ║"
echo "║  © 2024 AI-IT Inc. All rights reserved.                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx is not available. Please ensure npm is properly installed."
    exit 1
fi

# Set environment variables if .env exists
if [ -f ".env" ]; then
    echo "🔧 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default port if not specified
if [ -z "$NETWORK_BRIDGE_PORT" ]; then
    export NETWORK_BRIDGE_PORT=3001
fi

echo "🚀 Starting AI-IT Network Bridge on port $NETWORK_BRIDGE_PORT..."
echo "🌐 Service will be available at: http://localhost:$NETWORK_BRIDGE_PORT"
echo "📊 Health check endpoint: http://localhost:$NETWORK_BRIDGE_PORT/health"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the network bridge service
npx ts-node lib/network-bridge-server.ts

# Handle cleanup on exit
trap 'echo ""; echo "🛑 Shutting down AI-IT Network Bridge..."; exit 0' INT TERM
