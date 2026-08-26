import { StateCreator } from 'zustand'
import { EdgeDeviceTelemetry, CloudSyncStatus, SystemHealthPayload } from '@/types'
import { MOCK_SYSTEM_HEALTH } from '@/services/mock/mockData'

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
  edgeDevice: MOCK_SYSTEM_HEALTH.edgeDevice,
  cloudSync: MOCK_SYSTEM_HEALTH.cloudSync,
  overallHealth: MOCK_SYSTEM_HEALTH.overallHealth,
  activeAnomalies: MOCK_SYSTEM_HEALTH.activeAnomalies,
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
