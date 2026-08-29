from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
import time

from app.db.database import get_db, SessionLocal
from app.db.models import QueueModel, IncidentModel
from app.services.queue_intelligence import queue_monitor, get_monitor
from app.services.broadcast import broadcast_change
import logging
import httpx

logger = logging.getLogger(__name__)
router = APIRouter()

# Congestion thresholds for auto-created live incidents, mirrored from the
# frontend's own CONGESTED heuristic (queue length >= 5).
QUEUE_CONGESTION_WAIT_TRIGGER_SECONDS = 300
QUEUE_CONGESTION_CLEAR_SECONDS = 120


def _lane_code_from_lane_id(lane_id: str) -> str:
    try:
        num = int(lane_id.split("-")[1])
    except (IndexError, ValueError):
        num = 1
    return f"C{num}"


def _sync_congestion_incident(db, lane: QueueModel, wait_seconds: int) -> None:
    existing = (
        db.query(IncidentModel)
        .filter(IncidentModel.type == "QUEUE_CONGESTION")
        .filter(IncidentModel.zone == lane.name)
        .filter(IncidentModel.status.notin_(["RESOLVED", "DISMISSED"]))
        .first()
    )

    if lane.status == "CONGESTED" and wait_seconds >= QUEUE_CONGESTION_WAIT_TRIGGER_SECONDS:
        if existing is None:
            inc = IncidentModel(
                id=f"inc-auto-{lane.lane_code.lower()}-{int(time.time())}",
                title=f"{lane.name} Congestion",
                description=(
                    f"{lane.queue_length} shoppers are waiting and average wait has reached "
                    f"{wait_seconds // 60}m {wait_seconds % 60}s, detected live from the checkout camera."
                ),
                severity="CRITICAL" if wait_seconds >= 480 else "HIGH",
                type="QUEUE_CONGESTION",
                zone=lane.name,
                zone_id=None,
                status="ACTIVE",
                camera_code=lane.camera_code,
                recommendation_title="Open a standby counter or reassign staff",
                recommendation_action="OPEN_STANDBY_LANE",
                details={
                    "queue_length": lane.queue_length,
                    "wait_seconds": wait_seconds,
                    "source": "LIVE_VISION_DETECTION",
                },
            )
            db.add(inc)
            db.commit()
            broadcast_change("incidents", incident_id=inc.id)
    elif existing is not None and (existing.details or {}).get("source") == "LIVE_VISION_DETECTION":
        if wait_seconds <= QUEUE_CONGESTION_CLEAR_SECONDS:
            existing.status = "RESOLVED"
            existing.resolved_at = datetime.utcnow()
            db.commit()
            broadcast_change("incidents", incident_id=existing.id)


def _sync_queue_status_to_db(lane_id: str, status: dict) -> None:
    lane_code = _lane_code_from_lane_id(lane_id)
    people_count = status["people_count"]
    wait_seconds = round(status["average_wait_time_seconds"])

    db = SessionLocal()
    try:
        lane = db.query(QueueModel).filter(QueueModel.lane_code == lane_code).first()
        if lane is None:
            return

        if lane.queue_length == people_count and lane.wait_time_seconds == wait_seconds:
            return

        lane.queue_length = people_count
        lane.wait_time_seconds = wait_seconds
        if lane.status != "CLOSED":
            lane.status = "CONGESTED" if people_count >= 5 else "ACTIVE"

        db.commit()
        broadcast_change("queues", lane_code=lane_code)

        _sync_congestion_incident(db, lane, wait_seconds)
    finally:
        db.close()


@router.get("/lanes")
def get_seeded_lanes(db: Session = Depends(get_db)):
    lanes = db.query(QueueModel).order_by(QueueModel.lane_number).all()
    return [
        {
            "id": lane.lane_code,
            "laneNumber": lane.lane_number,
            "name": lane.name,
            "laneType": lane.type,
            "status": lane.status,
            "assignedStaffId": lane.assigned_staff_id,
            "assignedStaffName": lane.cashier_name,
            "currentQueueLength": lane.queue_length,
            "currentWaitTimeSeconds": lane.wait_time_seconds,
            "processingRateItemsPerMinute": lane.processing_rate_items_per_minute,
            "predictedQueueIn10Min": lane.predicted_queue_in_10_min,
            "predictedWaitTimeIn10MinSeconds": lane.predicted_wait_in_10_min_seconds,
            "cameraCode": lane.camera_code,
        }
        for lane in lanes
    ]

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
    Returns the real-time queue intelligence metrics for the default lane (C1):
    - lane_id
    - Current number of people
    - Average wait time at the counter
    - Total completed visits
    """
    return queue_monitor.get_status()

@router.get("/status/{lane_id}")
def get_lane_queue_status(lane_id: str):
    """
    Returns real-time queue intelligence metrics for a specific lane.
    lane_id format: lane-1, lane-2, lane-3, lane-4
    """
    monitor = get_monitor(lane_id)
    return monitor.get_status()

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint (default, backwards-compatible) that receives raw image bytes
    from the frontend, processes them through YOLO for lane-1 (C1), and returns metrics.
    """
    await websocket.accept()
    # Fresh viewing session — clear any stale tracked-person state left over
    # from a previous connection that disconnected mid-track.
    queue_monitor.reset()
    queue_monitor.initialize_model()

    try:
        while True:
            image_bytes = await websocket.receive_bytes()
            status = queue_monitor.process_frame(image_bytes)
            _sync_queue_status_to_db("lane-1", status)
            await websocket.send_json(status)

    except WebSocketDisconnect:
        logger.info("Client disconnected from queue streaming (default lane).")
    except Exception as e:
        logger.error(f"Error in queue websocket: {e}")

@router.websocket("/stream/{lane_id}")
async def websocket_lane_endpoint(websocket: WebSocket, lane_id: str):
    """
    Per-lane WebSocket endpoint. Receives raw image bytes, processes through YOLO
    for the specified lane, and returns metrics tagged with lane_id.
    lane_id format: lane-1, lane-2, lane-3, lane-4
    """
    await websocket.accept()
    monitor = get_monitor(lane_id)
    # Fresh viewing session — clear any stale tracked-person state left over
    # from a previous connection that disconnected mid-track (see
    # QueueMonitor.reset for why this matters).
    monitor.reset()
    monitor.initialize_model()
    
    try:
        while True:
            image_bytes = await websocket.receive_bytes()
            status = monitor.process_frame(image_bytes)
            _sync_queue_status_to_db(lane_id, status)
            await websocket.send_json(status)

    except WebSocketDisconnect:
        logger.info(f"Client disconnected from queue streaming ({lane_id}).")
    except Exception as e:
        logger.error(f"Error in queue websocket for {lane_id}: {e}")
