import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Eye,
  Scan,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
  Settings2,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { CameraRoi } from '@/store/slices/settingsSlice'
import { openPreferredCameraStream, stopMediaStream } from '@/lib/preferredCamera'
import { markYoloActive } from '@/lib/yoloLaneRegistry'

interface LiveQueueVisionCardProps {
  laneCode?: string
  laneName?: string
  queueCount?: number
  waitTime?: string
}

export const LiveQueueVisionCard: React.FC<LiveQueueVisionCardProps> = ({
  laneCode = 'C1',
  laneName = 'Counter C1 (Assisted)',
  queueCount: initialQueueCount = 8,
  waitTime: initialWaitTime = '5.4 min',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const ipCameraUrls = useAppStore((s) => s.ipCameraUrls)
  const currentIpCameraUrl = ipCameraUrls[laneCode]
  const preferredCameraLabel = useAppStore((s) => s.preferredCameraLabel)

  // Subscribe directly to the queue store — this updates every 4s from the polling loop
  const queues = useAppStore((s) => s.queues)
  const laneNum = parseInt(laneCode.replace('C', '')) || 1
  const liveStoreQ = queues.find((q) => q.laneNumber === laneNum)
  
  // Local WebSocket state (updated when YOLO camera is connected)
  const [wsQueueCount, setWsQueueCount] = React.useState<number | null>(null)
  const [wsWaitTime, setWsWaitTime] = React.useState<string | null>(null)

  // Display: prefer YOLO WebSocket if connected, fall back to live store value, then prop
  const liveQueueCount = wsQueueCount !== null
    ? wsQueueCount
    : (liveStoreQ?.currentQueueLength ?? initialQueueCount)
  const liveWaitTime = wsWaitTime !== null
    ? wsWaitTime
    : liveStoreQ
      ? `${(liveStoreQ.currentWaitTimeSeconds / 60).toFixed(1)} min`
      : initialWaitTime

  const [, setIsStreaming] = useState(false)
  const [, setDetectedShoppers] = useState<{trackId: string, conf: string, position: string}[]>([])

  // Sync wsQueueCount with new lane selection (reset WS state so store value shows)
  useEffect(() => {
    setWsQueueCount(null)
    setWsWaitTime(null)
  }, [laneCode])

  // ROI State
  const currentRoi = useAppStore((s) => s.cameraRois[laneCode] || { x: 0, y: 0, width: 1, height: 1 })
  const setCameraRoi = useAppStore((s) => s.setCameraRoi)
  
  const [isEditingRoi, setIsEditingRoi] = useState(false)
  const [tempRoi, setTempRoi] = useState<CameraRoi>(currentRoi)
  const [dragState, setDragState] = useState<{type: 'move'|'resize', startX: number, startY: number, startRoi: CameraRoi} | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempRoi(currentRoi)
  }, [currentRoi, laneCode])

  useEffect(() => {
    if (!dragState || !containerRef.current) return
    const container = containerRef.current
    
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const dx = (e.clientX - dragState.startX) / rect.width
      const dy = (e.clientY - dragState.startY) / rect.height
      
      let newRoi = { ...dragState.startRoi }
      if (dragState.type === 'move') {
        newRoi.x = Math.max(0, Math.min(1 - newRoi.width, dragState.startRoi.x + dx))
        newRoi.y = Math.max(0, Math.min(1 - newRoi.height, dragState.startRoi.y + dy))
      } else if (dragState.type === 'resize') {
        newRoi.width = Math.max(0.1, Math.min(1 - newRoi.x, dragState.startRoi.width + dx))
        newRoi.height = Math.max(0.1, Math.min(1 - newRoi.y, dragState.startRoi.height + dy))
      }
      setTempRoi(newRoi)
    }
    
    const handlePointerUp = () => {
      setDragState(null)
    }
    
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState])

  const handlePointerDown = (e: React.PointerEvent, type: 'move' | 'resize') => {
    e.stopPropagation()
    e.preventDefault()
    setDragState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startRoi: { ...tempRoi }
    })
  }

  const handleSaveRoi = () => {
    setCameraRoi(laneCode, tempRoi)
    setIsEditingRoi(false)
  }

  // Initialize camera and WebSocket
  useEffect(() => {
    let intervalId: number;
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!currentIpCameraUrl) {
          const { stream } = await openPreferredCameraStream({
            preferredLabel: preferredCameraLabel,
          });
          mediaStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
        setIsStreaming(true);

        // Connect to per-lane FastAPI WebSocket
        const laneNum = parseInt(laneCode.replace('C', '')) || 1
        const wsUrl = `ws://127.0.0.1:8000/api/v1/queue/stream/lane-${laneNum}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket Connected");
          // Start capturing and sending frames every 500ms
          intervalId = window.setInterval(captureAndSendFrame, 500);
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setWsQueueCount(data.people_count);
          setWsWaitTime(`${(data.average_wait_time_seconds / 60).toFixed(1)} min`);
          if (data.detections) {
            setDetectedShoppers(data.detections);
          }

          // Mark this lane as YOLO-active so the polling loop won't overwrite the count
          const laneNum = parseInt(laneCode.replace('C', '')) || 1;
          const laneId = `lane-${laneNum}`;
          markYoloActive(laneId);

          // Push YOLO count directly into the store so Counter Cards also update
          useAppStore.getState().updateLaneQueue(laneId, data.people_count, data.average_wait_time_seconds);
        };
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (wsRef.current) wsRef.current.close();
      stopMediaStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [currentIpCameraUrl, laneCode, preferredCameraLabel]);

  const captureAndSendFrame = () => {
    if (!canvasRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = canvasRef.current;
    let sourceElement: HTMLVideoElement | HTMLImageElement | null = null;
    let sourceWidth = 0;
    let sourceHeight = 0;

    if (currentIpCameraUrl && imgRef.current) {
      sourceElement = imgRef.current;
      sourceWidth = imgRef.current.naturalWidth;
      sourceHeight = imgRef.current.naturalHeight;
    } else if (videoRef.current) {
      sourceElement = videoRef.current;
      sourceWidth = videoRef.current.videoWidth;
      sourceHeight = videoRef.current.videoHeight;
    }

    if (!sourceElement || sourceWidth === 0 || sourceHeight === 0) return;
    
    const context = canvas.getContext('2d');
    if (context) {
      try {
        const roi = useAppStore.getState().cameraRois[laneCode] || { x: 0, y: 0, width: 1, height: 1 }
        
        const sx = sourceWidth * roi.x
        const sy = sourceHeight * roi.y
        const sWidth = sourceWidth * roi.width
        const sHeight = sourceHeight * roi.height
        
        if (canvas.width !== sWidth || canvas.height !== sHeight) {
          canvas.width = sWidth;
          canvas.height = sHeight;
        }

        context.drawImage(sourceElement, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      } catch (err) {
        // Tainted canvas from CORS can cause errors
        console.warn("Canvas capture failed:", err);
      }
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      }, 'image/jpeg', 0.6);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-mono">
      {/* Header with People Count Badge and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 border border-sky-200 text-sky-600">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-sans">
              <span>Live Checkout Vision Pipeline</span>
              <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-mono font-normal">
                CAM-06 ({laneCode})
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* People Count Badge */}
          <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs font-mono inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0">
            <Users className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span className="whitespace-nowrap">{liveQueueCount} Shoppers ({liveWaitTime})</span>
          </span>

          {isEditingRoi ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={() => { setIsEditingRoi(false); setTempRoi(currentRoi); }}>
                Cancel
              </Button>
              <Button variant="default" size="sm" className="h-7 text-xs bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSaveRoi}>
                <Save className="h-3 w-3 mr-1" /> Save ROI
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setIsEditingRoi(true)}>
              <Settings2 className="h-3 w-3 mr-1" /> Adjust ROI
            </Button>
          )}
        </div>
      </div>

      {/* Live Video Player */}
      <div 
        ref={containerRef}
        className="relative h-64 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between shadow-inner touch-none"
      >
        {/* Real Webcam Feed or IP Camera Stream */}
        {currentIpCameraUrl ? (
          <img
            ref={imgRef}
            src={`http://127.0.0.1:8000/api/v1/queue/proxy?url=${encodeURIComponent(currentIpCameraUrl)}`}
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt={`Camera ${laneCode} Stream`}
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Scanline pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* AI Overlay Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Active ROI Box Display (Non-editable) */}
          {!isEditingRoi && (
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
                ROI: {laneCode}
              </div>
            </div>
          )}

          {/* Interactive ROI Box */}
          {isEditingRoi && (
            <div 
              className="absolute border-2 border-dashed border-rose-500 bg-rose-500/20 rounded pointer-events-auto cursor-move shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              style={{
                left: `${tempRoi.x * 100}%`,
                top: `${tempRoi.y * 100}%`,
                width: `${tempRoi.width * 100}%`,
                height: `${tempRoi.height * 100}%`
              }}
              onPointerDown={(e) => handlePointerDown(e, 'move')}
            >
              <div className="absolute -top-6 left-0 bg-rose-600 px-2 py-0.5 rounded text-[10px] text-white font-bold whitespace-nowrap pointer-events-none">
                Drag to Move, Corner to Resize
              </div>
              
              {/* Resize Handle */}
              <div 
                className="absolute -bottom-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-2 border-white cursor-se-resize flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                onPointerDown={(e) => handlePointerDown(e, 'resize')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 mt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-sky-600" />
            <span>Target: <strong className="text-slate-800">{laneCode} (Elena Rostova)</strong></span>
          </span>
          <span className="text-slate-300">•</span>
          <span>Inference: <strong className="text-emerald-700">2 FPS (WebSocket)</strong></span>
        </div>
        <span className="text-emerald-700 font-bold">100% Edge Processing</span>
      </div>
    </div>
  )
}
