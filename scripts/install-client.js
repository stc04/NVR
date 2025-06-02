/**
 * AI-IT Inc - Client Installation Script
 * Creator: Steven Chason
 * Company: AI-IT Inc
 * Phone: 863-308-4979
 *
 * NOT FOR RESALE - Proprietary Software
 * © 2024 AI-IT Inc. All rights reserved.
 */

const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")
const os = require("os")

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc - Client Installation                          ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║  Address: 88 Perch St, Winterhaven FL 33881                                 ║
║                                                                              ║
║  Installing Security POS System...                                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
`)

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 ${description}...`)

    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`)
        reject(error)
        return
      }

      if (stderr && !stderr.includes("npm WARN")) {
        console.error(`⚠️  Warning: ${stderr}`)
      }

      console.log(`✅ ${description} completed`)
      resolve(stdout)
    })

    child.stdout?.on("data", (data) => {
      process.stdout.write(".")
    })
  })
}

async function createEnvironmentFile() {
  const envContent = `# AI-IT Inc Security POS Environment Configuration
# Creator: Steven Chason - AI-IT Inc
# Phone: 863-308-4979

# Network Bridge Configuration
CORS_ORIGIN=*
NETWORK_BRIDGE_PORT=3001

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=your_neon_database_url_here
POSTGRES_URL=your_postgres_url_here

# Media Server Configuration
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# AI-IT Inc Configuration
NEXT_PUBLIC_COMPANY_NAME=AI-IT Inc
NEXT_PUBLIC_CREATOR_NAME=Steven Chason
NEXT_PUBLIC_SUPPORT_PHONE=863-308-4979
NEXT_PUBLIC_SUPPORT_EMAIL=support@ai-itinc.com
`

  fs.writeFileSync(".env.local", envContent)
  console.log("✅ Environment file created")
}

async function createStartupScripts() {
  // Windows Batch File
  const batchContent = `@echo off
title AI-IT Inc Security POS System
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    AI-IT Inc Security POS System                            ║
echo ║                                                                              ║
echo ║  Creator: Steven Chason                                                      ║
echo ║  Company: AI-IT Inc                                                          ║
echo ║  Phone: 863-308-4979                                                         ║
echo ║                                                                              ║
echo ║  Starting Security System...                                                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting AI-IT Security POS System...
echo 📊 Dashboard: http://localhost:3000
echo 🌉 Network Bridge: http://localhost:3001
echo.
npm run production
pause
`

  // PowerShell Script
  const psContent = `# AI-IT Inc Security POS System Startup
# Creator: Steven Chason - AI-IT Inc

Write-Host "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc Security POS System                            ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║                                                                              ║
║  Starting Security System...                                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "🚀 Starting AI-IT Security POS System..." -ForegroundColor Green
Write-Host "📊 Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🌉 Network Bridge: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""

npm run production
`

  // Linux/Mac Shell Script
  const shellContent = `#!/bin/bash
# AI-IT Inc Security POS System Startup
# Creator: Steven Chason - AI-IT Inc

echo "
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AI-IT Inc Security POS System                            ║
║                                                                              ║
║  Creator: Steven Chason                                                      ║
║  Company: AI-IT Inc                                                          ║
║  Phone: 863-308-4979                                                         ║
║                                                                              ║
║  Starting Security System...                                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
"

echo "🚀 Starting AI-IT Security POS System..."
echo "📊 Dashboard: http://localhost:3000"
echo "🌉 Network Bridge: http://localhost:3001"
echo ""

npm run production
`

  fs.writeFileSync("start-security-pos.bat", batchContent)
  fs.writeFileSync("start-security-pos.ps1", psContent)
  fs.writeFileSync("start-security-pos.sh", shellContent)

  // Make shell script executable on Unix systems
  if (os.platform() !== "win32") {
    try {
      fs.chmodSync("start-security-pos.sh", "755")
    } catch (error) {
      console.log("⚠️  Could not make shell script executable")
    }
  }

  console.log("✅ Startup scripts created")
}

async function createDesktopShortcut() {
  if (os.platform() === "win32") {
    const desktopPath = path.join(os.homedir(), "Desktop")
    const shortcutContent = `[InternetShortcut]
URL=http://localhost:3000
IconFile=%SystemRoot%\\system32\\SHELL32.dll
IconIndex=13
`

    try {
      fs.writeFileSync(path.join(desktopPath, "AI-IT Security POS.url"), shortcutContent)
      console.log("✅ Desktop shortcut created")
    } catch (error) {
      console.log("⚠️  Could not create desktop shortcut")
    }
  }
}

async function installClient() {
  try {
    console.log("🔍 Checking system requirements...")

    // Check Node.js version
    await runCommand("node --version", "Checking Node.js version")

    // Install dependencies
    await runCommand("npm install", "Installing dependencies")

    // Build the application
    await runCommand("npm run build", "Building application")

    // Create environment file
    createEnvironmentFile()

    // Create startup scripts
    createStartupScripts()

    // Create desktop shortcut
    await createDesktopShortcut()

    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    Installation Complete!                                   ║
║                                                                              ║
║  🎉 AI-IT Inc Security POS System is ready!                                ║
║                                                                              ║
║  📊 Dashboard: http://localhost:3000                                        ║
║  🌉 Network Bridge: http://localhost:3001                                  ║
║                                                                              ║
║  🚀 To start the system:                                                    ║
║     Windows: Double-click start-security-pos.bat                           ║
║     PowerShell: .\\start-security-pos.ps1                                   ║
║     Linux/Mac: ./start-security-pos.sh                                     ║
║     NPM: npm run production                                                 ║
║                                                                              ║
║  📞 Support: Steven Chason - 863-308-4979                                  ║
║  🏢 Company: AI-IT Inc                                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
`)
  } catch (error) {
    console.error(`
❌ Installation failed: ${error.message}

📞 For support, contact:
   Steven Chason - AI-IT Inc
   Phone: 863-308-4979
   Email: support@ai-itinc.com
`)
    process.exit(1)
  }
}

// Run installation
installClient()
