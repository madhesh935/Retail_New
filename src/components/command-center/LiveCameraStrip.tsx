import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { LiveQueueVisionCard } from '@/components/queue-intelligence/LiveQueueVisionCard'
import { useAppStore } from '@/store/useAppStore'

interface CameraFeed {
  id: string
  name: string
  code: string
  summary: string
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL'
  type: 'people' | 'shelf' | 'queue' | 'exterior'
  resolution: string
  fps: number
  latencyMs: number
}

// Sub-component for Entrance Camera (C01) inside Fullscreen Modal
const LiveEntranceModalStream: React.FC<{ feed: CameraFeed }> = ({ feed }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wsRef = React.useRef<WebSocket | null>(null)
  const currentOccupancy = useAppStore((s) => s.storeInfo?.currentOccupancy || 142)

  React.useEffect(() => {
    let intervalId: number
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        const wsUrl = `ws://127.0.0.1:8000/api/v1/entrance/stream`
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          intervalId = window.setInterval(captureAndSendFrame, 500)
        }

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.total_entered) {
            const globalOccupancy = useAppStore.getState().storeInfo?.currentOccupancy || 142
            useAppStore.getState().updateOccupancy(globalOccupancy + 1, 0)
          }
        }
      } catch (err) {
        console.error('Error accessing entrance camera:', err)
      }
    }

    startCamera()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (wsRef.current) wsRef.current.close()
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
      }
    }
  }, [])

  const captureAndSendFrame = () => {
    if (!canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const context = canvas.getContext('2d')
    if (context) {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob)
        }
      }, 'image/jpeg', 0.6)
    }
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="relative w-full h-80 sm:h-96 md:h-[480px] rounded-xl bg-[#070A0F] border border-[#1E293B] overflow-hidden flex flex-col justify-between p-4 shadow-inner">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Scanline pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* Counting Line Overlay */}
        <div className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 pointer-events-none" style={{ top: '50%' }} />
        <div className="absolute left-4 text-[10px] text-cyan-400 font-bold bg-[#0B1322]/80 px-2 py-0.5 rounded border border-cyan-500/40" style={{ top: 'calc(50% - 24px)' }}>
          ENTRY THRESHOLD
        </div>

        {/* Top HUD */}
        <div className="flex items-center justify-between text-xs text-cyan-300 z-10">
          <span className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RTSP STREAM • CAM-01 (Main Entrance)</span>
          </span>
          <span className="bg-[#0F172A]/90 px-2.5 py-1 rounded-md border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 shadow-sm">
            <span>Occupancy:</span>
            <span className="text-white">{currentOccupancy} Shoppers</span>
          </span>
        </div>

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-xs text-slate-300 z-10 pt-2 border-t border-[#1E293B]/60 mt-auto bg-[#070A0F]/60 -mx-4 -mb-4 p-4">
          <span>Inference: <strong className="text-emerald-400">YOLOv8 Edge Line-Crossing</strong></span>
          <span className="text-emerald-400 font-bold">100% On-Device Neural Processing</span>
        </div>
      </div>

      {/* Bottom Telemetry Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Real-Time Telemetry Summary</span>
          <p className="text-xs text-slate-600 mt-0.5">{feed.summary}</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          STREAM NOMINAL
        </span>
      </div>
    </div>
  )
}

// Sub-component for Checkout Camera (C05) inside Fullscreen Modal
const LiveCheckoutModalStream: React.FC<{ feed: CameraFeed }> = ({ feed }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wsRef = React.useRef<WebSocket | null>(null)
  const [liveQueueCount, setLiveQueueCount] = React.useState(8)
  const [liveWaitTime, setLiveWaitTime] = React.useState('5.4 min')
  const currentRoi = useAppStore((s) => s.cameraRois['C1'] || { x: 0, y: 0, width: 1, height: 1 })

  React.useEffect(() => {
    let intervalId: number
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        const wsUrl = `ws://127.0.0.1:8000/api/v1/queue/stream`
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          intervalId = window.setInterval(captureAndSendFrame, 500)
        }

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.people_count !== undefined) {
            setLiveQueueCount(data.people_count)
            setLiveWaitTime(`${(data.average_wait_time_seconds / 60).toFixed(1)} min`)
          }
        }
      } catch (err) {
        console.error('Error accessing checkout camera:', err)
      }
    }

    startCamera()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (wsRef.current) wsRef.current.close()
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((t) => t.stop())
      }
    }
  }, [])

  const captureAndSendFrame = () => {
    if (!canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return

    const context = canvas.getContext('2d')
    if (context) {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob)
        }
      }, 'image/jpeg', 0.6)
    }
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="relative w-full h-80 sm:h-96 md:h-[480px] rounded-xl bg-[#070A0F] border border-[#1E293B] overflow-hidden flex flex-col justify-between p-4 shadow-inner">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Scanline pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* ROI Box Overlay */}
        <div 
          className="absolute border-2 border-cyan-500/50 bg-cyan-500/10 rounded pointer-events-none flex items-start justify-start p-1 transition-all duration-300"
          style={{
            left: `${currentRoi.x * 100}%`,
            top: `${currentRoi.y * 100}%`,
            width: `${currentRoi.width * 100}%`,
            height: `${currentRoi.height * 100}%`
          }}
        >
          <div className="bg-[#0F172A] px-1.5 py-0.5 rounded border border-cyan-500/60 text-[9px] text-cyan-300 font-bold whitespace-nowrap">
            ROI: C1 (Register 1)
          </div>
        </div>

        {/* Top HUD */}
        <div className="flex items-center justify-between text-xs text-cyan-300 z-10">
          <span className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RTSP STREAM • CAM-06 (Overhead Checkout C1)</span>
          </span>
          <span className="bg-[#0F172A]/90 px-2.5 py-1 rounded-md border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 shadow-sm">
            <span>Detected Queue:</span>
            <span className="text-white">{liveQueueCount} Shoppers ({liveWaitTime})</span>
          </span>
        </div>

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-xs text-slate-300 z-10 pt-2 border-t border-[#1E293B]/60 mt-auto bg-[#070A0F]/60 -mx-4 -mb-4 p-4">
          <span>Target Counter: <strong className="text-white">C1 (Elena Rostova)</strong> • 2 FPS</span>
          <span className="text-emerald-400 font-bold">100% On-Device Neural Processing</span>
        </div>
      </div>

      {/* Bottom Telemetry Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 block">Real-Time Telemetry Summary</span>
          <p className="text-xs text-slate-600 mt-0.5">{feed.summary}</p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">
          ALERT: CONGESTED
        </span>
      </div>
    </div>
  )
}

// Mini Live Stream for Entrance Camera Card
const LiveEntranceMiniStream: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    }).catch(console.warn)

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-[#050810] overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-75" />
      {/* Scanline pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
        }}
      />
      {/* Counting Line Overlay */}
      <div className="absolute left-0 right-0 border-t border-dashed border-cyan-400 pointer-events-none" style={{ top: '50%' }} />
      <div className="absolute left-2 text-[8px] text-cyan-300 font-bold bg-[#0B1322]/85 px-1 py-0.2 rounded border border-cyan-500/40" style={{ top: 'calc(50% - 13px)' }}>
        ENTRY LINE
      </div>
    </div>
  )
}

// Mini Live Stream for Checkout Camera Card
const LiveCheckoutMiniStream: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const currentRoi = useAppStore((s) => s.cameraRois['C1'] || { x: 0.08, y: 0.08, width: 0.84, height: 0.84 })

  React.useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    }).catch(console.warn)

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-[#050810] overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-75" />
      {/* Scanline pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
        }}
      />
      {/* ROI Box Overlay */}
      <div 
        className="absolute border border-cyan-400/80 bg-cyan-500/10 rounded pointer-events-none p-0.5"
        style={{
          left: `${currentRoi.x * 100}%`,
          top: `${currentRoi.y * 100}%`,
          width: `${currentRoi.width * 100}%`,
          height: `${currentRoi.height * 100}%`
        }}
      >
        <span className="text-[8px] font-bold text-cyan-300 bg-[#0F172A]/90 px-1 py-0.2 rounded border border-cyan-500/40">
          ROI: C1
        </span>
      </div>
    </div>
  )
}

// Mini Simulated High-Tech Camera Feed for Produce & Beverages
const LiveSimulatedMiniStream: React.FC<{ code: string; name: string; isAlert?: boolean }> = ({ code, name, isAlert }) => {
  return (
    <div className="relative w-full h-full bg-[#070B14] overflow-hidden flex flex-col justify-between p-2 font-mono select-none">
      {/* Background surveillance optics with dynamic grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56,189,248,0.2), transparent 75%), repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`
        }}
      />

      {/* Simulated AI Object Detection Bounding Boxes */}
      {code === 'C02' ? (
        <>
          {/* Person 1 Box */}
          <div className="absolute top-[24%] left-[20%] w-[28%] h-[52%] border border-emerald-400/80 bg-emerald-500/10 rounded-xs flex flex-col justify-between p-0.5 animate-pulse pointer-events-none">
            <span className="text-[7px] text-emerald-300 font-bold bg-black/85 px-1 py-0.2 rounded w-fit border border-emerald-500/30">
              shopper: 96%
            </span>
          </div>
          {/* Produce Shelf Target Box */}
          <div className="absolute top-[32%] right-[16%] w-[34%] h-[46%] border border-cyan-400/70 bg-cyan-500/10 rounded-xs flex flex-col justify-between p-0.5 pointer-events-none">
            <span className="text-[7px] text-cyan-300 font-bold bg-black/85 px-1 py-0.2 rounded w-fit border border-cyan-500/30">
              fresh_aisle_A1
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Stock Alert Box */}
          <div className="absolute top-[18%] left-[26%] w-[48%] h-[60%] border border-rose-500/90 bg-rose-500/15 rounded-xs flex flex-col justify-between p-0.5 animate-pulse pointer-events-none">
            <span className="text-[7px] text-rose-300 font-bold bg-rose-950/90 px-1 py-0.2 rounded w-fit border border-rose-500/40">
              low_stock: B4 (3 left)
            </span>
          </div>
        </>
      )}

      {/* Center Lens Marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center opacity-40">
        <Camera className="w-6 h-6 text-cyan-400 mb-0.5" />
        <span className="text-[8px] text-cyan-300 tracking-widest">{code} SPATIAL</span>
      </div>
    </div>
  )
}

export const LiveCameraStrip: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)

  const feeds: CameraFeed[] = [
    {
      id: 'cam-01',
      name: 'Entrance',
      code: 'C01',
      summary: '14 Inflow • Flow Nominal',
      status: 'NOMINAL',
      type: 'people',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 14,
    },
    {
      id: 'cam-02',
      name: 'Produce',
      code: 'C02',
      summary: '28 Shoppers • A1 92% Healthy',
      status: 'NOMINAL',
      type: 'people',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 16,
    },
    {
      id: 'cam-03',
      name: 'Beverages',
      code: 'C03',
      summary: 'B4 Low Stock (3 left)',
      status: 'CRITICAL',
      type: 'shelf',
      resolution: '1080p @ 29fps',
      fps: 29,
      latencyMs: 15,
    },
    {
      id: 'cam-05',
      name: 'Checkout',
      code: 'C05',
      summary: 'C1 Congested (8 in queue)',
      status: 'CRITICAL',
      type: 'queue',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 13,
    },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Live Cameras
          </h3>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/cameras')}
          className="text-slate-700 border-slate-200 hover:bg-slate-50 text-xs gap-1 h-7 cursor-pointer"
        >
          <span>All Cameras</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* 4 Main Camera Feeds in 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {feeds.map((feed) => {
          const isCritical = feed.status === 'CRITICAL'
          const isWarning = feed.status === 'WARNING'

          return (
            <div
              key={feed.id}
              className={cn(
                'rounded-xl bg-white border p-2.5 transition-all flex flex-col justify-between space-y-2 group shadow-2xs',
                isCritical
                  ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10'
                  : isWarning
                  ? 'border-amber-300 hover:border-amber-400'
                  : 'border-slate-200 hover:border-sky-300'
              )}
            >
              {/* Card Header: Camera ID & Live status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                    {feed.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {feed.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Viewport Frame - Live Video Feed */}
              <div className="relative w-full h-44 sm:h-48 rounded-lg bg-[#070A0F] border border-slate-800 overflow-hidden flex flex-col justify-between p-2 shadow-inner group-hover:border-sky-500/50 transition-all">
                {/* Live Video Feed Element */}
                <div className="absolute inset-0">
                  {feed.code === 'C01' ? (
                    <LiveEntranceMiniStream />
                  ) : feed.code === 'C05' ? (
                    <LiveCheckoutMiniStream />
                  ) : (
                    <LiveSimulatedMiniStream code={feed.code} name={feed.name} isAlert={isCritical} />
                  )}
                </div>

                {/* Card Top HUD */}
                <div className="z-10 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] text-sky-300 font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center gap-1 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {feed.fps} FPS
                  </span>
                  {isCritical ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                      <AlertOctagon className="h-2.5 w-2.5" /> ALERT
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="h-2.5 w-2.5" /> OPTIMAL
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Text */}
              <p
                className={cn(
                  'text-[11px] leading-tight line-clamp-1 min-h-[16px]',
                  isCritical ? 'text-rose-600 font-medium' : 'text-slate-500'
                )}
              >
                {feed.summary}
              </p>

              {/* Action Button */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setSelectedCamera(feed)}
                className="w-full text-xs h-7 text-slate-700 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 cursor-pointer font-sans"
              >
                View Feed
              </Button>
            </div>
          )
        })}
      </div>

      {/* Full-Screen Feed Detail Modal Dialog */}
      {selectedCamera && (
        <Dialog open={!!selectedCamera} onOpenChange={() => setSelectedCamera(null)}>
          <DialogContent className="w-[95vw] max-w-6xl h-[88vh] max-h-[860px] bg-white border border-slate-200 text-slate-900 p-4 sm:p-6 flex flex-col overflow-hidden rounded-2xl shadow-2xl font-sans">
            {/* Modal Header */}
            <DialogHeader className="border-b border-slate-100 pb-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-mono">
                      <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-xs">
                        {selectedCamera.code}
                      </span>
                      <span>{selectedCamera.name} • Live Stream Feed</span>
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Edge-AI Jetson Vision Stream • {selectedCamera.resolution} • {selectedCamera.latencyMs}ms latency
                    </p>
                  </div>
                </div>

                {/* Camera Selector Tabs in Header */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {feeds.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedCamera(f)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5',
                        selectedCamera.id === f.id
                          ? 'bg-sky-600 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      )}
                    >
                      <span>{f.code}</span>
                      <span className="hidden md:inline">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </DialogHeader>

            {/* Modal Body - Full Responsive Height */}
            <div className="flex-1 py-3 overflow-y-auto min-h-0 space-y-3">
              {selectedCamera.code === 'C01' ? (
                <LiveEntranceModalStream feed={selectedCamera} />
              ) : selectedCamera.code === 'C05' ? (
                <LiveCheckoutModalStream feed={selectedCamera} />
              ) : (
                <div className="space-y-3 font-mono">
                  <div className="relative w-full h-80 sm:h-96 md:h-[480px] rounded-xl bg-[#070A0F] border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                    <div className="flex items-center justify-between text-xs font-mono text-cyan-400 z-10">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Stream: Hardware-Accelerated RTSP</span>
                      </span>
                      <span>Latency: {selectedCamera.latencyMs}ms • {selectedCamera.fps} FPS</span>
                    </div>

                    <div className="self-center text-center my-auto">
                      <Camera className="h-14 w-14 text-cyan-400/40 mx-auto mb-3 animate-pulse" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        {selectedCamera.name} Section ({selectedCamera.code})
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        Active Spatial Vision Tracking • {selectedCamera.resolution}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono z-10 pt-2 border-t border-slate-800">
                      <span>Detection Model: YOLOv8-Retail-Edge</span>
                      <span className="text-emerald-400 font-bold">100% On-Device Neural Processing</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Real-Time Telemetry Summary</span>
                      <p className="text-xs text-slate-600 mt-0.5">{selectedCamera.summary}</p>
                    </div>
                    <span className={cn(
                      'text-xs font-mono px-2 py-1 rounded font-bold',
                      selectedCamera.status === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    )}>
                      {selectedCamera.status === 'CRITICAL' ? 'ALERT' : 'STREAM NOMINAL'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
