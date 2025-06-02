# AI-IT Inc - Rental & Storage Security POS System

**Creator:** Steven Chason  
**Company:** AI-IT Inc  
**Address:** 88 Perch St, Winterhaven FL 33881  
**Phone:** 863-308-4979  
**Email:** support@ai-it.com

---

## 🚨 **NOT FOR RESALE - PROPRIETARY SOFTWARE**

This software is proprietary to **AI-IT Inc** and is **NOT FOR RESALE**. Licensed for single facility use only.

**© 2024 AI-IT Inc. All rights reserved.**

---

## 🏢 **About AI-IT Inc**

AI-IT Inc specializes in comprehensive security solutions for rental and storage facilities. Our flagship Security POS system provides enterprise-level monitoring, network discovery, and threat detection capabilities designed specifically for the storage industry.

### **Our Mission**
To provide cutting-edge security technology that protects storage facilities, their customers, and valuable assets through intelligent monitoring and proactive threat detection.

---

## 🛡️ **System Overview**

The AI-IT Security POS system is a comprehensive security management platform that combines:

- **Real-time Network Monitoring** - Continuous surveillance of network infrastructure
- **Camera Management** - Multi-brand IP camera integration and monitoring
- **Security Assessment** - Automated vulnerability scanning and threat detection
- **Device Discovery** - Automatic identification of network devices
- **Incident Management** - Complete security event tracking and resolution
- **Database Integration** - Comprehensive data management with Neon PostgreSQL
- **Live Streaming** - Real-time video monitoring with HLS/RTSP support

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Node.js 18+ installed
- Windows 10/11 or Linux/macOS
- Network access to target devices
- Neon PostgreSQL database (included)

### **Installation**

1. **Clone or download the project files**
2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables:**
   - Copy `.env.local` to your project root
   - Update `DATABASE_URL` with your Neon connection string
   - Configure media server and network bridge URLs

4. **Start the Network Bridge service:**
   
   **Windows:**
   ```powershell
   .\start-network-bridge.ps1
   \`\`\`
   
   **Linux/macOS:**
   \`\`\`bash
   chmod +x start-network-bridge.sh
   ./start-network-bridge.sh
   \`\`\`

5. **Start the main application:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the system:**
   - Main Application: http://localhost:3000
   - Network Bridge: http://localhost:3001
   - Media Server: http://localhost:8000

---

## 🔧 **System Architecture**

### **Frontend Application (Next.js)**
- **Dashboard** - Real-time system overview and metrics
- **Network Discovery** - Device scanning and identification
- **Camera Management** - IP camera integration and control
- **Security Assessment** - Vulnerability scanning and threat analysis
- **Database Management** - Complete data administration
- **Settings & Admin** - System configuration and user management

### **Network Bridge Service (Node.js)**
- **Network Scanner** - Automated device discovery using nmap/arp-scan
- **Camera Discovery** - Multi-brand camera identification and integration
- **Device Manager** - Comprehensive device lifecycle management
- **Security Monitor** - Real-time threat detection and event management
- **WebSocket API** - Real-time updates and notifications

### **Database Layer (Neon PostgreSQL)**
- **User Management** - Authentication and role-based access control
- **Facility Management** - Multi-location support
- **Device Registry** - Complete device inventory and status tracking
- **Security Events** - Incident logging and resolution tracking
- **Audit Trails** - Complete activity logging for compliance

---

## 📊 **Key Features**

### **Network Security**
- **Automated Discovery** - Finds all devices on your network automatically
- **Risk Assessment** - Identifies security vulnerabilities and threats
- **Real-time Monitoring** - Continuous network health and performance tracking
- **Threat Detection** - Proactive identification of security incidents
- **Compliance Reporting** - Detailed audit trails and security reports

### **Camera Integration**
- **Multi-brand Support** - Hikvision, Dahua, Axis, Foscam, Uniview, and more
- **ONVIF Compatibility** - Standard protocol support for maximum compatibility
- **Live Streaming** - Real-time video with HLS and RTSP protocols
- **PTZ Control** - Pan, tilt, zoom control for supported cameras
- **Recording Management** - Automated recording schedules and storage management

### **Business Management**
- **Unit Management** - Complete storage unit tracking and status
- **Customer Management** - Customer profiles and lease management
- **Billing Integration** - Payment processing and financial tracking
- **Access Control** - Secure facility and unit access management
- **Reporting** - Comprehensive business and security reporting

---

## 🔐 **Security Features**

### **Network Security**
- **AES-256 Encryption** - All sensitive data encrypted at rest and in transit
- **Role-based Access Control** - Granular permissions for different user types
- **Multi-factor Authentication** - Enhanced security for administrative access
- **Session Management** - Secure session handling with configurable timeouts
- **Audit Logging** - Complete activity tracking for compliance requirements

### **Data Protection**
- **Local Processing** - All data processed locally, no external transmission
- **Encrypted Storage** - Database encryption with industry-standard algorithms
- **Backup & Recovery** - Automated backup systems with point-in-time recovery
- **Data Retention** - Configurable retention policies for compliance
- **Privacy Controls** - GDPR-compliant data handling and user rights

### **Network Monitoring**
- **Intrusion Detection** - Real-time monitoring for unauthorized access
- **Vulnerability Scanning** - Automated security assessments
- **Device Authorization** - Whitelist-based device access control
- **Traffic Analysis** - Network behavior monitoring and anomaly detection
- **Incident Response** - Automated alerting and response procedures

---

## 📞 **Support & Contact**

### **Technical Support**
- **Phone:** 863-308-4979
- **Email:** support@ai-it.com
- **Business Hours:** Monday - Friday, 9:00 AM - 5:00 PM EST
- **Emergency Support:** Available 24/7 for critical security issues

### **Sales & Licensing**
- **Email:** sales@ai-it.com
- **Phone:** 863-308-4979

### **Privacy & Legal**
- **Email:** privacy@ai-it.com
- **Legal:** legal@ai-it.com

---

## 📋 **System Requirements**

### **Minimum Requirements**
- **OS:** Windows 10, macOS 10.15, or Linux (Ubuntu 18.04+)
- **CPU:** Dual-core 2.0 GHz processor
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 10GB available space
- **Network:** Gigabit Ethernet recommended

### **Recommended Requirements**
- **OS:** Windows 11, macOS 12+, or Linux (Ubuntu 20.04+)
- **CPU:** Quad-core 3.0 GHz processor or better
- **RAM:** 16GB or more
- **Storage:** 50GB+ SSD storage
- **Network:** Dedicated network interface for security monitoring

---

## 📄 **License & Legal**

### **Software License**
This software is licensed for **single facility use only**. The license includes:
- Installation and configuration support
- Technical support during business hours
- Security updates and patches
- Documentation and training materials

### **Restrictions**
- **NO RESALE** - This software may not be resold or redistributed
- **NO REVERSE ENGINEERING** - Decompilation or reverse engineering is prohibited
- **SINGLE FACILITY** - License is valid for one facility location only
- **NO MODIFICATION** - Software may not be modified or altered

### **Support Services**
- Initial setup and configuration assistance
- User training and documentation
- Technical support during business hours
- Security updates and maintenance patches
- 24/7 emergency support for critical issues

---

## 🔄 **Version History**

### **v1.0.0 (Current)**
- Initial release with full network discovery
- Multi-brand camera integration
- Real-time security monitoring
- Database integration with Neon PostgreSQL
- WebSocket real-time updates
- Comprehensive device management
- Security event tracking and resolution
- Professional Windows installation package

---

## 🎯 **Roadmap**

### **Planned Features**
- **Mobile Application** - iOS and Android apps for remote monitoring
- **Cloud Integration** - Optional cloud backup and multi-site management
- **Advanced Analytics** - Machine learning-based threat detection
- **API Extensions** - Third-party integration capabilities
- **Enhanced Reporting** - Advanced business intelligence and analytics

---

**For more information, contact Steven Chason at AI-IT Inc:**  
📞 **863-308-4979**  
📧 **support@ai-it.com**  
📍 **88 Perch St, Winterhaven FL 33881**

---

**© 2024 AI-IT Inc. All rights reserved. NOT FOR RESALE.**
