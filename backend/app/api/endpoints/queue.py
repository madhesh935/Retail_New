from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from app.services.queue_intelligence import queue_monitor
import logging
import httpx

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/proxy")
async def proxy_camera_stream(url: str):
    """
    Proxies an MJPEG stream from an IP Camera to bypass browser CORS restrictions.
    """
    async def stream():
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", url) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk
    return StreamingResponse(stream(), media_type="multipart/x-mixed-replace; boundary=frame")

@router.get("/status")
def get_queue_status():
    """
    Returns the real-time queue intelligence metrics:
    - Current number of people
    - Average wait time at the counter
    - Total completed visits
    """
    return queue_monitor.get_status()

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that receives raw image bytes from the frontend,
    processes them through YOLO, and returns the updated metrics.
    """
    await websocket.accept()
    # Initialize the model on first connection if not already loaded
    queue_monitor.initialize_model()
    
    try:
        while True:
            # Receive frame bytes from client
            image_bytes = await websocket.receive_bytes()
            
            # Process frame using YOLO tracking
            status = queue_monitor.process_frame(image_bytes)
            
            # Send back the updated status
            await websocket.send_json(status)
            
    except WebSocketDisconnect:
        logger.info("Client disconnected from queue streaming.")
    except Exception as e:
        logger.error(f"Error in queue websocket: {e}")
