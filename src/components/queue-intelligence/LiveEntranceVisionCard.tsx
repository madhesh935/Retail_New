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
  const prevEnteredRef = useRef<number>(0)
  
  // Use the global store's occupancy count directly for the KPI
  const currentOccupancy = useAppStore(s => s.storeInfo?.currentOccupancy || 0)
  
  // Get the update function
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
          
          const currentEntered = data.total_entered || 0;
          if (currentEntered > prevEnteredRef.current) {
            const diff = currentEntered - prevEnteredRef.current;
            const globalOccupancy = useAppStore.getState().storeInfo?.currentOccupancy || 0;
            // ONLY add the delta to the global store, so we don't overwrite checkout decrements
            useAppStore.getState().updateOccupancy(globalOccupancy + diff, 0);
            prevEnteredRef.current = currentEntered;
          }
          setTotalEntered(currentEntered);
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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Live Entrance Vision Pipeline</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40 font-normal">
                CAM-01 (Entrance)
              </span>
            </h3>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex justify-center mb-3">
        <div className="w-1/2 bg-[#131D31] rounded p-2 border border-[#1E293B] flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><ArrowUp className="w-3 h-3 text-cyan-400"/> ENTERED (OCCUPANCY)</span>
          <span className="text-xl font-bold text-cyan-400">{currentOccupancy}</span>
        </div>
      </div>

      {/* Live Video Player */}
      <div className="relative h-64 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between shadow-inner touch-none">
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
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>Real-Time Person Tracking &amp; Line Crossing</span>
        </span>
        <span className="text-emerald-400 font-bold">100% Edge Processing</span>
      </div>
    </div>
  )
}
