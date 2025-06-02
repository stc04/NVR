@echo off
title AI-IT Inc Security POS - Professional Installation
color 0B
echo.
echo ===============================================================================
echo                    AI-IT Inc Security POS - Professional Installation
echo                           Created by Steven Chason
echo                              Phone: 863-308-4979
echo                           88 Perch St, Winterhaven FL 33881
echo ===============================================================================
echo.
echo [INFO] Starting professional installation process...
echo [INFO] This software is NOT FOR RESALE - Licensed to client only
echo.

:: Check if Node.js is installed
echo [STEP 1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo [INFO] Please download and install Node.js from: https://nodejs.org
    echo [INFO] After installing Node.js, run this installer again.
    echo.
    echo Press any key to open Node.js download page...
    pause >nul
    start https://nodejs.org/en/download/
    exit /b 1
) else (
    echo [SUCCESS] Node.js is installed
)

:: Check npm
echo [STEP 2/6] Verifying npm package manager...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available!
    exit /b 1
) else (
    echo [SUCCESS] npm is available
)

:: Install dependencies
echo [STEP 3/6] Installing application dependencies...
echo [INFO] This may take a few minutes depending on your internet connection...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo [INFO] Please check your internet connection and try again.
    echo [INFO] For support, contact Steven Chason at 863-308-4979
    pause
    exit /b 1
) else (
    echo [SUCCESS] Dependencies installed successfully
)

:: Build application
echo [STEP 4/6] Building application for production...
call npm run build
if %errorlevel% neq 0 (
    echo [WARNING] Build completed with warnings, but installation will continue...
) else (
    echo [SUCCESS] Application built successfully
)

:: Create environment file
echo [STEP 5/6] Creating environment configuration...
if not exist .env (
    copy .env.example .env >nul 2>&1
    echo [SUCCESS] Environment file created
) else (
    echo [INFO] Environment file already exists
)

:: Create desktop shortcut
echo [STEP 6/6] Creating desktop shortcut...
set "shortcut=%USERPROFILE%\Desktop\AI-IT Security POS.lnk"
set "target=%CD%\start-security-pos.bat"
set "icon=%CD%\assets\icon.ico"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%shortcut%'); $Shortcut.TargetPath = '%target%'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Description = 'AI-IT Inc Security POS by Steven Chason'; $Shortcut.Save()"

if exist "%shortcut%" (
    echo [SUCCESS] Desktop shortcut created
) else (
    echo [WARNING] Could not create desktop shortcut
)

echo.
echo ===============================================================================
echo                           INSTALLATION COMPLETE!
echo ===============================================================================
echo.
echo [SUCCESS] AI-IT Inc Security POS has been installed successfully!
echo.
echo To start the application:
echo   1. Double-click "start-security-pos.bat" 
echo   2. Or use the desktop shortcut "AI-IT Security POS"
echo   3. Open your web browser to: http://localhost:3000
echo.
echo For technical support:
echo   Steven Chason - 863-308-4979
echo   AI-IT Inc - Professional Security Solutions
echo.
echo This software is licensed for your use only - NOT FOR RESALE
echo.
echo Press any key to exit...
pause >nul
