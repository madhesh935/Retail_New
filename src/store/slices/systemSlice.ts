import { StateCreator } from 'zustand'
import { EdgeDeviceTelemetry, CloudSyncStatus, SystemHealthPayload } from '@/types'

const EMPTY_EDGE: EdgeDeviceTelemetry = {
  deviceId: '',
  deviceName: '',
  model: '',
  ipAddress: '',
  firmwareVersion: '',
  jetpackVersion: '',
  deepstreamVersion: '',
  tensorRtVersion: '',
  cpuUsagePercent: 0,
  gpuUsagePercent: 0,
  npuDlaUsagePercent: 0,
  ramUsageGb: 0,
  ramTotalGb: 0,
  temperatureCelsius: 0,
  powerDrawWatts: 0,
  fanSpeedPercent: 0,
  nvmeStorageUsedGb: 0,
  nvmeStorageTotalGb: 0,
  fpsTotalInference: 0,
  activeCameraStreamsCount: 0,
  droppedFramesCount: 0,
  uptimeSeconds: 0,
  lastPingTimestamp: '',
}

const EMPTY_CLOUD: CloudSyncStatus = {
  status: 'OFFLINE',
  cloudRegion: '',
  latencyMs: 0,
  lastSyncTimestamp: '',
  pendingTelemetryPackets: 0,
  bandwidthUsageKbps: 0,
  edgeToCloudSyncErrorCount: 0,
}

export interface SystemSlice {
  edgeDevice: EdgeDeviceTelemetry
  cloudSync: CloudSyncStatus
  overallHealth: SystemHealthPayload['overallHealth']
  activeAnomalies: SystemHealthPayload['activeAnomalies']
  isLoadingSystem: boolean

  setSystemHealth: (payload: SystemHealthPayload) => void
  updateEdgeTelemetry: (telemetry: EdgeDeviceTelemetry) => void
  updateCloudSync: (sync: CloudSyncStatus) => void
  setLoadingSystem: (loading: boolean) => void
}

export const createSystemSlice: StateCreator<SystemSlice, [], [], SystemSlice> = (set) => ({
  edgeDevice: EMPTY_EDGE,
  cloudSync: EMPTY_CLOUD,
  overallHealth: 'HEALTHY',
  activeAnomalies: [],
  isLoadingSystem: false,

  setSystemHealth: (payload) =>
    set({
      edgeDevice: payload.edgeDevice,
      cloudSync: payload.cloudSync,
      overallHealth: payload.overallHealth,
      activeAnomalies: payload.activeAnomalies,
    }),
  updateEdgeTelemetry: (edgeDevice) =>
    set({
      edgeDevice,
      overallHealth: edgeDevice.temperatureCelsius > 75 || edgeDevice.gpuUsagePercent > 95 ? 'WARNING' : 'HEALTHY',
    }),
  updateCloudSync: (cloudSync) => set({ cloudSync }),
  setLoadingSystem: (isLoadingSystem) => set({ isLoadingSystem }),
})
