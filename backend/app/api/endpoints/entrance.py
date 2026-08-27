from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.services.entrance_intelligence import entrance_monitor

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/stream")
async def websocket_entrance_stream(websocket: WebSocket):
    """
    WebSocket endpoint for Entrance camera feed.
    Receives JPEG frames, processes them for people counting (entry/exit),
    and returns telemetry.
    """
    await websocket.accept()
    logger.info("Client connected to Entrance WebSocket stream.")
    entrance_monitor.initialize_model()

    try:
        while True:
            message = await websocket.receive()
            msg_type = message.get("type")

            if msg_type == "websocket.disconnect":
                break

            image_bytes = message.get("bytes")
            if not image_bytes:
                # Ignore text/control frames (e.g. browser pings)
                continue

            status = entrance_monitor.process_frame(image_bytes)
            await websocket.send_json(status)

    except WebSocketDisconnect:
        logger.info("Client disconnected from Entrance WebSocket stream.")
    except Exception as e:
        logger.error(f"Error in Entrance WebSocket stream: {e}")

@router.get("/status")
def get_entrance_status():
    """
    Returns current entrance counts without needing a WebSocket.
    """
    return entrance_monitor.get_status()

@router.post("/reset")
def reset_entrance_counters():
    """
    Resets the entrance/exit counters (e.g. for a new day).
    """
    return entrance_monitor.reset()
