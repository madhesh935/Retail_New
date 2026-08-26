import { create } from 'zustand'
import { StoreSlice, createStoreSlice } from './slices/storeSlice'
import { CameraSlice, createCameraSlice } from './slices/cameraSlice'
import { InventorySlice, createInventorySlice } from './slices/inventorySlice'
import { ShopperSlice, createShopperSlice } from './slices/shopperSlice'
import { QueueSlice, createQueueSlice } from './slices/queueSlice'
import { StaffSlice, createStaffSlice } from './slices/staffSlice'
import { IncidentSlice, createIncidentSlice } from './slices/incidentSlice'
import { SystemSlice, createSystemSlice } from './slices/systemSlice'
import { PredictionSlice, createPredictionSlice } from './slices/predictionSlice'
import { UiSlice, createUiSlice } from './slices/uiSlice'
import { WebSocketMessage } from '@/types'
import { mockDemoAdapter } from '@/services/mock/mockAdapter'
import { storeService } from '@/services/api/store.service'
import { camerasService } from '@/services/api/cameras.service'
import { inventoryService } from '@/services/api/inventory.service'
import { shoppersService } from '@/services/api/shoppers.service'
import { queuesService } from '@/services/api/queues.service'
import { staffService } from '@/services/api/staff.service'
import { incidentsService } from '@/services/api/incidents.service'
import { systemService } from '@/services/api/system.service'
import { predictionsService } from '@/services/api/predictions.service'

export type AppState = StoreSlice &
  CameraSlice &
  InventorySlice &
  ShopperSlice &
  QueueSlice &
  StaffSlice &
  IncidentSlice &
  SystemSlice &
  PredictionSlice &
  UiSlice & {
    handleWebSocketMessage: (msg: WebSocketMessage) => void
    fetchStoreData: (storeId?: string) => Promise<void>
  }

export const useAppStore = create<AppState>()((set, get, api) => ({
  ...createStoreSlice(set, get, api),
  ...createCameraSlice(set, get, api),
  ...createInventorySlice(set, get, api),
  ...createShopperSlice(set, get, api),
  ...createQueueSlice(set, get, api),
  ...createStaffSlice(set, get, api),
  ...createIncidentSlice(set, get, api),
  ...createSystemSlice(set, get, api),
  ...createPredictionSlice(set, get, api),
  ...createUiSlice(set, get, api),

  handleWebSocketMessage: (msg: WebSocketMessage) => {
    const { event, payload, timestamp } = msg
    get().setLastTelemetryTimestamp(timestamp || new Date().toISOString())

    switch (event) {
      case 'OCCUPANCY_CHANGED': {
        const data = payload as { currentOccupancy: number; occupancyRate: number; entryDelta?: number; exitDelta?: number }
        get().updateOccupancy(data.currentOccupancy, data.occupancyRate, data.entryDelta)
        if (get().storeInfo) {
          get().setStoreInfo({
            ...get().storeInfo!,
            currentOccupancy: data.currentOccupancy,
            occupancyRate: data.occupancyRate,
            todaysTotalFootfall: get().todaysTotalFootfall,
          })
        }
        break
      }

      case 'EDGE_HEALTH_TELEMETRY': {
        get().updateEdgeTelemetry(payload as any)
        break
      }

      case 'QUEUE_METRICS_UPDATE': {
        const data = payload as { lanes: any[]; avgWaitSeconds: number }
        get().setQueuesPayload({
          storeId: get().activeStoreId,
          totalLanes: data.lanes.length,
          activeLanesCount: data.lanes.filter((l) => l.status === 'ACTIVE' || l.status === 'CONGESTED').length,
          congestedLanesCount: data.lanes.filter((l) => l.status === 'CONGESTED').length,
          closedLanesCount: data.lanes.filter((l) => l.status === 'CLOSED').length,
          systemAverageWaitTimeSeconds: data.avgWaitSeconds,
          systemTargetWaitTimeSeconds: 90,
          estimatedShopperAbandonmentRisk: data.avgWaitSeconds > 180 ? 'HIGH' : data.avgWaitSeconds > 120 ? 'MEDIUM' : 'LOW',
          lanes: data.lanes,
          predictedWaitTimeCurve: get().predictedWaitTimeCurve,
        })
        break
      }

      case 'INCIDENT_DETECTED': {
        const inc = payload as any
        get().addIncident(inc)
        get().addNotification({
          title: `Alert: ${inc.title}`,
          message: inc.description,
          group: inc.severity === 'critical' ? 'CRITICAL' : 'WARNING',
          severity: inc.severity,
          actionUrl: '/incidents-actions',
          entityId: inc.id,
          entityType: 'incident',
        })
        break
      }

      case 'INCIDENT_RESOLVED': {
        const inc = payload as any
        get().resolveIncident(inc.id)
        break
      }

      case 'STORE_STATUS_UPDATE': {
        get().setStoreInfo(payload as any)
        break
      }

      default:
        break
    }
  },

  fetchStoreData: async (storeId?: string) => {
    const targetStoreId = storeId || get().activeStoreId
    const isDemo = get().isDemoMode

    get().setLoadingStore(true)

    try {
      if (isDemo) {
        // Load through mock demo adapter
        const [statusRes, stateRes, camerasRes, invRes, shelvesRes, shoppersRes, queuesRes, staffRes, incRes, sysRes, predRes] =
          await Promise.all([
            mockDemoAdapter.getStatus(targetStoreId),
            mockDemoAdapter.getState(targetStoreId),
            mockDemoAdapter.getCameras(targetStoreId),
            mockDemoAdapter.getInventory(targetStoreId),
            mockDemoAdapter.getShelfItems(targetStoreId),
            mockDemoAdapter.getShopperAnalytics(targetStoreId),
            mockDemoAdapter.getQueues(targetStoreId),
            mockDemoAdapter.getStaff(targetStoreId),
            mockDemoAdapter.getIncidents(targetStoreId),
            mockDemoAdapter.getSystemHealth(targetStoreId),
            mockDemoAdapter.getPredictions(targetStoreId),
          ])

        if (statusRes.data) get().setStoreInfo(statusRes.data)
        if (stateRes.data) get().setStoreState(stateRes.data)
        if (camerasRes.data) get().setCameras(camerasRes.data)
        if (invRes.data) get().setInventoryAnalytics(invRes.data)
        if (shelvesRes.data) get().setShelfItems(shelvesRes.data)
        if (shoppersRes.data) {
          get().setActiveShoppers(shoppersRes.data.activeShoppers)
          get().setZoneMetrics(shoppersRes.data.zoneMetrics)
          get().setDwellDistribution(shoppersRes.data.dwellTimeDistribution)
        }
        if (queuesRes.data) get().setQueuesPayload(queuesRes.data)
        if (staffRes.data) get().setStaffPayload(staffRes.data)
        if (incRes.data) get().setIncidentsPayload(incRes.data)
        if (sysRes.data) get().setSystemHealth(sysRes.data)
        if (predRes.data) get().setPredictions(predRes.data)
      } else {
        // Load through real API endpoints
        const [statusRes, stateRes, camerasRes, invRes, shelvesRes, shoppersRes, queuesRes, staffRes, incRes, sysRes, predRes] =
          await Promise.allSettled([
            storeService.getStatus(targetStoreId),
            storeService.getState(targetStoreId),
            camerasService.getCameras(targetStoreId),
            inventoryService.getInventory(targetStoreId),
            inventoryService.getShelfItems(targetStoreId),
            shoppersService.getAnalytics(targetStoreId),
            queuesService.getQueues(targetStoreId),
            staffService.getStaff(targetStoreId),
            incidentsService.getIncidents(targetStoreId),
            systemService.getHealth(targetStoreId),
            predictionsService.getPredictions(targetStoreId),
          ])

        if (statusRes.status === 'fulfilled' && statusRes.value.data) get().setStoreInfo(statusRes.value.data)
        if (stateRes.status === 'fulfilled' && stateRes.value.data) get().setStoreState(stateRes.value.data)
        if (camerasRes.status === 'fulfilled' && camerasRes.value.data) get().setCameras(camerasRes.value.data)
        if (invRes.status === 'fulfilled' && invRes.value.data) get().setInventoryAnalytics(invRes.value.data)
        if (shelvesRes.status === 'fulfilled' && shelvesRes.value.data) get().setShelfItems(shelvesRes.value.data)
        if (shoppersRes.status === 'fulfilled' && shoppersRes.value.data) {
          get().setActiveShoppers(shoppersRes.value.data.activeShoppers)
          get().setZoneMetrics(shoppersRes.value.data.zoneMetrics)
          get().setDwellDistribution(shoppersRes.value.data.dwellTimeDistribution)
        }
        if (queuesRes.status === 'fulfilled' && queuesRes.value.data) get().setQueuesPayload(queuesRes.value.data)
        if (staffRes.status === 'fulfilled' && staffRes.value.data) get().setStaffPayload(staffRes.value.data)
        if (incRes.status === 'fulfilled' && incRes.value.data) get().setIncidentsPayload(incRes.value.data)
        if (sysRes.status === 'fulfilled' && sysRes.value.data) get().setSystemHealth(sysRes.value.data)
        if (predRes.status === 'fulfilled' && predRes.value.data) get().setPredictions(predRes.value.data)
      }
    } catch (err) {
      get().setStoreError(err instanceof Error ? err.message : 'Error syncing retail state')
    } finally {
      get().setLoadingStore(false)
    }
  },
}))
