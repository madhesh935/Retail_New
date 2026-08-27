import React, { useEffect, useRef, useState } from 'react';
import { openPreferredCameraStream, stopMediaStream } from '@/lib/preferredCamera';
import { useAppStore } from '@/store/useAppStore';

interface QueueStats {
  people_count: number;
  average_wait_time_seconds: number;
  total_completed_visits: number;
}

const QueueCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preferredCameraLabel = useAppStore((s) => s.preferredCameraLabel);

  // Initialize camera and WebSocket
  useEffect(() => {
    let intervalId: number;
    let mediaStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const { stream } = await openPreferredCameraStream({
          preferredLabel: preferredCameraLabel,
        });
        mediaStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
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
          const data: QueueStats = JSON.parse(event.data);
          setStats(data);
        };

        wsRef.current.onerror = (e) => {
          console.error("WebSocket Error:", e);
          setError("WebSocket connection failed. Is the backend running?");
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket Disconnected");
          clearInterval(intervalId);
        };

      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Failed to access DroidCam/webcam. Allow camera permission and keep DroidCam open.");
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (wsRef.current) wsRef.current.close();
      stopMediaStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [preferredCameraLabel]);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const context = canvas.getContext('2d');
    if (context) {
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to JPEG blob to save bandwidth (adjust quality as needed)
      canvas.toBlob((blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob);
        }
      }, 'image/jpeg', 0.6);
    }
  };

  return (
    <div className="p-5 font-sans select-none space-y-4">
      <h2 className="text-base font-bold text-slate-900">Smart Queue Intelligence</h2>
      
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 flex-wrap">
        {/* Camera Feed */}
        <div className="flex-1 min-w-[300px] max-w-[600px]">
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full block object-cover" 
            />
            {!isStreaming && !error && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 font-mono text-xs">
                Loading Camera...
              </div>
            )}
            {/* Hidden canvas used for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Stats Panel */}
        <div className="flex-1 min-w-[250px] bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Queue Stats</h3>
          {stats ? (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">People at Counter</div>
                <div className="text-2xl font-bold font-mono text-slate-900">{stats.people_count}</div>
              </div>
              
              <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Wait Time</div>
                <div className="text-2xl font-bold font-mono text-amber-800">
                  {stats.average_wait_time_seconds.toFixed(1)} <span className="text-xs font-normal text-slate-500">sec</span>
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-2xs">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Visits Processed</div>
                <div className="text-2xl font-bold font-mono text-emerald-700">{stats.total_completed_visits}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Waiting for backend connection...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueCamera;
