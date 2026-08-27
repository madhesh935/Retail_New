from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Camera


router = APIRouter()


@router.get("/")
def get_cameras(db: Session = Depends(get_db)):
    cameras = db.query(Camera).order_by(Camera.id).all()
    return [
        {
            "id": f"cam-{camera.id:02d}",
            "code": camera.code,
            "name": camera.name,
            "zoneId": camera.zone_id,
            "zoneName": camera.zone_name,
            "rtspUrl": camera.stream_url,
            "status": camera.status,
            "resolution": camera.resolution,
            "fps": camera.fps,
            "targetFps": camera.target_fps,
            "inferenceLatencyMs": camera.inference_latency_ms,
            "modelLoaded": camera.model_loaded,
            "aiTasks": camera.ai_tasks or [],
            "uptimePercent": camera.uptime_percent,
            "activeDetectionsCount": camera.active_detections_count,
            "lensFov": camera.lens_fov,
            "ipAddress": camera.ip_address,
            "macAddress": camera.mac_address,
            "lastHeartbeat": camera.last_heartbeat.isoformat() if camera.last_heartbeat else None,
        }
        for camera in cameras
    ]
