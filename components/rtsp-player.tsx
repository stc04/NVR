"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2 } from "lucide-react"

interface RTSPPlayerProps {
  streamUrl: string
  width?: number
  height?: number
  autoPlay?: boolean
  controls?: boolean
  onError?: (error: string) => void
  onLoad?: () => void
}

export function RTSPPlayer({
  streamUrl,
  width = 640,
  height = 480,
  autoPlay = true,
  controls = true,
  onError,
  onLoad,
}: RTSPPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !streamUrl) return

    setIsLoading(true)
    setError(null)

    // For RTSP streams, we need to use HLS.js or similar for web playback
    // This is a simplified implementation - in production, you'd use a media server
    const setupStream = async () => {
      try {
        // Convert RTSP to WebRTC or HLS for browser compatibility
        const hlsUrl = convertRTSPToHLS(streamUrl)

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS support (Safari)
          video.src = hlsUrl
        } else {
          // Use HLS.js for other browsers
          const { default: Hls } = await import("hls.js")

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
            })

            hls.loadSource(hlsUrl)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false)
              onLoad?.()
              if (autoPlay) {
                video.play()
              }
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
              const errorMsg = `HLS Error: ${data.type} - ${data.details}`
              setError(errorMsg)
              onError?.(errorMsg)
              setIsLoading(false)
            })

            return () => {
              hls.destroy()
            }
          }
        }
      } catch (err) {
        const errorMsg = `Stream setup error: ${err}`
        setError(errorMsg)
        onError?.(errorMsg)
        setIsLoading(false)
      }
    }

    setupStream()
  }, [streamUrl, autoPlay, onError, onLoad])

  // Convert RTSP URL to HLS (this would typically be done by a media server)
  const convertRTSPToHLS = (rtspUrl: string): string => {
    // In a real implementation, this would connect to your media server
    // that converts RTSP to HLS/WebRTC
    const mediaServerUrl = process.env.NEXT_PUBLIC_MEDIA_SERVER_URL || "http://localhost:8080"
    return `${mediaServerUrl}/hls/${encodeURIComponent(rtspUrl)}/index.m3u8`
  }

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
      } else {
        await video.play()
        setIsPlaying(true)
      }
    } catch (err) {
      const errorMsg = `Playback error: ${err}`
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const toggleFullscreen = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isFullscreen) {
        await video.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen error:", err)
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    video.load()
    setError(null)
    setIsLoading(true)
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ width, height }}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onError={(e) => {
          const errorMsg = `Video error: ${e.currentTarget.error?.message || "Unknown error"}`
          setError(errorMsg)
          onError?.(errorMsg)
          setIsLoading(false)
        }}
        playsInline
        muted={isMuted}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-4">
            <p className="text-sm mb-4">{error}</p>
            <Button size="sm" onClick={restart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      {controls && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={restart} className="text-white hover:bg-white/20">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Info */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {isPlaying ? "LIVE" : "OFFLINE"}
      </div>
    </div>
  )
}
