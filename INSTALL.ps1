# AI-IT Inc Security POS System - PowerShell Installer
# Creator: Steven Chason - AI-IT Inc

$Host.UI.RawUI.WindowTitle = "AI-IT Inc Security POS - Installation"

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc Security POS System                            ║
║                              INSTALLATION                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║  Address: 88 Perch St, Winterhaven FL 33881                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  NOT FOR RESALE - Proprietary Software                                      ║
║  © 2024 AI-IT Inc. All rights reserved.                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js 18+ from: https://nodejs.org" -ForegroundColor Yellow
    Write-Host "Then run this installer again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Installing AI-IT Security POS System..." -ForegroundColor Green
Write-Host ""

try {
    npm run install-client
    
    Write-Host ""
    Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the system:" -ForegroundColor Yellow
    Write-Host "  • Double-click: start-security-pos.bat" -ForegroundColor White
    Write-Host "  • Or run: .\start-security-pos.ps1" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📞 For support, contact:" -ForegroundColor Yellow
    Write-Host "   Steven Chason - AI-IT Inc" -ForegroundColor White
    Write-Host "   Phone: 863-308-4979" -ForegroundColor White
    Write-Host "   Email: support@ai-itinc.com" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"
