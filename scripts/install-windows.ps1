# PowerShell Installation Script for Windows
# Run as Administrator

Write-Host "Installing Rental & Storage Security POS System on Windows..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges. Please run as Administrator." -ForegroundColor Red
    exit 1
}

# Create main directory
$InstallPath = "C:\SecurityPOS"
Write-Host "Creating installation directory: $InstallPath" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $InstallPath

# Check for Chocolatey
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install required software
Write-Host "Installing required software..." -ForegroundColor Yellow
choco install nodejs --version=18.17.0 -y
choco install git -y
choco install ffmpeg -y
choco install nmap -y
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools" -y

# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installations
Write-Host "Verifying installations..." -ForegroundColor Yellow
node --version
npm --version
git --version
ffmpeg -version
nmap --version

# Clone repositories
Write-Host "Cloning repositories..." -ForegroundColor Yellow
Set-Location $InstallPath

# Clone main application (replace with actual repository URL)
git clone https://github.com/your-org/rental-storage-security-pos.git frontend
Set-Location frontend
npm install
Set-Location ..

# Clone network bridge (replace with actual repository URL)
git clone https://github.com/your-org/network-bridge-service.git network-bridge
Set-Location network-bridge
npm install
Set-Location ..

# Create media server
Write-Host "Setting up media server..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$InstallPath\media-server"
Set-Location "$InstallPath\media-server"

# Create package.json for media server
$packageJson = @"
{
  "name": "security-media-server",
  "version": "1.0.0",
  "description": "Media server for Security POS system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "multer": "^1.4.5",
    "fluent-ffmpeg": "^2.1.2",
    "node-rtsp-stream": "^0.0.9",
    "hls-server": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
"@

$packageJson | Out-File -FilePath "package.json" -Encoding UTF8
npm install

# Create directories
New-Item -ItemType Directory -Force -Path "public"
New-Item -ItemType Directory -Force -Path "public\hls"
New-Item -ItemType Directory -Force -Path "public\recordings"
New-Item -ItemType Directory -Force -Path "logs"

# Install PM2 for process management
Write-Host "Installing PM2 process manager..." -ForegroundColor Yellow
npm install -g pm2
npm install -g pm2-windows-service

# Create environment files
Write-Host "Creating configuration files..." -ForegroundColor Yellow

# Frontend .env.local
Set-Location "$InstallPath\frontend"
$frontendEnv = @"
# Frontend Configuration
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8001

# Optional: Database
DATABASE_URL=sqlite:./security-pos.db

# Optional: Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
"@
$frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8

# Network Bridge .env
Set-Location "$InstallPath\network-bridge"
$networkEnv = @"
# Network Bridge Configuration
PORT=3001
NODE_ENV=development

# Network Settings
NETWORK_INTERFACE=Ethernet
SCAN_TIMEOUT=5000
MAX_CONCURRENT_SCANS=5

# Windows-specific paths
NMAP_PATH=C:\ProgramData\chocolatey\lib\nmap\tools\nmap-7.94\nmap.exe
FFMPEG_PATH=C:\ProgramData\chocolatey\lib\ffmpeg\tools\ffmpeg\bin\ffmpeg.exe

# NVR Integration
HIKVISION_API_ENABLED=true
DAHUA_API_ENABLED=true
UNIVIEW_API_ENABLED=true

# Media Server Integration
MEDIA_SERVER_URL=http://localhost:8000
MEDIA_SERVER_WS=ws://localhost:8001

# Security
API_KEY=your-secure-api-key-here
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=sqlite:./network-bridge.db
"@
$networkEnv | Out-File -FilePath ".env" -Encoding UTF8

# PM2 Ecosystem
Set-Location $InstallPath
$ecosystem = @"
module.exports = {
  apps: [
    {
      name: 'security-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'network-bridge',
      cwd: './network-bridge',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'media-server',
      cwd: './media-server',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    }
  ]
};
"@
$ecosystem | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8

# Configure Windows Firewall
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Security POS Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Security POS Network Bridge" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "Security POS Media Server" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
New-NetFirewallRule -DisplayName "Security POS WebSocket" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow

# Create startup scripts
Write-Host "Creating startup scripts..." -ForegroundColor Yellow

# Start script
$startScript = @"
@echo off
echo Starting Security POS System...
cd /d C:\SecurityPOS
pm2 start ecosystem.config.js
echo System started. Access at:
echo Frontend: http://localhost:3000
echo Media Server: http://localhost:8000
echo Network Bridge: http://localhost:3001
pause
"@
$startScript | Out-File -FilePath "start-system.bat" -Encoding ASCII

# Stop script
$stopScript = @"
@echo off
echo Stopping Security POS System...
pm2 stop all
echo System stopped.
pause
"@
$stopScript | Out-File -FilePath "stop-system.bat" -Encoding ASCII

# Status script
$statusScript = @"
@echo off
echo Security POS System Status:
pm2 status
echo.
echo System URLs:
echo Frontend: http://localhost:3000
echo Media Server: http://localhost:8000
echo Network Bridge: http://localhost:3001
pause
"@
$statusScript | Out-File -FilePath "status-system.bat" -Encoding ASCII

# Build frontend for production
Write-Host "Building frontend for production..." -ForegroundColor Yellow
Set-Location "$InstallPath\frontend"
npm run build

# Install PM2 as Windows service
Write-Host "Installing PM2 as Windows service..." -ForegroundColor Yellow
Set-Location $InstallPath
pm2-service-install

Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the system: Double-click start-system.bat"
Write-Host "2. Access the frontend: http://localhost:3000"
Write-Host "3. Check system status: Double-click status-system.bat"
Write-Host ""
Write-Host "Configuration files created:" -ForegroundColor Cyan
Write-Host "- Frontend: $InstallPath\frontend\.env.local"
Write-Host "- Network Bridge: $InstallPath\network-bridge\.env"
Write-Host "- PM2 Config: $InstallPath\ecosystem.config.js"
Write-Host ""
Write-Host "Management scripts:" -ForegroundColor Cyan
Write-Host "- Start: $InstallPath\start-system.bat"
Write-Host "- Stop: $InstallPath\stop-system.bat"
Write-Host "- Status: $InstallPath\status-system.bat"
