"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Home, Settings } from "lucide-react"
import { ONVIFClient } from "@/lib/camera-protocols"

interface PTZControlsProps {
  cameraIp: string
  profileToken: string
  username?: string
  password?: string
  onError?: (error: string) => void
}

export function PTZControls({
  cameraIp,
  profileToken,
  username = "admin",
  password = "admin",
  onError,
}: PTZControlsProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [zoomLevel, setZoomLevel] = useState([50])
  const [speed, setSpeed] = useState([50])

  const onvifClient = new ONVIFClient(cameraIp, username, password)

  const handlePTZMove = async (direction: "up" | "down" | "left" | "right" | "stop") => {
    try {
      setIsMoving(direction !== "stop")
      await onvifClient.ptzMove(profileToken, direction)
    } catch (error) {
      const errorMsg = `PTZ control error: ${error}`
      onError?.(errorMsg)
      console.error(errorMsg)
    }
  }

  const handleZoom = async (direction: "in" | "out") => {
    try {
      // Implement zoom control via ONVIF
      const velocity = direction === "in" ? 0.5 : -0.5
      // This would be implemented in the ONVIFClient
      console.log(`Zoom ${direction} with velocity ${velocity}`)
    } catch (error) {
      const errorMsg = `Zoom control error: ${error}`
      onError?.(errorMsg)
      console.error(errorMsg)
    }
  }

  const goToPreset = async (presetNumber: number) => {
    try {
      // Implement preset positioning via ONVIF
      console.log(`Moving to preset ${presetNumber}`)
    } catch (error) {
      const errorMsg = `Preset error: ${error}`
      onError?.(errorMsg)
      console.error(errorMsg)
    }
  }

  const stopAllMovement = () => {
    handlePTZMove("stop")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          PTZ Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Directional Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Pan/Tilt</h4>
          <div className="grid grid-cols-3 gap-2 max-w-32 mx-auto">
            <div></div>
            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handlePTZMove("up")}
              onMouseUp={stopAllMovement}
              onMouseLeave={stopAllMovement}
              className="aspect-square"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <div></div>

            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handlePTZMove("left")}
              onMouseUp={stopAllMovement}
              onMouseLeave={stopAllMovement}
              className="aspect-square"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={stopAllMovement}
              className="aspect-square bg-red-50 hover:bg-red-100"
            >
              <Home className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handlePTZMove("right")}
              onMouseUp={stopAllMovement}
              onMouseLeave={stopAllMovement}
              className="aspect-square"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div></div>
            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handlePTZMove("down")}
              onMouseUp={stopAllMovement}
              onMouseLeave={stopAllMovement}
              className="aspect-square"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <div></div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Zoom</h4>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handleZoom("out")}
              onMouseUp={stopAllMovement}
              className="flex-1"
            >
              <ZoomOut className="w-4 h-4 mr-2" />
              Out
            </Button>
            <Button
              size="sm"
              variant="outline"
              onMouseDown={() => handleZoom("in")}
              onMouseUp={stopAllMovement}
              className="flex-1"
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              In
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-600 dark:text-slate-400">Zoom Level</label>
            <Slider value={zoomLevel} onValueChange={setZoomLevel} max={100} step={1} className="w-full" />
          </div>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <label className="text-xs text-slate-600 dark:text-slate-400">Movement Speed</label>
          <Slider value={speed} onValueChange={setSpeed} max={100} step={1} className="w-full" />
        </div>

        {/* Preset Positions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Presets</h4>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((preset) => (
              <Button
                key={preset}
                size="sm"
                variant="outline"
                onClick={() => goToPreset(preset)}
                className="aspect-square text-xs"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={stopAllMovement} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Stop
          </Button>
          <Button size="sm" variant="outline" onClick={() => goToPreset(0)} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Status */}
        {isMoving && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Camera Moving
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
