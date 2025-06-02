# Network Bridge Setup Guide

This guide explains how to set up the backend network bridge service to enable real NVR and network integration.

## Overview

The Network Bridge is a Node.js service that runs on your local network and provides:
- Real network discovery using native tools (nmap, arp-scan)
- Direct NVR integration via manufacturer APIs
- Live stream proxying and transcoding
- Real-time network monitoring
- Security scanning capabilities

## Prerequisites

- Node.js 18+ installed
- Network access to target devices
- Administrative privileges for network scanning
- Optional: Docker for containerized deployment

## Installation

### Option 1: Direct Installation

1. **Clone the network bridge repository:**
\`\`\`bash
git clone https://github.com/your-org/network-bridge-service.git
cd network-bridge-service
npm install
\`\`\`

2. **Install system dependencies:**
\`\`\`bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nmap arp-scan ffmpeg

# CentOS/RHEL
sudo yum install nmap arp-scan ffmpeg

# macOS
brew install nmap arp-scan ffmpeg
\`\`\`

3. **Configure environment variables:**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` file:
\`\`\`env
# Network Bridge Configuration
PORT=3001
NODE_ENV=production

# Network Settings
NETWORK_INTERFACE=eth0
SCAN_TIMEOUT=5000
MAX_CONCURRENT_SCANS=10

# NVR Integration
HIKVISION_API_ENABLED=true
DAHUA_API_ENABLED=true
UNIVIEW_API_ENABLED=true

# Stream Processing
FFMPEG_PATH=/usr/bin/ffmpeg
STREAM_PROXY_PORT=8554
HLS_SEGMENT_DURATION=2

# Security
API_KEY=your-secure-api-key-here
CORS_ORIGIN=http://localhost:3000

# Database (Optional)
DATABASE_URL=sqlite:./network-bridge.db
\`\`\`

4. **Start the service:**
\`\`\`bash
npm start
\`\`\`

### Option 2: Docker Deployment

1. **Create docker-compose.yml:**
\`\`\`yaml
version: '3.8'
services:
  network-bridge:
    image: network-bridge:latest
    ports:
      - "3001:3001"
      - "8554:8554"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - API_KEY=your-secure-api-key
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    network_mode: host
    privileged: true
    restart: unless-stopped
\`\`\`

2. **Deploy:**
\`\`\`bash
docker-compose up -d
\`\`\`

## Configuration

### Frontend Configuration

Update your Next.js environment variables:

\`\`\`env
# .env.local
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8554
\`\`\`

### Network Bridge API Endpoints

The service provides the following REST API endpoints:

- `POST /api/network/discover` - Network device discovery
- `GET /api/nvr/systems` - List connected NVR systems
- `POST /api/nvr/connect` - Connect to NVR system
- `GET /api/nvr/{id}/cameras` - Get cameras from NVR
- `POST /api/stream/url` - Get live stream URL
- `POST /api/camera/{id}/ptz` - PTZ camera control
- `GET /api/network/topology` - Network topology
- `GET /api/network/performance` - Performance metrics
- `POST /api/security/scan` - Security vulnerability scan

### WebSocket Events

Real-time events are sent via WebSocket:

- `device_discovered` - New device found
- `device_status_changed` - Device status update
- `network_event` - Network events (bandwidth, alerts)
- `stream_status` - Stream status updates

## NVR Integration

### Supported NVR Brands

1. **Hikvision**
   - API Version: ISAPI 2.0+
   - Supported models: DS-7xxx, DS-9xxx series
   - Features: Live streams, PTZ control, recording management

2. **Dahua**
   - API Version: HTTP API 3.0+
   - Supported models: NVR4xxx, NVR5xxx series
   - Features: Live streams, PTZ control, event management

3. **Uniview**
   - API Version: OpenAPI 1.0+
   - Supported models: NVR301, NVR302 series
   - Features: Live streams, device management

### NVR Connection Examples

**Hikvision:**
\`\`\`javascript
const nvrConfig = {
  ip: "192.168.1.100",
  port: 80,
  username: "admin",
  password: "admin123",
  brand: "hikvision"
}
\`\`\`

**Dahua:**
\`\`\`javascript
const nvrConfig = {
  ip: "192.168.1.101",
  port: 80,
  username: "admin",
  password: "admin123",
  brand: "dahua"
}
\`\`\`

## Stream Processing

The network bridge includes FFmpeg-based stream processing:

### Stream Transcoding
- RTSP to HLS conversion
- Multiple quality streams (main/sub)
- Adaptive bitrate streaming
- WebRTC support (experimental)

### Stream URLs
- HLS: `http://localhost:8554/hls/{stream_id}/index.m3u8`
- WebRTC: `ws://localhost:8554/webrtc/{stream_id}`
- RTSP Proxy: `rtsp://localhost:8554/proxy/{stream_id}`

## Security Features

### Network Scanning
- Port scanning with nmap
- Service detection and fingerprinting
- Vulnerability assessment
- Device classification

### Security Monitoring
- Real-time threat detection
- Anomaly detection
- Network traffic analysis
- Alert generation

## Troubleshooting

### Common Issues

1. **Permission Denied for Network Scanning:**
\`\`\`bash
sudo setcap cap_net_raw+ep /usr/bin/nmap
sudo setcap cap_net_raw+ep /usr/bin/arp-scan
\`\`\`

2. **FFmpeg Not Found:**
\`\`\`bash
which ffmpeg
# Update FFMPEG_PATH in .env
\`\`\`

3. **NVR Connection Failed:**
- Verify IP address and credentials
- Check firewall settings
- Ensure NVR API is enabled

4. **WebSocket Connection Issues:**
- Check CORS settings
- Verify network bridge URL
- Check firewall/proxy settings

### Logs

Monitor service logs:
\`\`\`bash
# Direct installation
tail -f logs/network-bridge.log

# Docker
docker-compose logs -f network-bridge
\`\`\`

## Performance Optimization

### Network Scanning
- Adjust `MAX_CONCURRENT_SCANS` based on network capacity
- Use targeted IP ranges instead of full subnet scans
- Enable scan result caching

### Stream Processing
- Configure appropriate HLS segment duration
- Use hardware acceleration when available
- Implement stream caching for multiple viewers

## API Examples

### Network Discovery
\`\`\`javascript
const response = await fetch('http://localhost:3001/api/network/discover', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ipRange: '192.168.1.1-254',
    protocols: ['onvif', 'rtsp', 'http'],
    timeout: 5000
  })
});

const devices = await response.json();
\`\`\`

### NVR Connection
\`\`\`javascript
const response = await fetch('http://localhost:3001/api/nvr/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.100',
    port: 80,
    username: 'admin',
    password: 'admin123',
    brand: 'hikvision'
  })
});

const nvrInfo = await response.json();
\`\`\`

### Stream URL
\`\`\`javascript
const response = await fetch('http://localhost:3001/api/stream/url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'camera-123',
    streamType: 'main'
  })
});

const { streamUrl } = await response.json();
\`\`\`

## Production Deployment

### System Requirements
- CPU: 4+ cores (for stream processing)
- RAM: 8GB+ (depending on concurrent streams)
- Storage: 100GB+ (for logs and cache)
- Network: Gigabit Ethernet recommended

### Security Considerations
- Use strong API keys
- Enable HTTPS/WSS in production
- Implement rate limiting
- Regular security updates
- Network segmentation

### Monitoring
- Set up health checks
- Monitor resource usage
- Log analysis and alerting
- Performance metrics collection

This network bridge service enables full integration with real NVR systems and provides comprehensive network-level monitoring capabilities that work seamlessly with the browser-based frontend application.
