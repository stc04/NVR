# AI-IT Inc Security POS System
## Client Installation Guide

**Creator:** Steven Chason  
**Company:** AI-IT Inc  
**Phone:** 863-308-4979  
**Address:** 88 Perch St, Winterhaven FL 33881  

---

## 🚀 Quick Installation

### Windows Users (Recommended)
1. **Double-click `INSTALL.bat`**
2. **Wait for installation to complete**
3. **Double-click `start-security-pos.bat` to start**

### PowerShell Users
1. **Right-click PowerShell → Run as Administrator**
2. **Run: `.\INSTALL.ps1`**
3. **Run: `.\start-security-pos.ps1` to start**

### Manual Installation
1. **Install Node.js 18+** from https://nodejs.org
2. **Run: `npm run install-client`**
3. **Run: `npm run production` to start**

---

## 📊 System Access

After installation, access your system at:
- **Main Dashboard:** http://localhost:3000
- **Network Bridge:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## 🛡️ Features

### ✅ Live Network Monitoring
- Real-time device discovery
- Network security scanning
- Threat detection and alerts

### ✅ IP Camera Integration
- Multi-brand camera support
- Live video streaming
- Camera health monitoring

### ✅ Security Management
- Risk assessment
- Vulnerability scanning
- Security event logging

### ✅ Professional Interface
- Real-time dashboard
- Mobile-responsive design
- Professional AI-IT Inc branding

---

## 🔧 System Requirements

- **Operating System:** Windows 10+, macOS 10.15+, or Linux
- **Node.js:** Version 18.0.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for initial setup

---

## 📞 Support

**Technical Support:**
- **Name:** Steven Chason
- **Company:** AI-IT Inc
- **Phone:** 863-308-4979
- **Email:** support@ai-itinc.com
- **Address:** 88 Perch St, Winterhaven FL 33881

**Business Hours:** Monday - Friday, 9 AM - 5 PM EST

---

## 🔒 License

**NOT FOR RESALE - Proprietary Software**  
© 2024 AI-IT Inc. All rights reserved.

This software is licensed exclusively to the purchasing organization and may not be redistributed, resold, or transferred without written permission from AI-IT Inc.

---

## 🎯 Quick Start Guide

1. **Install the system** using one of the methods above
2. **Start the application** using the startup script
3. **Open your browser** to http://localhost:3000
4. **Click "Live Network Scan"** to discover devices
5. **Click "Discover Cameras"** to find IP cameras
6. **Monitor security status** in real-time

Your AI-IT Inc Security POS System is now ready for professional use!
\`\`\`

```plaintext file=".env.example"
# AI-IT Inc Security POS Environment Configuration
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
