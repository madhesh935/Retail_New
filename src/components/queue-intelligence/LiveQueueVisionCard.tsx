import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Settings2,
  Save,
  ArrowDown,
  Cpu
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
  // Force use local webcam like entrance
  const currentIpCameraUrl = ""

  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [checkedOutCount, setCheckedOutCount] = useState<number>(0)
  const prevCheckedOutRef = useRef<number>(0)
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
          
          const currentCheckout = data.checked_out_count || 0;
          if (currentCheckout > prevCheckedOutRef.current) {
            const diff = currentCheckout - prevCheckedOutRef.current;
            const currentOccupancy = useAppStore.getState().storeInfo?.currentOccupancy || 0;
            useAppStore.getState().updateOccupancy(Math.max(0, currentOccupancy - diff), 0);
            prevCheckedOutRef.current = currentCheckout;
          }
          setCheckedOutCount(currentCheckout);

          if (data.detections) {
            setDetectedShoppers(data.detections);
          }

          // Update the global store for the current lane so Operational Counter Cards reflect live data
          const laneNum = parseInt(laneCode.replace('C', '')) || 1;
          const laneId = `lane-${laneNum}`;
          useAppStore.getState().updateLaneQueue(laneId, currentCheckout, 0);
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
        // No cropping for checkout, we want the whole frame for line crossing
        if (canvas.width !== sourceWidth || canvas.height !== sourceHeight) {
          canvas.width = sourceWidth;
          canvas.height = sourceHeight;
        }

        context.drawImage(sourceElement, 0, 0, canvas.width, canvas.height);
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
      </div>

      {/* KPI Row */}
      <div className="flex justify-center mb-3">
        <div className="w-1/2 bg-[#131D31] rounded p-2 border border-[#1E293B] flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><ArrowDown className="w-3 h-3 text-cyan-400"/> CHECKED OUT</span>
          <span className="text-xl font-bold text-cyan-400">{checkedOutCount}</span>
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

        {/* Counting Line Overlay */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 pointer-events-none" 
          style={{ top: '50%' }}
        />
        <div className="absolute left-2 text-[9px] text-cyan-400 font-bold" style={{ top: 'calc(50% - 15px)' }}>
          CHECKOUT EXIT THRESHOLD
        </div>

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 pt-1 relative mt-auto">
          <span>Inference: <strong className="text-emerald-400">YOLOv8 Edge</strong></span>
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
