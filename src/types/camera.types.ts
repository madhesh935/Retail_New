export interface CameraFeed {
  id: string
  name: string
  code: string
  zoneId: string
  zoneName: string
  rtspUrl: string
  snapshotUrl?: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'CONNECTING'
  resolution: string
  fps: number
  targetFps: number
  inferenceLatencyMs: number
  modelLoaded: string
  aiTasks: ('SHOPPER_TRACKING' | 'SHELF_MONITORING' | 'QUEUE_DETECTION' | 'INCIDENT_DETECTION' | 'STAFF_TRACKING')[]
  uptimePercent: number
  activeDetectionsCount: number
  lensFov: string
  ipAddress: string
  macAddress: string
  lastHeartbeat: string
}

export interface CameraAnalyticsSummary {
  totalCameras: number
  onlineCameras: number
  degradedCameras: number
  offlineCameras: number
  averageInferenceLatencyMs: number
  averageFps: number
  totalDetectionsLastMinute: number
}
