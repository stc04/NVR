# AI-IT Inc - Fix TypeScript Types Script
# Creator: Steven Chason
# Company: AI-IT Inc
# Phone: 863-308-4979

Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    AI-IT Inc - TypeScript Fix Script                        ║" -ForegroundColor Cyan
Write-Host "║                                                                              ║" -ForegroundColor Cyan
Write-Host "║  Creator: Steven Chason                                                      ║" -ForegroundColor Cyan
Write-Host "║  Company: AI-IT Inc                                                          ║" -ForegroundColor Cyan
Write-Host "║  Phone: 863-308-4979                                                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Fixing TypeScript type issues..." -ForegroundColor Yellow

# Remove node_modules and pnpm-lock.yaml
Write-Host "📦 Cleaning existing dependencies..." -ForegroundColor Blue
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml"
    Write-Host "✅ Removed pnpm-lock.yaml" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
pnpm install

# Install TypeScript types explicitly
Write-Host "🔧 Installing TypeScript types..." -ForegroundColor Blue
pnpm add -D @types/express@^4.17.21
pnpm add -D @types/cors@^2.8.17
pnpm add -D @types/node@^20
pnpm add -D typescript@^5
pnpm add -D ts-node@^10.9.1

Write-Host ""
Write-Host "✅ TypeScript types fixed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 You can now run:" -ForegroundColor Cyan
Write-Host "   npm run start-bridge" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📞 Support: Steven Chason - 863-308-4979" -ForegroundColor Yellow
