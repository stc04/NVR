# AI-IT Inc Security POS - Client Installation Guide

**Professional Security Management System**  
Created by **Steven Chason** - AI-IT Inc  
📞 **Support: 863-308-4979**  
📍 **88 Perch St, Winterhaven FL 33881**

---

## 🛡️ **IMPORTANT LICENSE NOTICE**

**⚠️ NOT FOR RESALE - This software is licensed for your use only**

This professional security management system is provided under a client license agreement. Redistribution, resale, or unauthorized copying is strictly prohibited.

---

## 🚀 **Quick Installation (Windows)**

### **Option 1: Automatic Installation (Recommended)**
1. **Extract** all files to a folder on your computer
2. **Double-click** `INSTALL.bat`
3. **Wait** for automatic installation to complete
4. **Double-click** `start-security-pos.bat` to start
5. **Open** your web browser to: http://localhost:3000

### **Option 2: PowerShell Installation (Advanced)**
1. **Right-click** `INSTALL.ps1` → "Run with PowerShell"
2. **Follow** the on-screen prompts
3. **Use** `start-security-pos.ps1` to start the application

---

## 🐧 **Linux/Mac Installation**

### **Prerequisites**
\`\`\`bash
# Install Node.js (if not already installed)
# Ubuntu/Debian:
sudo apt update && sudo apt install nodejs npm

# macOS (with Homebrew):
brew install node npm

# CentOS/RHEL:
sudo yum install nodejs npm
\`\`\`

### **Installation Steps**
\`\`\`bash
# 1. Extract files and navigate to directory
cd rental-storage-security-pos

# 2. Make scripts executable
chmod +x start-security-pos.sh

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Create environment file
cp .env.example .env

# 6. Start the application
./start-security-pos.sh
\`\`\`

---

## 📋 **System Requirements**

### **Minimum Requirements:**
- **Operating System:** Windows 10/11, macOS 10.15+, or Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for installation
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

### **Recommended Requirements:**
- **RAM:** 8GB or more
- **CPU:** Multi-core processor
- **Network:** Gigabit Ethernet for optimal performance
- **Storage:** SSD for better performance

---

## 🔧 **What Gets Installed**

The installer automatically:

✅ **Checks Node.js** installation (downloads if missing)  
✅ **Installs dependencies** (React, Next.js, security libraries)  
✅ **Builds application** for production use  
✅ **Creates configuration** files with default settings  
✅ **Sets up startup scripts** for easy launching  
✅ **Creates desktop shortcut** (Windows only)  
✅ **Configures security features** for network monitoring  

---

## 🌐 **Accessing the Dashboard**

After installation, access your security dashboard at:

**🔗 http://localhost:3000**

### **Default Features Available:**
- 📊 **Real-time Dashboard** - System overview and monitoring
- 📹 **Camera Management** - IP camera discovery and control
- 🌐 **Network Discovery** - Automatic device scanning
- 🛡️ **Security Assessment** - Vulnerability analysis
- 🏢 **Units Management** - Storage unit tracking
- 💰 **Billing System** - Payment and invoice management
- 👥 **User Management** - Access control and permissions
- 🗄️ **Database Dashboard** - Data management and health
- ⚙️ **Settings** - System configuration

---

## 🔧 **Configuration**

### **Environment Settings**
Edit the `.env` file to customize:

\`\`\`env
# Company Information
NEXT_PUBLIC_APP_NAME="AI-IT Security POS"
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
NEXT_PUBLIC_SUPPORT_PHONE="863-308-4979"

# Network Configuration
NEXT_PUBLIC_NETWORK_BRIDGE_URL="http://localhost:3001"
NEXT_PUBLIC_MEDIA_SERVER_URL="http://localhost:8080"

# Security Features
NEXT_PUBLIC_ENABLE_SECURITY_FEATURES="true"
NEXT_PUBLIC_ENABLE_CAMERA_DISCOVERY="true"
NEXT_PUBLIC_ENABLE_NETWORK_SCANNING="true"
\`\`\`

### **Network Configuration**
- **Default Port:** 3000 (web interface)
- **Network Bridge:** 3001 (real-time monitoring)
- **Media Server:** 8080 (camera streams)

---

## 🚀 **Starting the Application**

### **Windows:**
- **Double-click** `start-security-pos.bat`
- **Or use** the desktop shortcut "AI-IT Security POS"
- **Or run** PowerShell script: `.\start-security-pos.ps1`

### **Linux/Mac:**
\`\`\`bash
./start-security-pos.sh
\`\`\`

### **Manual Start:**
\`\`\`bash
npm run start
\`\`\`

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **"Node.js not found" Error**
**Solution:** Install Node.js from https://nodejs.org
- Download the LTS version
- Run the installer with default settings
- Restart your computer
- Run the installer again

#### **"Dependencies failed to install" Error**
**Solutions:**
1. Check your internet connection
2. Run as Administrator (Windows)
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` folder and run installer again

#### **"Port 3000 already in use" Error**
**Solutions:**
1. Close other applications using port 3000
2. Restart your computer
3. Change port in package.json: `"start": "next start -p 3001"`

#### **Browser doesn't open automatically**
**Solution:** Manually open your browser and go to:
- http://localhost:3000

#### **Camera discovery not working**
**Solutions:**
1. Ensure cameras are on the same network
2. Check firewall settings
3. Verify camera IP addresses are accessible
4. Contact support for advanced configuration

---

## 📞 **Professional Support**

### **Technical Support:**
**Steven Chason**  
📞 **Phone:** 863-308-4979  
📧 **Email:** Available upon request  
🏢 **Company:** AI-IT Inc  
📍 **Address:** 88 Perch St, Winterhaven FL 33881  

### **Support Hours:**
- **Monday - Friday:** 9:00 AM - 6:00 PM EST
- **Emergency Support:** Available for critical issues

### **What to Include When Contacting Support:**
1. **Error messages** (exact text or screenshots)
2. **Operating system** and version
3. **Steps taken** before the error occurred
4. **Browser type** and version
5. **Network configuration** details

---

## 🔒 **Security & Privacy**

### **Data Security:**
- All data is stored locally on your system
- No data is transmitted to external servers
- Network scanning is performed locally only
- Camera feeds remain on your local network

### **Network Security:**
- Built-in vulnerability scanning
- Real-time threat monitoring
- Secure camera communication protocols
- Professional-grade security assessment tools

---

## 📄 **License Information**

**AI-IT Inc Security POS System**  
**© 2024 AI-IT Inc. All rights reserved.**

**⚠️ IMPORTANT:** This software is licensed for your use only and is **NOT FOR RESALE**. 

**Licensed to:** Client Installation  
**Created by:** Steven Chason  
**Support:** 863-308-4979  

Unauthorized distribution, modification, or resale of this software is strictly prohibited and may result in legal action.

---

## 🎯 **Getting Started Checklist**

After installation, follow this checklist:

- [ ] ✅ **Access dashboard** at http://localhost:3000
- [ ] 🔧 **Configure network settings** in Settings tab
- [ ] 📹 **Discover cameras** using Camera Management
- [ ] 🌐 **Scan network** for devices using Network Discovery
- [ ] 🛡️ **Run security assessment** to check vulnerabilities
- [ ] 👥 **Set up user accounts** in User Management
- [ ] 🏢 **Configure storage units** in Units Management
- [ ] 💰 **Set up billing** in Billing System
- [ ] 📊 **Review dashboard** for system overview
- [ ] 📞 **Save support contact:** Steven Chason - 863-308-4979

---

**Thank you for choosing AI-IT Inc professional security solutions!**

*For the latest updates and additional resources, contact Steven Chason at 863-308-4979*
\`\`\`

```plaintext file=".env.example"
# AI-IT Inc Security POS Configuration
# Created by Steven Chason - 863-308-4979
# NOT FOR RESALE - Licensed Software

# Application Information
NEXT_PUBLIC_APP_NAME="AI-IT Security POS"
NEXT_PUBLIC_COMPANY_NAME="AI-IT Inc"
NEXT_PUBLIC_CREATOR_NAME="Steven Chason"
NEXT_PUBLIC_SUPPORT_PHONE="863-308-4979"
NEXT_PUBLIC_SUPPORT_EMAIL="support@ai-it.com"
NEXT_PUBLIC_COMPANY_ADDRESS="88 Perch St, Winterhaven FL 33881"

# Network Bridge Configuration
NEXT_PUBLIC_NETWORK_BRIDGE_URL="http://localhost:3001"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:3001"
NETWORK_BRIDGE_PORT=3001
CORS_ORIGIN="http://localhost:3000"

# Media Server Configuration
NEXT_PUBLIC_MEDIA_SERVER_URL="http://localhost:8080"

# Database Configuration (PostgreSQL/Neon)
DATABASE_URL="your_database_url_here"
POSTGRES_URL="your_postgres_url_here"
POSTGRES_PRISMA_URL="your_postgres_prisma_url_here"
DATABASE_URL_UNPOOLED="your_unpooled_database_url_here"
POSTGRES_URL_NON_POOLING="your_non_pooling_postgres_url_here"

# Database Connection Details
PGHOST="your_postgres_host"
POSTGRES_USER="your_postgres_user"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_DATABASE="your_postgres_database"
PGPASSWORD="your_postgres_password"
PGDATABASE="your_postgres_database"
PGHOST_UNPOOLED="your_unpooled_postgres_host"
PGUSER="your_postgres_user"
POSTGRES_URL_NO_SSL="your_postgres_url_no_ssl"
POSTGRES_HOST="your_postgres_host"

# Neon Database Configuration
NEON_PROJECT_ID="your_neon_project_id"

# Stack Authentication (if using Stack Auth)
STACK_SECRET_SERVER_KEY="your_stack_secret_server_key"
NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_stack_publishable_client_key"

# Security Configuration
NEXT_PUBLIC_ENABLE_SECURITY_FEATURES="true"
NEXT_PUBLIC_ENABLE_CAMERA_DISCOVERY="true"
NEXT_PUBLIC_ENABLE_NETWORK_SCANNING="true"
NEXT_PUBLIC_ENABLE_VULNERABILITY_SCANNING="true"

# Camera Configuration
NEXT_PUBLIC_DEFAULT_CAMERA_USERNAME="admin"
NEXT_PUBLIC_DEFAULT_CAMERA_PASSWORD="admin"
NEXT_PUBLIC_CAMERA_DISCOVERY_TIMEOUT="5000"
NEXT_PUBLIC_RTSP_DEFAULT_PORT="554"
NEXT_PUBLIC_ONVIF_DEFAULT_PORT="80"

# Network Scanning Configuration
NEXT_PUBLIC_NETWORK_SCAN_TIMEOUT="3000"
NEXT_PUBLIC_NETWORK_SCAN_CONCURRENCY="10"
NEXT_PUBLIC_DEFAULT_NETWORK_RANGE="192.168.1.0/24"

# License Information
NEXT_PUBLIC_LICENSE_TYPE="CLIENT_LICENSE"
NEXT_PUBLIC_NOT_FOR_RESALE="true"
NEXT_PUBLIC_LICENSE_HOLDER="Client Installation"
NEXT_PUBLIC_SOFTWARE_VERSION="1.0.0"

# Development/Production Mode
NODE_ENV="production"
NEXT_PUBLIC_ENVIRONMENT="production"

# Optional: External API Keys (if needed)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"
# STRIPE_SECRET_KEY="your_stripe_secret_key"

# Optional: Email Configuration (for notifications)
# SMTP_HOST="your_smtp_host"
# SMTP_PORT="587"
# SMTP_USER="your_smtp_user"
# SMTP_PASSWORD="your_smtp_password"

# Optional: Cloud Storage (if using cloud features)
# AWS_ACCESS_KEY_ID="your_aws_access_key"
# AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="your_s3_bucket"

# System Configuration
NEXT_PUBLIC_MAX_UPLOAD_SIZE="10485760"
NEXT_PUBLIC_SESSION_TIMEOUT="3600000"
NEXT_PUBLIC_AUTO_SAVE_INTERVAL="30000"

# Logging Configuration
NEXT_PUBLIC_LOG_LEVEL="info"
NEXT_PUBLIC_ENABLE_DEBUG_MODE="false"

# Performance Configuration
NEXT_PUBLIC_ENABLE_CACHING="true"
NEXT_PUBLIC_CACHE_DURATION="300000"
NEXT_PUBLIC_MAX_CONCURRENT_REQUESTS="10"
