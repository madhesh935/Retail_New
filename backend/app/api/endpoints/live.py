from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging

from app.services.broadcast import manager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/updates")
async def websocket_live_updates(websocket: WebSocket):
    """
    Broadcast-only channel: every connected client receives a DATA_CHANGED
    push the instant any REST endpoint mutates store data. Clients don't
    send anything meaningful here besides keepalive pings.
    """
    await manager.connect(websocket)
    logger.info("Client connected to live updates channel.")
    try:
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Error in live updates channel: {e}")
    finally:
        manager.disconnect(websocket)
        logger.info("Client disconnected from live updates channel.")
