# AI-IT Inc - Network Bridge Startup Script (Windows)
# Creator: Steven Chason
# Company: AI-IT Inc
# Address: 88 Perch St, Winterhaven FL 33881
# Phone: 863-308-4979
# 
# NOT FOR RESALE - Proprietary Software
# © 2024 AI-IT Inc. All rights reserved.

Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                           AI-IT Network Bridge                              ║" -ForegroundColor Cyan
Write-Host "║                                                                              ║" -ForegroundColor Cyan
Write-Host "║  Creator: Steven Chason                                                      ║" -ForegroundColor Cyan
Write-Host "║  Company: AI-IT Inc                                                          ║" -ForegroundColor Cyan
Write-Host "║  Address: 88 Perch St, Winterhaven FL 33881                                 ║" -ForegroundColor Cyan
Write-Host "║  Phone: 863-308-4979                                                         ║" -ForegroundColor Cyan
Write-Host "║                                                                              ║" -ForegroundColor Cyan
Write-Host "║  Starting Network Bridge Service...                                         ║" -ForegroundColor Cyan
Write-Host "║                                                                              ║" -ForegroundColor Cyan
Write-Host "║  NOT FOR RESALE - Proprietary Software                                      ║" -ForegroundColor Cyan
Write-Host "║  © 2024 AI-IT Inc. All rights reserved.                                     ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js version
$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Load environment variables if .env exists
if (Test-Path ".env") {
    Write-Host "🔧 Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Set default port if not specified
if (-not $env:NETWORK_BRIDGE_PORT) {
    $env:NETWORK_BRIDGE_PORT = "3001"
}

Write-Host ""
Write-Host "🚀 Starting AI-IT Network Bridge on port $env:NETWORK_BRIDGE_PORT..." -ForegroundColor Green
Write-Host "🌐 Service will be available at: http://localhost:$env:NETWORK_BRIDGE_PORT" -ForegroundColor Cyan
Write-Host "📊 Health check endpoint: http://localhost:$env:NETWORK_BRIDGE_PORT/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the network bridge service
try {
    npx ts-node lib/network-bridge-server.ts
} catch {
    Write-Host ""
    Write-Host "🛑 AI-IT Network Bridge stopped" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
