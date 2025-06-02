# Environment Configuration Guide

This guide explains how to properly configure environment variables for the Security POS system with Windows localhost media server.

## Required Environment Variables

### NEXT_PUBLIC_WEBSOCKET_URL
- **Purpose**: WebSocket connection for real-time communication with media server
- **Required**: Yes
- **Default**: `ws://localhost:8001`
- **Production**: `wss://your-domain.com:8001`

### NEXT_PUBLIC_MEDIA_SERVER_URL
- **Purpose**: HTTP API endpoint for media server operations
- **Required**: Yes
- **Default**: `http://localhost:8000`
- **Production**: `https://your-domain.com:8000`

### NEXT_PUBLIC_NETWORK_BRIDGE_URL
- **Purpose**: Network bridge service for device discovery
- **Required**: No
- **Default**: `http://localhost:3001`
- **Production**: `https://your-domain.com:3001`

## Configuration Examples

### Local Development
Create `.env.local` in your project root:
\`\`\`env
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://localhost:3001
\`\`\`

### Network Access (LAN)
For access from other devices on your network:
\`\`\`env
NEXT_PUBLIC_MEDIA_SERVER_URL=http://192.168.1.100:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://192.168.1.100:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://192.168.1.100:3001
\`\`\`

### Production Deployment
For production with SSL:
\`\`\`env
NEXT_PUBLIC_MEDIA_SERVER_URL=https://security.yourdomain.com:8000
NEXT_PUBLIC_WEBSOCKET_URL=wss://security.yourdomain.com:8001
NEXT_PUBLIC_NETWORK_BRIDGE_URL=https://security.yourdomain.com:3001
\`\`\`

## Vercel Deployment

When deploying to Vercel, set these environment variables in your project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with appropriate values for your deployment

### Vercel Environment Variables
\`\`\`
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-media-server.com:8001
NEXT_PUBLIC_MEDIA_SERVER_URL=https://your-media-server.com:8000
NEXT_PUBLIC_NETWORK_BRIDGE_URL=https://your-network-bridge.com:3001
\`\`\`

## Windows Installation

The Windows installation script automatically configures these variables for localhost development:

```powershell
# Run the installation script
.\install-windows.ps1

# Or use the quick start
.\quick-start.bat
