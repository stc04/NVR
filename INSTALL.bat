@echo off
title AI-IT Inc Security POS - Installation
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    AI-IT Inc Security POS System                            ║
echo ║                              INSTALLATION                                   ║
echo ╠══════════════════════════════════════════════════════════════════════════════╣
echo ║  Creator: Steven Chason                                                      ║
echo ║  Company: AI-IT Inc                                                          ║
echo ║  Phone: 863-308-4979                                                         ║
echo ║  Address: 88 Perch St, Winterhaven FL 33881                                 ║
echo ╠══════════════════════════════════════════════════════════════════════════════╣
echo ║  NOT FOR RESALE - Proprietary Software                                      ║
echo ║  © 2024 AI-IT Inc. All rights reserved.                                     ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org
    echo Then run this installer again.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.
echo 📦 Installing AI-IT Security POS System...
echo.

npm run install-client

if errorlevel 1 (
    echo.
    echo ❌ Installation failed!
    echo.
    echo 📞 For support, contact:
    echo    Steven Chason - AI-IT Inc
    echo    Phone: 863-308-4979
    echo    Email: support@ai-itinc.com
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 Installation completed successfully!
echo.
echo To start the system, double-click: start-security-pos.bat
echo.
pause
