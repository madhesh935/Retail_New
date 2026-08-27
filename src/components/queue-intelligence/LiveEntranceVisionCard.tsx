import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  Users,
  CheckCircle2,
  Cpu,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const LiveEntranceVisionCard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  const [totalEntered, setTotalEntered] = useState(0)
  const [totalExited, setTotalExited] = useState(0)
  const [currentOccupancy, setCurrentOccupancy] = useState(0)
  
  // Update global occupancy when it changes here
  const updateOccupancy = useAppStore(s => s.updateOccupancy)

  useEffect(() => {
    let intervalId: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const wsUrl = `ws://127.0.0.1:8000/api/v1/entrance/stream`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket Connected for Entrance");
          intervalId = window.setInterval(captureAndSendFrame, 500);
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setTotalEntered(data.total_entered);
          setTotalExited(data.total_exited);
          setCurrentOccupancy(data.current_occupancy);
          
          // Sync with Zustand store
          updateOccupancy(data.current_occupancy, 0, 0); // Assuming rate calculation is done elsewhere or ignored for now
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
  }, [updateOccupancy]);

  const captureAndSendFrame = () => {
    if (!canvasRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    const canvas = canvasRef.current;
    const sourceElement = videoRef.current;
    
    if (!sourceElement || sourceElement.videoWidth === 0) return;
    
    const context = canvas.getContext('2d');
    if (context) {
      if (canvas.width !== sourceElement.videoWidth) {
        canvas.width = sourceElement.videoWidth;
        canvas.height = sourceElement.videoHeight;
      }
      context.drawImage(sourceElement, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      }, 'image/jpeg', 0.6);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-sans">
              <span>Live Entrance Vision Pipeline</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-normal">
                CAM-01 (Entrance)
              </span>
            </h3>
          </div>
        </div>

        {/* Occupancy Count Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-2xs">
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>{currentOccupancy || totalEntered} Shoppers Inflow</span>
          </span>
        </div>
      </div>

      {/* Live Video Player */}
      <div className="relative h-80 sm:h-96 md:h-[480px] rounded-xl bg-[#070A0F] border border-slate-800 overflow-hidden p-3 flex flex-col justify-between shadow-inner touch-none">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Counting Line Overlay */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400 pointer-events-none" 
          style={{ top: '50%' }}
        />
        <div className="absolute left-2 text-[9px] text-cyan-400 font-bold" style={{ top: 'calc(50% - 15px)' }}>
          ENTRY THRESHOLD
        </div>

        {/* Top HUD */}
        <div className="flex items-center justify-between text-[10px] text-cyan-300 z-10">
          <span className="flex items-center gap-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RTSP STREAM • CAM-01</span>
          </span>
        </div>

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 pt-1 relative mt-auto">
          <span>Inference: <strong className="text-emerald-400">YOLOv8 Edge</strong></span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 mt-2">
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-sky-600" />
          <span>Real-Time Person Tracking &amp; Line Crossing</span>
        </span>
        <span className="text-emerald-700 font-bold">100% Edge Processing</span>
      </div>
    </div>
  )
}
