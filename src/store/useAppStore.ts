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
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice'
import { WebSocketMessage } from '@/types'
import { realStoreApi } from '@/services/api/realStoreApi'

export type AppState = StoreSlice &
  CameraSlice &
  InventorySlice &
  ShopperSlice &
  QueueSlice &
  StaffSlice &
  IncidentSlice &
  SystemSlice &
  PredictionSlice &
  UiSlice &
  SettingsSlice & {
    handleWebSocketMessage: (msg: WebSocketMessage) => void
    fetchStoreData: (storeId?: string) => Promise<void>
    dispatchRealTask: (task: any) => Promise<void>
    resolveRealIncident: (id: string) => Promise<void>
    executeRealAction: (id: string) => Promise<void>
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
  ...createSettingsSlice(set, get, api),

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

      case 'INCIDENT_DETECTED': {
        const inc = payload as any
        get().addIncident(inc)
        get().addNotification({
          title: `Alert: ${inc.title}`,
          message: inc.description || inc.title,
          group: inc.severity === 'critical' || inc.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
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

  dispatchRealTask: async (task: any) => {
    try {
      await realStoreApi.createStaffTask(task)
      const tasks = await realStoreApi.getStaffTasks()
      const members = await realStoreApi.getStaffMembers()
      get().setStaffPayload({
        totalStaffOnShift: members.length,
        availableStaffCount: members.filter((m: any) => m.status === 'AVAILABLE').length,
        busyStaffCount: members.filter((m: any) => m.status === 'BUSY').length,
        breakStaffCount: members.filter((m: any) => m.status === 'ON_BREAK').length,
        activeTasksCount: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
        staffMembers: members,
        pendingTasks: tasks,
        recommendedReallocations: [],
      })
    } catch (err) {
      console.warn('Could not persist task to backend:', err)
      get().addStaffTask(task)
    }
  },

  resolveRealIncident: async (id: string) => {
    try {
      await realStoreApi.resolveIncident(id)
    } catch (e) {
      console.warn(e)
    }
    get().resolveIncident(id)
  },

  executeRealAction: async (id: string) => {
    try {
      await realStoreApi.executeIncidentAction(id)
    } catch (e) {
      console.warn(e)
    }
    get().executeRecommendation(id)
  },

  fetchStoreData: async () => {
    get().setLoadingStore(true)

    try {
      const [statusData, shelvesData, staffMembers, staffTasks, incidentsData, systemData] =
        await Promise.allSettled([
          realStoreApi.getStoreStatus(),
          realStoreApi.getShelves(),
          realStoreApi.getStaffMembers(),
          realStoreApi.getStaffTasks(),
          realStoreApi.getIncidents(),
          realStoreApi.getSystemHealth(),
        ])

      // 1. Store Status & Occupancy
      if (statusData.status === 'fulfilled' && statusData.value) {
        const s = statusData.value
        get().setStoreInfo({
          storeId: s.store_id || 'store-blr-01',
          name: s.name || 'FreshMart Flagship — Koramangala, BLR',
          code: 'STORE-01-BLR',
          isOpen: true,
          currentOccupancy: s.current_occupancy || 142,
          currentActiveShoppers: s.current_occupancy || 142,
          maxCapacity: s.max_capacity || 350,
          todaysTotalFootfall: s.todays_total_footfall || 1840,
          peakOccupancyToday: s.peak_occupancy_today || 288,
          occupancyRate: s.occupancy_rate || 40.6,
          averageDwellTimeMinutes: s.average_dwell_time_minutes || 24,
          edgeAiStatus: 'ACTIVE',
          activeIncidentsCount: 2,
          onlineCamerasCount: 4,
          totalCamerasCount: 4,
          activeStaffCount: 5,
          totalStaffCount: 5,
          avgCheckoutWaitTimeSeconds: 84,
          lastUpdated: new Date().toISOString(),
        })
        get().updateOccupancy(s.current_occupancy || 142, s.occupancy_rate || 40.6)
      }

      // 2. Shelves & Inventory
      if (shelvesData.status === 'fulfilled' && shelvesData.value) {
        const items = shelvesData.value
        get().setShelfItems(items)
      }

      // 3. Staff Members & Tasks
      if (staffMembers.status === 'fulfilled' && staffMembers.value) {
        const members = staffMembers.value
        const tasks = staffTasks.status === 'fulfilled' ? staffTasks.value : []
        get().setStaffPayload({
          totalStaffOnShift: members.length,
          availableStaffCount: members.filter((m: any) => m.status === 'AVAILABLE').length,
          busyStaffCount: members.filter((m: any) => m.status === 'BUSY').length,
          breakStaffCount: members.filter((m: any) => m.status === 'ON_BREAK').length,
          activeTasksCount: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
          staffMembers: members,
          pendingTasks: tasks,
          recommendedReallocations: [],
        })
      }

      // 4. Incidents
      if (incidentsData.status === 'fulfilled' && incidentsData.value) {
        const incs = incidentsData.value
        get().setIncidentsPayload({
          activeCount: incs.filter((i: any) => i.status === 'ACTIVE').length,
          criticalCount: incs.filter((i: any) => i.status === 'ACTIVE' && (i.severity === 'CRITICAL' || i.severity === 'critical')).length,
          highCount: incs.filter((i: any) => i.status === 'ACTIVE' && (i.severity === 'HIGH' || i.severity === 'high')).length,
          avgResolutionMinutes: 4.2,
          incidentsTodayTotal: incs.length,
          incidents: incs,
          recentAiRecommendations: incs.map((i: any) => i.aiRecommendation).filter(Boolean),
        })
      }

      // 5. System Health
      if (systemData.status === 'fulfilled' && systemData.value) {
        get().setSystemHealth(systemData.value)
      }
    } catch (err) {
      console.warn('Backend data sync notice:', err)
    } finally {
      get().setLoadingStore(false)
    }
  },
}))

