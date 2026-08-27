"""Shared vision helpers for stable YOLO tracking on live webcam / DroidCam feeds."""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

# Fixed size stops Ultralytics GMC / optical-flow asserts when source resolution flickers
TRACK_FRAME_SIZE = (640, 480)

STABLE_TRACKER_YAML = str(Path(__file__).with_name("bytetrack_stable.yaml"))


def decode_and_normalize_frame(
    image_bytes: bytes,
    size: tuple[int, int] = TRACK_FRAME_SIZE,
):
    """Decode JPEG bytes and resize to a constant WxH for tracker stability."""
    if not image_bytes:
        return None

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        return None

    width, height = size
    if frame.shape[1] != width or frame.shape[0] != height:
        frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)

    return frame


def reset_yolo_trackers(model) -> None:
    """Drop persisted trackers after a camera/source change."""
    predictor = getattr(model, "predictor", None)
    if predictor is None:
        return
    if hasattr(predictor, "trackers"):
        predictor.trackers = []
