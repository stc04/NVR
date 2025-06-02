# Environment Setup Guide

## AI-IT Inc Security POS System
**Creator:** Steven Chason  
**Company:** AI-IT Inc  
**Address:** 88 Perch St, Winterhaven FL 33881  
**Phone:** 863-308-4979

---

## Quick Setup Instructions

### 1. Database Configuration (Neon)

1. **Get your Neon connection string:**
   - Go to [Neon Console](https://console.neon.tech/)
   - Select your project
   - Go to "Connection Details"
   - Copy the connection string

2. **Update DATABASE_URL in .env.local:**
   \`\`\`env
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   \`\`\`

### 2. Media Server Setup

1. **Install Windows Media Server:**
   - Download from the project repository
   - Run the installation script: `scripts/install-windows.ps1`
   - Start the server: `npm run media-server`

2. **Verify media server is running:**
   - Open browser to `http://localhost:8000/health`
   - Should return: `{"status": "ok"}`

### 3. Network Bridge Setup

1. **Install Network Bridge service:**
   - Follow instructions in `docs/network-bridge-setup.md`
   - Start the service: `npm run network-bridge`

2. **Verify network bridge is running:**
   - Open browser to `http://localhost:3001/health`
   - Should return: `{"status": "ok"}`

### 4. Security Configuration

1. **Generate secure secrets:**
   \`\`\`bash
   # Generate NEXTAUTH_SECRET (32 characters)
   openssl rand -base64 32

   # Generate ENCRYPTION_KEY (32 characters)
   openssl rand -base64 32

   # Generate JWT_SECRET (64 characters)
   openssl rand -base64 64
   \`\`\`

2. **Update secrets in .env.local:**
   \`\`\`env
   NEXTAUTH_SECRET="your-generated-secret-here"
   ENCRYPTION_KEY="your-generated-encryption-key"
   JWT_SECRET="your-generated-jwt-secret"
   \`\`\`

### 5. Email Configuration (Optional)

1. **For Gmail SMTP:**
   \`\`\`env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   \`\`\`

2. **Generate Gmail App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

### 6. Camera Network Configuration

1. **Set your network range:**
   \`\`\`env
   CAMERA_DISCOVERY_RANGE="192.168.1.0/24"
   \`\`\`

2. **Common network ranges:**
   - Home networks: `192.168.1.0/24` or `192.168.0.0/24`
   - Business networks: `10.0.0.0/8` or `172.16.0.0/12`

---

## Environment Variables Reference

### Required Variables
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_MEDIA_SERVER_URL` - Windows media server URL
- `NEXT_PUBLIC_NETWORK_BRIDGE_URL` - Network bridge service URL
- `NEXTAUTH_SECRET` - Authentication secret key

### Optional Variables
- `SMTP_*` - Email configuration for notifications
- `STRIPE_*` - Payment processing (if enabled)
- `TWILIO_*` - SMS notifications (if enabled)

### Development vs Production

**Development (.env.local):**
\`\`\`env
NODE_ENV="development"
DEBUG="true"
VERBOSE_LOGGING="true"
\`\`\`

**Production (Vercel Environment Variables):**
\`\`\`env
NODE_ENV="production"
DEBUG="false"
VERBOSE_LOGGING="false"
\`\`\`

---

## Troubleshooting

### Database Connection Issues
1. Check DATABASE_URL format
2. Verify Neon project is active
3. Check IP allowlist in Neon console
4. Test connection with: `psql $DATABASE_URL`

### Media Server Issues
1. Check if port 8000 is available
2. Verify Windows Media Server is installed
3. Check firewall settings
4. Test with: `curl http://localhost:8000/health`

### Network Bridge Issues
1. Check if port 3001 is available
2. Verify Node.js version (16+)
3. Check network permissions
4. Test with: `curl http://localhost:3001/health`

---

## Security Best Practices

### 1. Secrets Management
- Never commit `.env.local` to version control
- Use different secrets for each environment
- Rotate secrets regularly (every 90 days)
- Use strong, randomly generated passwords

### 2. Network Security
- Use HTTPS in production
- Restrict database access by IP
- Enable firewall rules
- Use VPN for remote access

### 3. Access Control
- Implement role-based permissions
- Enable two-factor authentication
- Monitor access logs
- Regular security audits

---

## Support

**Need help with setup?**

**Steven Chason**  
**AI-IT Inc**  
📧 support@ai-it.com  
📞 863-308-4979  
📍 88 Perch St, Winterhaven FL 33881

**Business Hours:** Monday - Friday, 9:00 AM - 5:00 PM EST  
**Emergency Support:** Available 24/7 for critical issues

---

## License

This software is proprietary to AI-IT Inc and is **NOT FOR RESALE**.  
Licensed for single facility use only.

© 2024 AI-IT Inc. All rights reserved.
