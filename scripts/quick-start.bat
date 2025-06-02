@echo off
title Security POS System - Quick Start

echo ========================================
echo   Security POS System - Quick Start
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator: OK
) else (
    echo ERROR: This script requires Administrator privileges.
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Checking system requirements...

REM Check Node.js
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo Node.js: OK
) else (
    echo ERROR: Node.js not found. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check FFmpeg
ffmpeg -version >nul 2>&1
if %errorLevel% == 0 (
    echo FFmpeg: OK
) else (
    echo WARNING: FFmpeg not found. Media server may not work properly.
    echo Install with: choco install ffmpeg
)

REM Check if installation exists
if not exist "C:\SecurityPOS" (
    echo.
    echo Installation not found. Running full installation...
    echo This may take several minutes...
    echo.
    
    REM Run PowerShell installation script
    powershell -ExecutionPolicy Bypass -File "%~dp0install-windows.ps1"
    
    if %errorLevel% neq 0 (
        echo Installation failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

echo.
echo Starting Security POS System...
cd /d C:\SecurityPOS

REM Start services with PM2
pm2 start ecosystem.config.js

if %errorLevel% == 0 (
    echo.
    echo ========================================
    echo   System Started Successfully!
    echo ========================================
    echo.
    echo Access URLs:
    echo   Frontend:      http://localhost:3000
    echo   Media Server:  http://localhost:8000
    echo   Network Bridge: http://localhost:3001
    echo.
    echo Management Commands:
    echo   View Status:   pm2 status
    echo   View Logs:     pm2 logs
    echo   Stop System:   pm2 stop all
    echo   Restart:       pm2 restart all
    echo.
    echo Opening frontend in browser...
    timeout /t 3 /nobreak >nul
    start http://localhost:3000
) else (
    echo Failed to start system. Check the error messages above.
)

echo.
pause
