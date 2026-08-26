import cv2
import time
import numpy as np
import logging
from ultralytics import YOLO

logger = logging.getLogger(__name__)

class QueueMonitor:
    """
    Acts as a Checkout / Exit monitor. 
    Uses line-crossing logic to count checked out people.
    """
    def __init__(self, model_path="yolo11n.pt", lane_id: str = "lane-1"):
        self.model_path = model_path
        self.model = None
        self.lane_id = lane_id
        
        # State variables
        self.checked_out_count = 0
        self.tracked_centroids = {}  # dict mapping track_id -> list of (x, y)
        self.line_y = None

    def initialize_model(self):
        """Initializes the YOLO model."""
        if self.model is None:
            logger.info(f"Initializing YOLO model for Checkout Lane {self.lane_id}...")
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

        height, width = frame.shape[:2]
        if self.line_y is None:
            self.line_y = height // 2

        # Run YOLO inference with tracking
        results = self.model.track(frame, classes=[0], conf=0.5, persist=True, verbose=False)
        
        current_ids = set()
        detections = []
        
        if results and results[0].boxes and results[0].boxes.id is not None:
            boxes = results[0].boxes
            track_ids = boxes.id.int().cpu().tolist()
            confs = boxes.conf.cpu().tolist()
            xywh = boxes.xywh.cpu().tolist()
            
            for i, track_id in enumerate(track_ids):
                current_ids.add(track_id)
                cx, cy, _, _ = xywh[i]
                
                if track_id in self.tracked_centroids:
                    prev_cy = self.tracked_centroids[track_id][-1][1]
                    
                    # Passed from top to bottom (Checkout Exit)
                    if prev_cy < self.line_y and cy >= self.line_y:
                        self.checked_out_count += 1
                        
                else:
                    self.tracked_centroids[track_id] = []
                    
                self.tracked_centroids[track_id].append((cx, cy))
                
                if len(self.tracked_centroids[track_id]) > 30:
                    self.tracked_centroids[track_id] = self.tracked_centroids[track_id][-30:]
                    
                detections.append({
                    "trackId": f"T-{track_id}",
                    "conf": f"{confs[i]:.2f}",
                    "position": f"({int(cx)}, {int(cy)})"
                })
                    
        # Clean up lost tracks
        lost_ids = set(self.tracked_centroids.keys()) - current_ids
        for track_id in lost_ids:
            del self.tracked_centroids[track_id]
            
        status = self.get_status()
        status["detections"] = detections
        return status

    def get_status(self):
        """Returns the current checkout status."""
        return {
            "lane_id": self.lane_id,
            "checked_out_count": self.checked_out_count
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
