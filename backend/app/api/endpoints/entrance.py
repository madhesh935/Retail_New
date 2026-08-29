from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.services.entrance_intelligence import entrance_monitor
from app.db.database import SessionLocal
from app.db.models import StoreModel
from app.services.broadcast import broadcast_change

router = APIRouter()
logger = logging.getLogger(__name__)

# Tracks what's already been written to the DB so we only write (and broadcast)
# when the live YOLO count actually changes, instead of on every frame.
_last_synced_total_entered = 0
_last_synced_occupancy: int | None = None


def _sync_entrance_status_to_db(status: dict) -> None:
    global _last_synced_total_entered, _last_synced_occupancy

    occupancy = status["current_occupancy"]
    entered_delta = status["total_entered"] - _last_synced_total_entered

    if entered_delta == 0 and occupancy == _last_synced_occupancy:
        return

    db = SessionLocal()
    try:
        store = db.query(StoreModel).first()
        if not store:
            return

        store.current_occupancy = occupancy
        if store.max_capacity:
            store.occupancy_rate = round((occupancy / store.max_capacity) * 100, 1)
        if entered_delta > 0:
            store.todays_total_footfall += entered_delta
        if occupancy > store.peak_occupancy_today:
            store.peak_occupancy_today = occupancy

        db.commit()
        broadcast_change("store")
    finally:
        db.close()

    _last_synced_total_entered = status["total_entered"]
    _last_synced_occupancy = occupancy


@router.websocket("/stream")
async def websocket_entrance_stream(websocket: WebSocket):
    """
    WebSocket endpoint for Entrance camera feed.
    Receives JPEG frames, processes them for people counting (entry/exit),
    persists live occupancy/footfall to the store DB row (broadcasting the
    change to every connected client), and returns telemetry to the caller.
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
            _sync_entrance_status_to_db(status)
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
    global _last_synced_total_entered, _last_synced_occupancy
    _last_synced_total_entered = 0
    _last_synced_occupancy = None
    return entrance_monitor.reset()
