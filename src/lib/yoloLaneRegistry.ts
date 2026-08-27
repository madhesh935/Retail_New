/**
 * Lightweight singleton registry that tracks which lanes have an active YOLO
 * WebSocket providing real-time detection data.
 *
 * When a lane is "yolo active", the polling loop in QueueIntelligencePage
 * skips updating that lane so the YOLO count is not overwritten.
 */

const _timestamps = new Map<string, number>()

/** Call this every time the YOLO WebSocket fires for a lane. */
export function markYoloActive(laneId: string): void {
  _timestamps.set(laneId, Date.now())
}

/**
 * Returns true if the lane received a YOLO update within the last `withinMs`
 * milliseconds (default 8 000 ms — twice the polling interval).
 */
export function isYoloActive(laneId: string, withinMs = 8000): boolean {
  const ts = _timestamps.get(laneId)
  if (ts === undefined) return false
  return Date.now() - ts < withinMs
}

/** Clear the registry (e.g. when navigating away). */
export function clearYoloRegistry(): void {
  _timestamps.clear()
}
