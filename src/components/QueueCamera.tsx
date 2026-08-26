import React, { useEffect, useRef, useState } from 'react';

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

  // Initialize camera and WebSocket
  useEffect(() => {
    let intervalId: number;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        setError("Failed to access camera. Please allow permissions.");
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (wsRef.current) wsRef.current.close();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Smart Queue Intelligence</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Camera Feed */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '600px' }}>
          <div style={{ position: 'relative', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', display: 'block' }} 
            />
            {!isStreaming && !error && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff' }}>
                Loading Camera...
              </div>
            )}
            {/* Hidden canvas used for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Stats Panel */}
        <div style={{ flex: '1', minWidth: '250px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <h3>Live Queue Stats</h3>
          {stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>People at Counter</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{stats.people_count}</div>
              </div>
              
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Wait Time</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>
                  {stats.average_wait_time_seconds.toFixed(1)} <span style={{ fontSize: '16px', fontWeight: 'normal' }}>sec</span>
                </div>
              </div>
              
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Visits Processed</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{stats.total_completed_visits}</div>
              </div>
            </div>
          ) : (
            <p>Waiting for backend connection...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueCamera;
