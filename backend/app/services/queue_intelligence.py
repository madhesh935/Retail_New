import cv2
import time
import numpy as np
import logging
from ultralytics import YOLO

logger = logging.getLogger(__name__)

class QueueMonitor:
    def __init__(self, model_path="yolo11n.pt", lane_id: str = "lane-1"):
        self.model_path = model_path
        self.model = None
        self.lane_id = lane_id
        
        # State variables
        self.current_people_count = 0
        self.tracked_people = {}  # dict mapping track_id -> start_time
        self.completed_wait_times = [] # list of wait times in seconds for average calculation

    def initialize_model(self):
        """Initializes the YOLO model."""
        if self.model is None:
            logger.info("Initializing YOLO model...")
            self.model = YOLO(self.model_path)
            logger.info("YOLO model loaded.")

    def process_frame(self, image_bytes: bytes):
        """
        Processes a single JPEG frame bytes array.
        Returns the updated stats and optionally annotated frame if needed.
        """
        if self.model is None:
            self.initialize_model()

        # Decode image from bytes
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if frame is None:
            logger.error("Failed to decode frame bytes")
            return self.get_status()

        # Run YOLO inference with tracking
        # class=0 is person in COCO dataset
        results = self.model.track(frame, classes=[0], conf=0.6, persist=True, verbose=False)
        
        current_ids = set()
        now = time.time()
        detections = []
        
        if results and results[0].boxes and results[0].boxes.id is not None:
            boxes = results[0].boxes
            track_ids = boxes.id.int().cpu().tolist()
            confs = boxes.conf.cpu().tolist()
            
            for i, track_id in enumerate(track_ids):
                current_ids.add(track_id)
                # New person detected
                if track_id not in self.tracked_people:
                    self.tracked_people[track_id] = now
                    
                detections.append({
                    "trackId": f"T-{track_id}",
                    "conf": f"{confs[i]:.2f}",
                    "position": f"Queue Pos #{i+1}"
                })
                    
        self.current_people_count = len(current_ids)
        
        # Check for people who left the frame
        missing_ids = list(set(self.tracked_people.keys()) - current_ids)
        for m_id in missing_ids:
            start_time = self.tracked_people.pop(m_id)
            wait_duration = now - start_time
            # Only record if they were present for at least 2 seconds
            if wait_duration > 2.0:
                self.completed_wait_times.append(wait_duration)
                
                if len(self.completed_wait_times) > 100:
                    self.completed_wait_times.pop(0)

        status = self.get_status()
        status["detections"] = detections
        return status

    def get_status(self):
        """Returns the current queue status."""
        avg_time = 0
        if self.completed_wait_times:
            avg_time = sum(self.completed_wait_times) / len(self.completed_wait_times)
        
        # Incorporate active waiting times into the average if queue is active
        if not self.completed_wait_times and self.tracked_people:
            now = time.time()
            active_times = [now - start for start in self.tracked_people.values()]
            avg_time = sum(active_times) / len(active_times)
        
        return {
            "lane_id": self.lane_id,
            "people_count": self.current_people_count,
            "average_wait_time_seconds": round(avg_time, 2),
            "total_completed_visits": len(self.completed_wait_times)
        }

# Registry of monitors per lane (lane-1 through lane-4)
_MONITOR_REGISTRY: dict[str, QueueMonitor] = {}

def get_monitor(lane_id: str = "lane-1") -> QueueMonitor:
    """Returns (or lazily creates) a QueueMonitor for the given lane_id."""
    global _MONITOR_REGISTRY
    if lane_id not in _MONITOR_REGISTRY:
        _MONITOR_REGISTRY[lane_id] = QueueMonitor(model_path="yolo11n.pt", lane_id=lane_id)
    return _MONITOR_REGISTRY[lane_id]

# Default global instance for backwards compatibility (lane-1 / C1)
queue_monitor = get_monitor("lane-1")
