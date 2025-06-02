Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc - Quick Start Script                           ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║                                                                              ║
║  Setting up your Security POS System...                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔧 Installing additional packages..." -ForegroundColor Yellow
npm install express socket.io cors axios

Write-Host "🚀 Starting Network Bridge Service..." -ForegroundColor Green
npm run start-bridge
