import time
import logging
from ultralytics import YOLO

from app.services.vision_utils import (
    decode_and_normalize_frame,
    reset_yolo_trackers,
    STABLE_TRACKER_YAML,
)

logger = logging.getLogger(__name__)


class QueueMonitor:
    def __init__(self, model_path="yolo11n.pt", lane_id: str = "lane-1"):
        self.model_path = model_path
        self.model = None
        self.lane_id = lane_id

        self.current_people_count = 0
        self.tracked_people = {}
        self.completed_wait_times = []

    def initialize_model(self):
        if self.model is None:
            logger.info("Initializing YOLO model...")
            self.model = YOLO(self.model_path)
            logger.info("YOLO model loaded.")

    def process_frame(self, image_bytes: bytes):
        if self.model is None:
            self.initialize_model()

        frame = decode_and_normalize_frame(image_bytes)
        if frame is None:
            logger.error("Failed to decode frame bytes")
            return self.get_status()

        try:
            results = self.model.track(
                frame,
                classes=[0],
                conf=0.6,
                persist=True,
                verbose=False,
                tracker=STABLE_TRACKER_YAML,
            )
        except Exception as e:
            logger.warning("Queue track failed for %s (%s); resetting trackers", self.lane_id, e)
            reset_yolo_trackers(self.model)
            return self.get_status()

        current_ids = set()
        now = time.time()
        detections = []

        if results and results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes
            track_ids = boxes.id.int().cpu().tolist()
            confs = boxes.conf.cpu().tolist()

            for i, track_id in enumerate(track_ids):
                current_ids.add(track_id)
                if track_id not in self.tracked_people:
                    self.tracked_people[track_id] = now

                detections.append({
                    "trackId": f"T-{track_id}",
                    "conf": f"{confs[i]:.2f}",
                    "position": f"Queue Pos #{i + 1}",
                })

        self.current_people_count = len(current_ids)

        missing_ids = list(set(self.tracked_people.keys()) - current_ids)
        for m_id in missing_ids:
            start_time = self.tracked_people.pop(m_id)
            wait_duration = now - start_time
            if wait_duration > 2.0:
                self.completed_wait_times.append(wait_duration)
                if len(self.completed_wait_times) > 100:
                    self.completed_wait_times.pop(0)

        status = self.get_status()
        status["detections"] = detections
        return status

    def get_status(self):
        avg_time = 0
        if self.completed_wait_times:
            avg_time = sum(self.completed_wait_times) / len(self.completed_wait_times)

        if not self.completed_wait_times and self.tracked_people:
            now = time.time()
            active_times = [now - start for start in self.tracked_people.values()]
            avg_time = sum(active_times) / len(active_times)

        return {
            "lane_id": self.lane_id,
            "people_count": self.current_people_count,
            "average_wait_time_seconds": round(avg_time, 2),
            "total_completed_visits": len(self.completed_wait_times),
        }


_MONITOR_REGISTRY: dict[str, QueueMonitor] = {}


def get_monitor(lane_id: str = "lane-1") -> QueueMonitor:
    global _MONITOR_REGISTRY
    if lane_id not in _MONITOR_REGISTRY:
        _MONITOR_REGISTRY[lane_id] = QueueMonitor(model_path="yolo11n.pt", lane_id=lane_id)
    return _MONITOR_REGISTRY[lane_id]


queue_monitor = get_monitor("lane-1")
