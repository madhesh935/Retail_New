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

interface LiveQueueVisionCardProps {
  laneCode: string
  laneName: string
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

  const [liveQueueCount, setLiveQueueCount] = useState(initialQueueCount)
  const [liveWaitTime, setLiveWaitTime] = useState(initialWaitTime)
  const [isStreaming, setIsStreaming] = useState(false)
  const [detectedShoppers, setDetectedShoppers] = useState<{trackId: string, conf: string, position: string}[]>([])

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

    const startCamera = async () => {
      try {
        if (!currentIpCameraUrl) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
        setIsStreaming(true);

        // Connect to FastAPI WebSocket
        const wsUrl = `ws://127.0.0.1:8000/api/v1/queue/stream`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket Connected");
          // Start capturing and sending frames every 500ms
          intervalId = window.setInterval(captureAndSendFrame, 500);
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLiveQueueCount(data.people_count);
          setLiveWaitTime(`${(data.average_wait_time_seconds / 60).toFixed(1)} min`);
          if (data.detections) {
            setDetectedShoppers(data.detections);
          }

          // Update the global store for the current lane so Operational Counter Cards reflect live data
          const laneNum = parseInt(laneCode.replace('C', '')) || 1;
          const laneId = `lane-${laneNum}`;
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
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [currentIpCameraUrl]);

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

  const renderShoppers = detectedShoppers.length > 0 ? detectedShoppers : [];

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Live Checkout Edge Vision Pipeline</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 font-normal">
                CAM-06 ({laneCode})
              </span>
            </h3>
          </div>
        </div>
        <div>
          {isEditingRoi ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs border-[#1E293B] bg-transparent text-slate-300" onClick={() => { setIsEditingRoi(false); setTempRoi(currentRoi); }}>
                Cancel
              </Button>
              <Button variant="default" size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white" onClick={handleSaveRoi}>
                <Save className="h-3 w-3 mr-1" /> Save ROI
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-xs border-cyan-500/30 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-950/50 hover:text-cyan-300 transition-colors" onClick={() => setIsEditingRoi(true)}>
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
            backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* Top HUD */}
        <div className="flex items-center justify-between text-[10px] text-cyan-300 z-10">
          <span className="flex items-center gap-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RTSP STREAM • CAM-06 (Overhead Checkout)</span>
          </span>
          <span className="bg-[#0F172A] px-2 py-0.5 rounded border border-[#1E293B] text-slate-300">
            {laneName}
          </span>
        </div>

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

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 pt-1 relative">
          <span>Target Counter: <strong className="text-white">{laneCode} (Elena Rostova)</strong></span>
          <div className="flex items-center gap-3">
            <span>Inference: <strong className="text-emerald-400">2 FPS (WebSocket)</strong></span>
            <span>Detected Queue: <strong className="text-rose-400">{liveQueueCount} Shoppers ({liveWaitTime})</strong></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>Real-Time Person Tracking &amp; Queue Polygon Extraction</span>
        </span>
        <span className="text-emerald-400 font-bold">100% Edge Processing</span>
      </div>
    </div>
  )
}
