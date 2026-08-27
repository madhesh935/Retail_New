import logging
from ultralytics import YOLO

from app.services.vision_utils import (
    decode_and_normalize_frame,
    reset_yolo_trackers,
    STABLE_TRACKER_YAML,
)

logger = logging.getLogger(__name__)


class EntranceMonitor:
    def __init__(self, model_path="yolo11n.pt"):
        self.model_path = model_path
        self.model = None

        self.total_entered = 0
        self.total_exited = 0
        self.tracked_centroids = {}

        # Line at mid-frame after normalize (480h → y=240)
        self.line_y = None

    def initialize_model(self):
        if self.model is None:
            logger.info("Initializing YOLO model for Entrance...")
            self.model = YOLO(self.model_path)
            logger.info("YOLO model loaded for Entrance.")

    def process_frame(self, image_bytes: bytes):
        if self.model is None:
            self.initialize_model()

        frame = decode_and_normalize_frame(image_bytes)
        if frame is None:
            logger.error("Failed to decode frame bytes in EntranceMonitor")
            return self.get_status()

        height, _width = frame.shape[:2]
        if self.line_y is None:
            self.line_y = height // 2

        try:
            results = self.model.track(
                frame,
                classes=[0],
                conf=0.5,
                persist=True,
                verbose=False,
                tracker=STABLE_TRACKER_YAML,
            )
        except Exception as e:
            logger.warning("Entrance track failed (%s); resetting trackers", e)
            reset_yolo_trackers(self.model)
            return self.get_status()

        current_ids = set()
        detections = []
        in_frame_count = 0

        if results and results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes
            track_ids = boxes.id.int().cpu().tolist()
            confs = boxes.conf.cpu().tolist()
            xywh = boxes.xywh.cpu().tolist()
            xyxy = boxes.xyxy.cpu().tolist()

            in_frame_count = len(track_ids)

            for i, track_id in enumerate(track_ids):
                current_ids.add(track_id)

                cx, cy, _, _ = xywh[i]
                x1, y1, x2, y2 = xyxy[i]

                if track_id in self.tracked_centroids:
                    prev_cy = self.tracked_centroids[track_id][-1][1]

                    if prev_cy > self.line_y and cy <= self.line_y:
                        self.total_entered += 1
                    elif prev_cy < self.line_y and cy >= self.line_y:
                        self.total_exited += 1
                else:
                    self.tracked_centroids[track_id] = []

                self.tracked_centroids[track_id].append((cx, cy))

                if len(self.tracked_centroids[track_id]) > 30:
                    self.tracked_centroids[track_id] = self.tracked_centroids[track_id][-30:]

                detections.append({
                    "trackId": f"P-{track_id}",
                    "conf": f"{confs[i]:.2f}",
                    "position": f"({int(cx)}, {int(cy)})",
                    "bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                })

        lost_ids = set(self.tracked_centroids.keys()) - current_ids
        for track_id in lost_ids:
            del self.tracked_centroids[track_id]

        return self.get_status(in_frame=in_frame_count, detections=detections)

    def get_status(self, in_frame=0, detections=None):
        return {
            "total_entered": self.total_entered,
            "total_exited": self.total_exited,
            "current_occupancy": max(0, self.total_entered - self.total_exited),
            "in_frame_count": in_frame,
            "detections": detections or [],
        }

    def reset(self):
        self.total_entered = 0
        self.total_exited = 0
        self.tracked_centroids = {}
        if self.model is not None:
            reset_yolo_trackers(self.model)
        return self.get_status()


entrance_monitor = EntranceMonitor()
