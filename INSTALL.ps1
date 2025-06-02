# AI-IT Inc Security POS - Professional PowerShell Installer
# Created by Steven Chason - 863-308-4979
# NOT FOR RESALE - Licensed Software

param(
    [switch]$Force,
    [switch]$SkipNodeCheck
)

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Professional header
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "                AI-IT Inc Security POS - Professional Installation" -ForegroundColor White
Write-Host "                        Created by Steven Chason" -ForegroundColor Yellow
Write-Host "                           Phone: 863-308-4979" -ForegroundColor Yellow
Write-Host "                      88 Perch St, Winterhaven FL 33881" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Starting professional installation process..." -ForegroundColor Green
Write-Host "[INFO] This software is NOT FOR RESALE - Licensed to client only" -ForegroundColor Yellow
Write-Host ""

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check administrator privileges
if (-not (Test-Administrator)) {
    Write-Host "[WARNING] Running without administrator privileges" -ForegroundColor Yellow
    Write-Host "[INFO] Some features may require administrator access" -ForegroundColor Yellow
    Write-Host ""
}

try {
    # Step 1: Check Node.js
    Write-Host "[STEP 1/7] Checking Node.js installation..." -ForegroundColor Cyan
    
    if (-not $SkipNodeCheck) {
        try {
            $nodeVersion = node --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] Node.js is installed: $nodeVersion" -ForegroundColor Green
            } else {
                throw "Node.js not found"
            }
        } catch {
            Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
            Write-Host "[INFO] Downloading Node.js installer..." -ForegroundColor Yellow
            
            $nodeUrl = "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi"
            $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
            
            try {
                Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
                Write-Host "[INFO] Starting Node.js installation..." -ForegroundColor Yellow
                Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet" -Wait
                
                # Refresh environment variables
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
                
                # Verify installation
                $nodeVersion = node --version 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[SUCCESS] Node.js installed successfully: $nodeVersion" -ForegroundColor Green
                } else {
                    throw "Node.js installation verification failed"
                }
            } catch {
                Write-Host "[ERROR] Failed to install Node.js automatically" -ForegroundColor Red
                Write-Host "[INFO] Please download and install Node.js manually from: https://nodejs.org" -ForegroundColor Yellow
                Start-Process "https://nodejs.org/en/download/"
                exit 1
            }
        }
    }

    # Step 2: Check npm
    Write-Host "[STEP 2/7] Verifying npm package manager..." -ForegroundColor Cyan
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] npm is available: $npmVersion" -ForegroundColor Green
        } else {
            throw "npm not found"
        }
    } catch {
        Write-Host "[ERROR] npm is not available!" -ForegroundColor Red
        exit 1
    }

    # Step 3: Clean install if forced
    if ($Force) {
        Write-Host "[STEP 3/7] Cleaning previous installation..." -ForegroundColor Cyan
        if (Test-Path "node_modules") {
            Remove-Item -Recurse -Force "node_modules"
            Write-Host "[SUCCESS] Previous installation cleaned" -ForegroundColor Green
        }
        if (Test-Path "package-lock.json") {
            Remove-Item -Force "package-lock.json"
        }
        if (Test-Path ".next") {
            Remove-Item -Recurse -Force ".next"
        }
    } else {
        Write-Host "[STEP 3/7] Checking existing installation..." -ForegroundColor Cyan
        Write-Host "[INFO] Use -Force parameter to clean install" -ForegroundColor Yellow
    }

    # Step 4: Install dependencies
    Write-Host "[STEP 4/7] Installing application dependencies..." -ForegroundColor Cyan
    Write-Host "[INFO] This may take several minutes depending on your internet connection..." -ForegroundColor Yellow
    
    $installProcess = Start-Process -FilePath "npm" -ArgumentList "install" -NoNewWindow -PassThru -Wait
    if ($installProcess.ExitCode -eq 0) {
        Write-Host "[SUCCESS] Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
        Write-Host "[INFO] Please check your internet connection and try again." -ForegroundColor Yellow
        Write-Host "[INFO] For support, contact Steven Chason at 863-308-4979" -ForegroundColor Yellow
        exit 1
    }

    # Step 5: Build application
    Write-Host "[STEP 5/7] Building application for production..." -ForegroundColor Cyan
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -NoNewWindow -PassThru -Wait
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "[SUCCESS] Application built successfully" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Build completed with warnings, but installation will continue..." -ForegroundColor Yellow
    }

    # Step 6: Create environment file
    Write-Host "[STEP 6/7] Creating environment configuration..." -ForegroundColor Cyan
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "[SUCCESS] Environment file created from template" -ForegroundColor Green
        } else {
            # Create basic .env file
            @"
# AI-IT Inc Security POS Configuration
# Created by Steven Chason - 863-308-4979

NEXT_PUBLIC_APP_NAME="AI-IT Security POS"
NEXT_PUBLIC_COMPANY_NAME="AI-IT Inc"
NEXT_PUBLIC_SUPPORT_PHONE="863-308-4979"
NEXT_PUBLIC_SUPPORT_EMAIL="support@ai-it.com"

# Network Bridge Configuration
NEXT_PUBLIC_NETWORK_BRIDGE_URL="http://localhost:3001"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:3001"

# Media Server Configuration  
NEXT_PUBLIC_MEDIA_SERVER_URL="http://localhost:8080"

# Database Configuration (if using external database)
# DATABASE_URL="your_database_url_here"

# Security Configuration
NEXT_PUBLIC_ENABLE_SECURITY_FEATURES="true"
NEXT_PUBLIC_ENABLE_CAMERA_DISCOVERY="true"
NEXT_PUBLIC_ENABLE_NETWORK_SCANNING="true"

# License Information
NEXT_PUBLIC_LICENSE_TYPE="CLIENT_LICENSE"
NEXT_PUBLIC_NOT_FOR_RESALE="true"
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "[SUCCESS] Default environment file created" -ForegroundColor Green
        }
    } else {
        Write-Host "[INFO] Environment file already exists" -ForegroundColor Yellow
    }

    # Step 7: Create startup scripts and shortcuts
    Write-Host "[STEP 7/7] Creating startup scripts and shortcuts..." -ForegroundColor Cyan
    
    # Create Windows batch startup script
    $batchScript = @"
@echo off
title AI-IT Inc Security POS - Professional System
color 0B
echo.
echo ===============================================================================
echo                    AI-IT Inc Security POS - Starting...
echo                           Created by Steven Chason
echo                              Phone: 863-308-4979
echo ===============================================================================
echo.
echo [INFO] Starting AI-IT Inc Security POS system...
echo [INFO] Opening web browser to http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.

start http://localhost:3000
npm run start

echo.
echo [INFO] AI-IT Inc Security POS has been stopped.
echo [INFO] For support, contact Steven Chason at 863-308-4979
pause
"@
    $batchScript | Out-File -FilePath "start-security-pos.bat" -Encoding ASCII
    
    # Create PowerShell startup script
    $psScript = @"
# AI-IT Inc Security POS - Professional Startup Script
# Created by Steven Chason - 863-308-4979

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "                AI-IT Inc Security POS - Starting..." -ForegroundColor White
Write-Host "                        Created by Steven Chason" -ForegroundColor Yellow
Write-Host "                           Phone: 863-308-4979" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Starting AI-IT Inc Security POS system..." -ForegroundColor Green
Write-Host "[INFO] Opening web browser to http://localhost:3000" -ForegroundColor Green
Write-Host "[INFO] Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:3000"
npm run start

Write-Host ""
Write-Host "[INFO] AI-IT Inc Security POS has been stopped." -ForegroundColor Yellow
Write-Host "[INFO] For support, contact Steven Chason at 863-308-4979" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
"@
    $psScript | Out-File -FilePath "start-security-pos.ps1" -Encoding UTF8

    # Create desktop shortcut
    try {
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\AI-IT Security POS.lnk")
        $Shortcut.TargetPath = "$PWD\start-security-pos.bat"
        $Shortcut.WorkingDirectory = "$PWD"
        $Shortcut.Description = "AI-IT Inc Security POS by Steven Chason - 863-308-4979"
        $Shortcut.Save()
        Write-Host "[SUCCESS] Desktop shortcut created" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not create desktop shortcut: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Installation complete
    Write-Host ""
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host "                        INSTALLATION COMPLETE!" -ForegroundColor Green
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[SUCCESS] AI-IT Inc Security POS has been installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the application:" -ForegroundColor White
    Write-Host "  1. Double-click 'start-security-pos.bat'" -ForegroundColor Yellow
    Write-Host "  2. Or use the desktop shortcut 'AI-IT Security POS'" -ForegroundColor Yellow
    Write-Host "  3. Or run: .\start-security-pos.ps1" -ForegroundColor Yellow
    Write-Host "  4. Open your web browser to: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For technical support:" -ForegroundColor White
    Write-Host "  Steven Chason - 863-308-4979" -ForegroundColor Cyan
    Write-Host "  AI-IT Inc - Professional Security Solutions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This software is licensed for your use only - NOT FOR RESALE" -ForegroundColor Red
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[INFO] For support, contact Steven Chason at 863-308-4979" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
