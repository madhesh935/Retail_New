import React, { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { openPreferredCameraStream, stopMediaStream } from '@/lib/preferredCamera'
import { markYoloActive } from '@/lib/yoloLaneRegistry'

interface BackgroundCameraProcessorProps {
  laneCode: string
  ipUrl: string
}

export const BackgroundCameraProcessor: React.FC<BackgroundCameraProcessorProps> = ({
  laneCode,
  ipUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const preferredCameraLabel = useAppStore((s) => s.preferredCameraLabel)

  useEffect(() => {
    let intervalId: number
    let mediaStream: MediaStream | null = null

    const laneNum = parseInt(laneCode.replace('C', '')) || 1
    const laneId = `lane-${laneNum}`

    const startBackgroundCamera = async () => {
      try {
        if (!ipUrl) {
          const { stream } = await openPreferredCameraStream({
            preferredLabel: preferredCameraLabel,
          })
          mediaStream = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }

        // Use per-lane WebSocket endpoint so each counter tracks independently
        const wsUrl = `ws://127.0.0.1:8000/api/v1/queue/stream/${laneId}`
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          console.log(`Background WS Connected for ${laneCode} (${laneId})`)
          intervalId = window.setInterval(captureAndSendFrame, 1500) // 0.67 FPS for background
        }

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          // Mark this lane as YOLO-active so the polling loop won't overwrite the count
          markYoloActive(laneId)
          useAppStore.getState().updateLaneQueue(laneId, data.people_count, data.average_wait_time_seconds)
        }
      } catch (err) {
        console.error(`Background WS Error for ${laneCode}:`, err)
      }
    }

    startBackgroundCamera()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (wsRef.current) wsRef.current.close()
      stopMediaStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [laneCode, ipUrl, preferredCameraLabel])

  const captureAndSendFrame = () => {
    if (!canvasRef.current || !wsRef.current) return
    if (wsRef.current.readyState !== WebSocket.OPEN) return

    const canvas = canvasRef.current
    let sourceElement: HTMLVideoElement | HTMLImageElement | null = null
    let sourceWidth = 0
    let sourceHeight = 0

    if (ipUrl && imgRef.current) {
      sourceElement = imgRef.current
      sourceWidth = imgRef.current.naturalWidth
      sourceHeight = imgRef.current.naturalHeight
    } else if (videoRef.current) {
      sourceElement = videoRef.current
      sourceWidth = videoRef.current.videoWidth
      sourceHeight = videoRef.current.videoHeight
    }

    if (!sourceElement || sourceWidth === 0 || sourceHeight === 0) return

    const context = canvas.getContext('2d')
    if (context) {
      try {
        const laneNum = parseInt(laneCode.replace('C', '')) || 1
        const laneId = `lane-${laneNum}`
        const roi = useAppStore.getState().cameraRois[laneCode] || { x: 0, y: 0, width: 1, height: 1 }
        
        const sx = sourceWidth * roi.x
        const sy = sourceHeight * roi.y
        const sWidth = sourceWidth * roi.width
        const sHeight = sourceHeight * roi.height
        
        if (canvas.width !== sWidth || canvas.height !== sHeight) {
          canvas.width = sWidth
          canvas.height = sHeight
        }

        context.drawImage(sourceElement, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)
      } catch (err) {
        console.warn(`Background capture failed for ${laneCode}:`, err)
      }
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob)
        }
      }, 'image/jpeg', 0.5)
    }
  }

  return (
    <div style={{ display: 'none' }}>
      {ipUrl ? (
        <img
          ref={imgRef}
          src={`http://127.0.0.1:8000/api/v1/queue/proxy?url=${encodeURIComponent(ipUrl)}`}
          crossOrigin="anonymous"
          alt={`Background Camera ${laneCode}`}
        />
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
        />
      )}
      <canvas ref={canvasRef} />
    </div>
  )
}
