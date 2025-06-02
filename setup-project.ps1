# AI-IT Inc - Project Setup Script
# Creator: Steven Chason
# Company: AI-IT Inc
# Phone: 863-308-4979

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc Security POS Setup                             ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║                                                                              ║
║  Setting up your Security POS System...                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Create lib directory if it doesn't exist
if (!(Test-Path "lib")) {
    New-Item -ItemType Directory -Path "lib"
    Write-Host "✅ Created lib directory" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Install required packages for network bridge
Write-Host "🌉 Installing Network Bridge dependencies..." -ForegroundColor Yellow
npm install express socket.io cors axios

# Install development dependencies
Write-Host "🔧 Installing development dependencies..." -ForegroundColor Yellow
npm install --save-dev @types/express @types/cors ts-node

Write-Host "
✅ Setup Complete!

🚀 To start your AI-IT Security POS System:

1. Start Network Bridge:
   npm run start-bridge

2. Start Main Application (in another terminal):
   npm run dev

3. Access your system:
   - Main Dashboard: http://localhost:3000
   - Network Bridge: http://localhost:3001
   - Health Check: http://localhost:3001/health

📞 Support: Steven Chason - 863-308-4979
🏢 AI-IT Inc - 88 Perch St, Winterhaven FL 33881
" -ForegroundColor Green
