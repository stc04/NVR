# Windows Installation Guide

Complete setup guide for installing the Rental & Storage Security POS system on Windows with integrated media server.

## System Requirements

### Hardware Requirements
- **CPU**: Intel i5 or AMD Ryzen 5 (4+ cores recommended)
- **RAM**: 16GB+ (8GB minimum)
- **Storage**: 500GB+ SSD (for recordings and cache)
- **Network**: Gigabit Ethernet adapter
- **GPU**: Optional (for hardware-accelerated transcoding)

### Software Requirements
- **Windows 10/11** (64-bit)
- **Node.js 18+** 
- **Git for Windows**
- **Visual Studio Build Tools** (for native modules)
- **FFmpeg** (for media processing)
- **Optional**: Docker Desktop for Windows

## Installation Steps

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version (18.x or higher)
3. Run the installer with default settings
4. Verify installation:
\`\`\`cmd
node --version
npm --version
\`\`\`

#### 1.2 Install Git for Windows
1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Install with default settings
3. Verify installation:
\`\`\`cmd
git --version
\`\`\`

#### 1.3 Install Visual Studio Build Tools
1. Download from [Microsoft Visual Studio](https://visualstudio.microsoft.com/downloads/)
2. Install "Build Tools for Visual Studio 2022"
3. Select "C++ build tools" workload
4. Or install via chocolatey:
\`\`\`cmd
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"
\`\`\`

#### 1.4 Install FFmpeg
**Option A: Manual Installation**
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html#build-windows)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH
4. Verify installation:
\`\`\`cmd
ffmpeg -version
\`\`\`

**Option B: Using Chocolatey**
\`\`\`cmd
choco install ffmpeg
\`\`\`

**Option C: Using Scoop**
\`\`\`cmd
scoop install ffmpeg
\`\`\`

### Step 2: Install Network Tools

#### 2.1 Install Nmap
1. Download from [nmap.org](https://nmap.org/download.html#windows)
2. Run installer with default settings
3. Add to PATH: `C:\Program Files (x86)\Nmap`
4. Verify installation:
\`\`\`cmd
nmap --version
\`\`\`

#### 2.2 Install Additional Tools
\`\`\`cmd
# Using Chocolatey (recommended)
choco install nmap
choco install wireshark
choco install putty
choco install curl

# Or using Scoop
scoop install nmap
scoop install wireshark
scoop install putty
scoop install curl
\`\`\`

### Step 3: Clone and Setup the Application

#### 3.1 Clone the Repository
\`\`\`cmd
# Create project directory
mkdir C:\SecurityPOS
cd C:\SecurityPOS

# Clone the main application
git clone https://github.com/your-org/rental-storage-security-pos.git frontend
cd frontend

# Install dependencies
npm install
\`\`\`

#### 3.2 Clone Network Bridge Service
\`\`\`cmd
# Go back to main directory
cd C:\SecurityPOS

# Clone network bridge
git clone https://github.com/your-org/network-bridge-service.git network-bridge
cd network-bridge

# Install dependencies
npm install
\`\`\`

### Step 4: Setup Media Server

#### 4.1 Create Media Server Directory
\`\`\`cmd
cd C:\SecurityPOS
mkdir media-server
cd media-server
\`\`\`

#### 4.2 Initialize Media Server
\`\`\`cmd
npm init -y
npm install express cors ws multer fluent-ffmpeg node-rtsp-stream hls-server
\`\`\`

#### 4.3 Create Media Server Configuration
Create `server.js`:
\`\`\`javascript
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const NodeRtspStream = require('node-rtsp-stream');

const app = express();
const PORT = 8000;

// Configure FFmpeg path for Windows
const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Adjust path as needed
ffmpeg.setFfmpegPath(ffmpegPath);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create directories
const dirs = ['public', 'public/hls', 'public/recordings', 'logs'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Active streams storage
const activeStreams = new Map();
const streamClients = new Map();

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ port: 8001 });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Handle WebSocket messages
function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'subscribe_stream':
            subscribeToStream(ws, data.streamId);
            break;
        case 'unsubscribe_stream':
            unsubscribeFromStream(ws, data.streamId);
            break;
    }
}

// Stream management
function subscribeToStream(ws, streamId) {
    if (!streamClients.has(streamId)) {
        streamClients.set(streamId, new Set());
    }
    streamClients.get(streamId).add(ws);
}

function unsubscribeFromStream(ws, streamId) {
    if (streamClients.has(streamId)) {
        streamClients.get(streamId).delete(ws);
    }
}

// Broadcast to stream subscribers
function broadcastToStream(streamId, message) {
    if (streamClients.has(streamId)) {
        const clients = streamClients.get(streamId);
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

// API Routes

// Get server status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        port: PORT,
        activeStreams: activeStreams.size,
        uptime: process.uptime(),
        platform: 'windows',
        ffmpegPath: ffmpegPath
    });
});

// Start RTSP stream
app.post('/api/stream/start', (req, res) => {
    const { streamId, rtspUrl, quality = 'medium' } = req.body;
    
    if (activeStreams.has(streamId)) {
        return res.json({ 
            success: true, 
            message: 'Stream already active',
            hlsUrl: `http://localhost:${PORT}/hls/${streamId}/index.m3u8`
        });
    }
    
    try {
        const outputDir = path.join(__dirname, 'public', 'hls', streamId);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, 'index.m3u8');
        
        // Configure quality settings
        const qualitySettings = {
            low: { width: 640, height: 480, bitrate: '500k' },
            medium: { width: 1280, height: 720, bitrate: '2000k' },
            high: { width: 1920, height: 1080, bitrate: '4000k' }
        };
        
        const settings = qualitySettings[quality] || qualitySettings.medium;
        
        const stream = ffmpeg(rtspUrl)
            .inputOptions([
                '-rtsp_transport', 'tcp',
                '-analyzeduration', '1000000',
                '-probesize', '1000000'
            ])
            .outputOptions([
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-tune', 'zerolatency',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-b:v', settings.bitrate,
                '-s', `${settings.width}x${settings.height}`,
                '-f', 'hls',
                '-hls_time', '2',
                '-hls_list_size', '10',
                '-hls_flags', 'delete_segments',
                '-hls_allow_cache', '0'
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
                console.log(`Started stream ${streamId}: ${commandLine}`);
                broadcastToStream(streamId, {
                    type: 'stream_started',
                    streamId: streamId,
                    timestamp: new Date().toISOString()
                });
            })
            .on('error', (err) => {
                console.error(`Stream ${streamId} error:`, err);
                activeStreams.delete(streamId);
                broadcastToStream(streamId, {
                    type: 'stream_error',
                    streamId: streamId,
                    error: err.message,
                    timestamp: new Date().toISOString()
                });
            })
            .on('end', () => {
                console.log(`Stream ${streamId} ended`);
                activeStreams.delete(streamId);
                broadcastToStream(streamId, {
                    type: 'stream_ended',
                    streamId: streamId,
                    timestamp: new Date().toISOString()
                });
            });
        
        stream.run();
        activeStreams.set(streamId, { stream, rtspUrl, quality, startTime: Date.now() });
        
        res.json({
            success: true,
            streamId: streamId,
            hlsUrl: `http://localhost:${PORT}/hls/${streamId}/index.m3u8`,
            quality: quality
        });
        
    } catch (error) {
        console.error('Stream start error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Stop stream
app.post('/api/stream/stop', (req, res) => {
    const { streamId } = req.body;
    
    if (!activeStreams.has(streamId)) {
        return res.status(404).json({
            success: false,
            error: 'Stream not found'
        });
    }
    
    const streamData = activeStreams.get(streamId);
    streamData.stream.kill('SIGTERM');
    activeStreams.delete(streamId);
    
    // Clean up HLS files
    const outputDir = path.join(__dirname, 'public', 'hls', streamId);
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    res.json({
        success: true,
        message: 'Stream stopped'
    });
});

// Get active streams
app.get('/api/streams', (req, res) => {
    const streams = Array.from(activeStreams.entries()).map(([id, data]) => ({
        id,
        rtspUrl: data.rtspUrl,
        quality: data.quality,
        startTime: data.startTime,
        hlsUrl: `http://localhost:${PORT}/hls/${id}/index.m3u8`
    }));
    
    res.json({ streams });
});

// Serve HLS files
app.use('/hls', express.static(path.join(__dirname, 'public', 'hls')));

// Start recording
app.post('/api/recording/start', (req, res) => {
    const { streamId, rtspUrl, duration = 3600 } = req.body; // Default 1 hour
    
    const recordingId = `rec_${streamId}_${Date.now()}`;
    const outputPath = path.join(__dirname, 'public', 'recordings', `${recordingId}.mp4`);
    
    const recording = ffmpeg(rtspUrl)
        .inputOptions(['-rtsp_transport', 'tcp'])
        .outputOptions([
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-t', duration.toString()
        ])
        .output(outputPath)
        .on('start', () => {
            console.log(`Started recording ${recordingId}`);
        })
        .on('end', () => {
            console.log(`Recording ${recordingId} completed`);
        })
        .on('error', (err) => {
            console.error(`Recording ${recordingId} error:`, err);
        });
    
    recording.run();
    
    res.json({
        success: true,
        recordingId: recordingId,
        outputPath: outputPath,
        duration: duration
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Media Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:8001`);
    console.log(`FFmpeg path: ${ffmpegPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down media server...');
    
    // Stop all active streams
    activeStreams.forEach((streamData, streamId) => {
        streamData.stream.kill('SIGTERM');
    });
    
    process.exit(0);
});
\`\`\`

#### 4.4 Create Package.json for Media Server
\`\`\`json
{
  "name": "security-media-server",
  "version": "1.0.0",
  "description": "Media server for Security POS system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "multer": "^1.4.5",
    "fluent-ffmpeg": "^2.1.2",
    "node-rtsp-stream": "^0.0.9",
    "hls-server": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
\`\`\`

### Step 5: Configuration

#### 5.1 Frontend Configuration
Create `.env.local` in the frontend directory:
\`\`\`env
# Frontend Configuration
NEXT_PUBLIC_NETWORK_BRIDGE_URL=http://localhost:3001
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8001

# Optional: Database
DATABASE_URL=sqlite:./security-pos.db

# Optional: Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
\`\`\`

#### 5.2 Network Bridge Configuration
Create `.env` in the network-bridge directory:
\`\`\`env
# Network Bridge Configuration
PORT=3001
NODE_ENV=development

# Network Settings
NETWORK_INTERFACE=Ethernet
SCAN_TIMEOUT=5000
MAX_CONCURRENT_SCANS=5

# Windows-specific paths
NMAP_PATH=C:\Program Files (x86)\Nmap\nmap.exe
FFMPEG_PATH=C:\ffmpeg\bin\ffmpeg.exe

# NVR Integration
HIKVISION_API_ENABLED=true
DAHUA_API_ENABLED=true
UNIVIEW_API_ENABLED=true

# Media Server Integration
MEDIA_SERVER_URL=http://localhost:8000
MEDIA_SERVER_WS=ws://localhost:8001

# Security
API_KEY=your-secure-api-key-here
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=sqlite:./network-bridge.db
\`\`\`

#### 5.3 Media Server Configuration
Create `config.json` in the media-server directory:
\`\`\`json
{
  "server": {
    "port": 8000,
    "host": "localhost",
    "cors": {
      "origin": ["http://localhost:3000", "http://localhost:3001"],
      "credentials": true
    }
  },
  "ffmpeg": {
    "path": "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "options": {
      "preset": "ultrafast",
      "tune": "zerolatency",
      "rtsp_transport": "tcp"
    }
  },
  "hls": {
    "segmentDuration": 2,
    "playlistSize": 10,
    "deleteSegments": true
  },
  "recording": {
    "path": "./public/recordings",
    "maxDuration": 7200,
    "format": "mp4"
  },
  "quality": {
    "profiles": {
      "low": {
        "width": 640,
        "height": 480,
        "bitrate": "500k",
        "fps": 15
      },
      "medium": {
        "width": 1280,
        "height": 720,
        "bitrate": "2000k",
        "fps": 25
      },
      "high": {
        "width": 1920,
        "height": 1080,
        "bitrate": "4000k",
        "fps": 30
      }
    }
  }
}
\`\`\`

### Step 6: Windows Services Setup

#### 6.1 Install PM2 (Process Manager)
\`\`\`cmd
npm install -g pm2
npm install -g pm2-windows-service
\`\`\`

#### 6.2 Create PM2 Ecosystem File
Create `ecosystem.config.js` in `C:\SecurityPOS`:
\`\`\`javascript
module.exports = {
  apps: [
    {
      name: 'security-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'network-bridge',
      cwd: './network-bridge',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'media-server',
      cwd: './media-server',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    }
  ]
};
\`\`\`

#### 6.3 Install as Windows Service
\`\`\`cmd
cd C:\SecurityPOS
pm2-service-install
pm2 start ecosystem.config.js
pm2 save
\`\`\`

### Step 7: Firewall Configuration

#### 7.1 Windows Firewall Rules
\`\`\`cmd
# Allow inbound connections
netsh advfirewall firewall add rule name="Security POS Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Security POS Network Bridge" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Security POS Media Server" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Security POS WebSocket" dir=in action=allow protocol=TCP localport=8001

# Allow outbound connections for network scanning
netsh advfirewall firewall add rule name="Security POS Outbound" dir=out action=allow protocol=TCP localport=1-65535
\`\`\`

### Step 8: Testing the Installation

#### 8.1 Start All Services
\`\`\`cmd
# Terminal 1: Media Server
cd C:\SecurityPOS\media-server
npm start

# Terminal 2: Network Bridge
cd C:\SecurityPOS\network-bridge
npm start

# Terminal 3: Frontend
cd C:\SecurityPOS\frontend
npm run dev
\`\`\`

#### 8.2 Verify Services
1. **Frontend**: http://localhost:3000
2. **Network Bridge**: http://localhost:3001/health
3. **Media Server**: http://localhost:8000/api/status

#### 8.3 Test Media Server
\`\`\`cmd
# Test stream endpoint
curl -X POST http://localhost:8000/api/stream/start ^
  -H "Content-Type: application/json" ^
  -d "{\"streamId\":\"test\",\"rtspUrl\":\"rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif-media/media.amp\",\"quality\":\"medium\"}"
\`\`\`

### Step 9: Troubleshooting

#### 9.1 Common Issues

**FFmpeg Not Found:**
\`\`\`cmd
# Check FFmpeg installation
ffmpeg -version

# If not found, add to PATH or update config
set PATH=%PATH%;C:\ffmpeg\bin
\`\`\`

**Node.js Native Modules:**
\`\`\`cmd
# Rebuild native modules
npm rebuild

# Or install with specific Python version
npm install --python=python2.7
\`\`\`

**Port Conflicts:**
\`\`\`cmd
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <process_id> /F
\`\`\`

**Network Scanning Issues:**
\`\`\`cmd
# Run as Administrator
# Check nmap installation
nmap --version

# Test network scan
nmap -sn 192.168.1.1/24
\`\`\`

#### 9.2 Performance Optimization

**For Better Performance:**
1. **SSD Storage**: Use SSD for recordings and cache
2. **Hardware Acceleration**: Enable GPU encoding if available
3. **Network Optimization**: Use wired connection for stability
4. **Resource Monitoring**: Monitor CPU/RAM usage

**FFmpeg Hardware Acceleration:**
\`\`\`javascript
// In media server config, add hardware encoding
const hwAccelOptions = [
  '-hwaccel', 'auto',
  '-c:v', 'h264_nvenc', // NVIDIA
  // or '-c:v', 'h264_qsv', // Intel QuickSync
  // or '-c:v', 'h264_amf'  // AMD
];
\`\`\`

### Step 10: Production Deployment

#### 10.1 Build for Production
\`\`\`cmd
# Build frontend
cd C:\SecurityPOS\frontend
npm run build

# Start production services
pm2 start ecosystem.config.js --env production
\`\`\`

#### 10.2 Monitoring Setup
\`\`\`cmd
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# View logs
pm2 logs
pm2 monit
\`\`\`

#### 10.3 Backup Configuration
\`\`\`cmd
# Create backup script
mkdir C:\SecurityPOS\backups

# backup.bat
@echo off
set BACKUP_DIR=C:\SecurityPOS\backups\%date:~-4,4%-%date:~-10,2%-%date:~-7,2%
mkdir "%BACKUP_DIR%"
xcopy "C:\SecurityPOS\frontend\.env.local" "%BACKUP_DIR%\" /Y
xcopy "C:\SecurityPOS\network-bridge\.env" "%BACKUP_DIR%\" /Y
xcopy "C:\SecurityPOS\media-server\config.json" "%BACKUP_DIR%\" /Y
xcopy "C:\SecurityPOS\ecosystem.config.js" "%BACKUP_DIR%\" /Y
\`\`\`

This complete Windows installation guide provides everything needed to run the Security POS system with integrated media server on Windows, including all dependencies, configuration, and troubleshooting steps.
