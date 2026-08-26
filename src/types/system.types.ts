export interface EdgeDeviceTelemetry {
  deviceId: string
  deviceName: string
  model: string // e.g. "NVIDIA Jetson Orin NX (16GB)"
  ipAddress: string
  firmwareVersion: string
  jetpackVersion: string
  deepstreamVersion: string
  tensorRtVersion: string
  cpuUsagePercent: number
  gpuUsagePercent: number
  npuDlaUsagePercent: number
  ramUsageGb: number
  ramTotalGb: number
  temperatureCelsius: number
  powerDrawWatts: number
  fanSpeedPercent: number
  nvmeStorageUsedGb: number
  nvmeStorageTotalGb: number
  fpsTotalInference: number
  activeCameraStreamsCount: number
  droppedFramesCount: number
  uptimeSeconds: number
  lastPingTimestamp: string
}

export interface CloudSyncStatus {
  status: 'SYNCED' | 'SYNCING' | 'DEGRADED' | 'OFFLINE'
  cloudRegion: string
  latencyMs: number
  lastSyncTimestamp: string
  pendingTelemetryPackets: number
  bandwidthUsageKbps: number
  edgeToCloudSyncErrorCount: number
}

export interface SystemHealthPayload {
  overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  edgeDevice: EdgeDeviceTelemetry
  cloudSync: CloudSyncStatus
  activeAnomalies: {
    id: string
    component: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    detectedAt: string
  }[]
}
