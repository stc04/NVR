"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Square,
  RotateCcw,
  Settings,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Wifi,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react"
import { mediaServerClient } from "@/lib/media-server-client"

interface StreamInfo {
  id: string
  rtspUrl: string
  quality: "low" | "medium" | "high"
  startTime: number
  hlsUrl: string
  status: "starting" | "active" | "error" | "stopped"
}

interface MediaPlayerProps {
  streamId?: string
  rtspUrl?: string
  autoStart?: boolean
  quality?: "low" | "medium" | "high"
  showControls?: boolean
}

export function WindowsMediaPlayer({
  streamId = "default-stream",
  rtspUrl = "",
  autoStart = false,
  quality = "medium",
  showControls = true,
}: MediaPlayerProps) {
  const [stream, setStream] = useState<StreamInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [serverStatus, setServerStatus] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeMediaServer()

    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (autoStart && rtspUrl) {
      startStream()
    }
  }, [autoStart, rtspUrl])

  const initializeMediaServer = async () => {
    try {
      // Initialize WebSocket connection
      await mediaServerClient.initializeWebSocket()

      // Set up event handlers
      mediaServerClient.onStreamStarted = (data) => {
        if (data.streamId === streamId) {
          setStream((prev) => (prev ? { ...prev, status: "active" } : null))
          setError("")
        }
      }

      mediaServerClient.onStreamError = (data) => {
        if (data.streamId === streamId) {
          setError(data.error || "Stream error occurred")
          setStream((prev) => (prev ? { ...prev, status: "error" } : null))
        }
      }

      mediaServerClient.onStreamEnded = (data) => {
        if (data.streamId === streamId) {
          setStream((prev) => (prev ? { ...prev, status: "stopped" } : null))
        }
      }

      // Check server status
      const status = await mediaServerClient.getServerStatus()
      setServerStatus(status)
    } catch (error) {
      console.error("Failed to initialize media server:", error)
      setError("Media server unavailable")
    }
  }

  const startStream = async () => {
    if (!rtspUrl) {
      setError("RTSP URL is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await mediaServerClient.startStream({
        streamId,
        rtspUrl,
        quality,
      })

      const newStream: StreamInfo = {
        id: streamId,
        rtspUrl,
        quality,
        startTime: Date.now(),
        hlsUrl: result.hlsUrl,
        status: "starting",
      }

      setStream(newStream)

      // Wait a moment for stream to initialize, then load video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = result.hlsUrl
          videoRef.current.load()
        }
      }, 2000)
    } catch (error) {
      console.error("Failed to start stream:", error)
      setError(error instanceof Error ? error.message : "Failed to start stream")
    } finally {
      setIsLoading(false)
    }
  }

  const stopStream = async () => {
    if (!stream) return

    setIsLoading(true)

    try {
      await mediaServerClient.stopStream(streamId)
      setStream(null)

      if (videoRef.current) {
        videoRef.current.src = ""
      }
    } catch (error) {
      console.error("Failed to stop stream:", error)
      setError(error instanceof Error ? error.message : "Failed to stop stream")
    } finally {
      setIsLoading(false)
    }
  }

  const testStream = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await mediaServerClient.testStream()

      const testStream: StreamInfo = {
        id: "test-stream",
        rtspUrl: "rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif-media/media.amp",
        quality: "medium",
        startTime: Date.now(),
        hlsUrl: result.hlsUrl,
        status: "starting",
      }

      setStream(testStream)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = result.hlsUrl
          videoRef.current.load()
        }
      }, 2000)
    } catch (error) {
      console.error("Failed to start test stream:", error)
      setError(error instanceof Error ? error.message : "Failed to start test stream")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
  }

  const cleanup = () => {
    if (stream) {
      mediaServerClient.stopStream(streamId)
    }
    mediaServerClient.disconnect()
  }

  const getStatusBadge = () => {
    if (!stream) return <Badge variant="outline">Stopped</Badge>

    switch (stream.status) {
      case "starting":
        return <Badge className="bg-yellow-100 text-yellow-800">Starting</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800">Live</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "stopped":
        return <Badge variant="outline">Stopped</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = () => {
    if (!stream) return <Monitor className="w-4 h-4 text-gray-500" />

    switch (stream.status) {
      case "starting":
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "stopped":
        return <Square className="w-4 h-4 text-gray-500" />
      default:
        return <Monitor className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Server Status */}
      {serverStatus && (
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Media Server: {serverStatus.status} on port {serverStatus.port}
            {serverStatus.platform && ` (${serverStatus.platform})`}
            {serverStatus.activeStreams > 0 && ` • ${serverStatus.activeStreams} active streams`}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Player */}
      <Card ref={containerRef} className={`${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
        <CardHeader className={`${isFullscreen ? "absolute top-0 left-0 right-0 z-10 bg-black/50 text-white" : ""}`}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Stream Player
              {getStatusIcon()}
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {stream && (
                <Badge variant="outline" className="text-xs">
                  {stream.quality.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className={`${isFullscreen ? "h-full flex flex-col" : ""}`}>
          {/* Video Element */}
          <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? "flex-1" : "aspect-video"}`}>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls={false}
              autoPlay
              muted={isMuted}
              onLoadStart={() => console.log("Video loading started")}
              onCanPlay={() => {
                console.log("Video can play")
                setStream((prev) => (prev ? { ...prev, status: "active" } : null))
              }}
              onError={(e) => {
                console.error("Video error:", e)
                setError("Video playback error")
                setStream((prev) => (prev ? { ...prev, status: "error" } : null))
              }}
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Loading stream...</p>
                </div>
              </div>
            )}

            {/* No Stream Overlay */}
            {!stream && !isLoading && (
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No active stream</p>
                  <Button onClick={testStream} disabled={isLoading}>
                    <Play className="w-4 h-4 mr-2" />
                    Test Stream
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {showControls && (
            <div className={`mt-4 space-y-4 ${isFullscreen ? "absolute bottom-0 left-0 right-0 p-4 bg-black/50" : ""}`}>
              {/* Main Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!stream ? (
                    <Button onClick={startStream} disabled={isLoading || !rtspUrl}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Stream
                    </Button>
                  ) : (
                    <Button onClick={stopStream} disabled={isLoading} variant="outline">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Stream
                    </Button>
                  )}

                  <Button onClick={testStream} disabled={isLoading} variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Test Stream
                  </Button>

                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={toggleMute} className={isFullscreen ? "text-white" : ""}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-20">
                      <Progress value={volume} className="h-1" />
                    </div>
                  </div>

                  {/* Fullscreen Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className={isFullscreen ? "text-white" : ""}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Stream Info */}
              {stream && (
                <div
                  className={`text-sm space-y-2 ${isFullscreen ? "text-white" : "text-slate-600 dark:text-slate-400"}`}
                >
                  <div className="flex justify-between">
                    <span>Stream ID:</span>
                    <span className="font-mono">{stream.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality:</span>
                    <span>{stream.quality.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{Math.floor((Date.now() - stream.startTime) / 1000)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HLS URL:</span>
                    <span className="font-mono text-xs truncate max-w-xs">{stream.hlsUrl}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stream Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Stream Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stream ID</label>
              <input
                type="text"
                value={streamId}
                readOnly
                className="w-full p-2 border rounded-md bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quality</label>
              <select value={quality} className="w-full p-2 border rounded-md" disabled={!!stream}>
                <option value="low">Low (640x480)</option>
                <option value="medium">Medium (1280x720)</option>
                <option value="high">High (1920x1080)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">RTSP URL</label>
            <input
              type="text"
              value={rtspUrl}
              placeholder="rtsp://username:password@ip:port/path"
              className="w-full p-2 border rounded-md font-mono text-sm"
              disabled={!!stream}
            />
          </div>

          {/* Quick Test URLs */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Quick Test URLs:</label>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <code className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                rtsp://demo:demo@ipvmdemo.dyndns.org:5541/onvif-media/media.amp
              </code>
              <code className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
