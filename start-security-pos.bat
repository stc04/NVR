@echo off
title AI-IT Inc Security POS - Professional System
color 0B
echo.
echo ===============================================================================
echo                    AI-IT Inc Security POS - Starting...
echo                           Created by Steven Chason
echo                              Phone: 863-308-4979
echo                           88 Perch St, Winterhaven FL 33881
echo ===============================================================================
echo.
echo [INFO] Starting AI-IT Inc Security POS system...
echo [INFO] This software is NOT FOR RESALE - Licensed to client only
echo [INFO] Opening web browser to http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo [INFO] Please run INSTALL.bat first to install dependencies.
    echo [INFO] For support, contact Steven Chason at 863-308-4979
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo [INFO] Please run INSTALL.bat first to install dependencies.
    echo [INFO] For support, contact Steven Chason at 863-308-4979
    pause
    exit /b 1
)

:: Start the application
echo [SUCCESS] Starting AI-IT Inc Security POS...
start http://localhost:3000
npm run start

echo.
echo [INFO] AI-IT Inc Security POS has been stopped.
echo [INFO] For support, contact Steven Chason at 863-308-4979
echo [INFO] Thank you for using AI-IT Inc professional security solutions!
pause
