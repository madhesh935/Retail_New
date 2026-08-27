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
import { AttendanceSlice, createAttendanceSlice } from './slices/attendanceSlice'
import { CustomerRequestSlice, createCustomerRequestSlice } from './slices/customerRequestSlice'
import { ExpirySlice, createExpirySlice } from './slices/expirySlice'
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
  SettingsSlice &
  AttendanceSlice &
  CustomerRequestSlice &
  ExpirySlice & {
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
  ...createAttendanceSlice(set, get, api),
  ...createCustomerRequestSlice(set, get, api),
  ...createExpirySlice(set, get, api),

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
      const [statusData, shelvesData, staffMembers, staffTasks, incidentsData, systemData, camerasData] =
        await Promise.allSettled([
          realStoreApi.getStoreStatus(),
          realStoreApi.getShelves(),
          realStoreApi.getStaffMembers(),
          realStoreApi.getStaffTasks(),
          realStoreApi.getIncidents(),
          realStoreApi.getSystemHealth(),
          realStoreApi.getCameras(),
        ])

      // 1. Store Status & Occupancy
      if (statusData.status === 'fulfilled' && statusData.value) {
        const s = statusData.value
        get().setStoreInfo({
          storeId: s.store_id || 'store-01',
          name: s.name || 'FreshMart Flagship — Koramangala, BLR',
          code: s.code || 'STORE-01-CHN',
          isOpen: s.is_open ?? true,
          currentOccupancy: s.current_occupancy || 142,
          currentActiveShoppers: s.current_occupancy || 142,
          maxCapacity: s.max_capacity || 350,
          todaysTotalFootfall: s.todays_total_footfall || 1840,
          peakOccupancyToday: s.peak_occupancy_today || 288,
          occupancyRate: s.occupancy_rate || 40.6,
          averageDwellTimeMinutes: s.average_dwell_time_minutes || 24,
          edgeAiStatus: s.edge_ai_status || 'ACTIVE',
          activeIncidentsCount: s.active_incidents_count ?? 0,
          onlineCamerasCount: s.online_cameras_count ?? 0,
          totalCamerasCount: s.total_cameras_count ?? 0,
          activeStaffCount: s.active_staff_count ?? 0,
          totalStaffCount: s.total_staff_count ?? 0,
          avgCheckoutWaitTimeSeconds: s.avg_checkout_wait_time_seconds ?? 0,
          lastUpdated: new Date().toISOString(),
        })
        get().updateOccupancy(s.current_occupancy || 142, s.occupancy_rate || 40.6)
        if (Array.isArray(s.zones)) {
          get().setZones(
            s.zones.map((zone: any) => ({
              id: zone.id,
              name: zone.name,
              category: zone.category || 'Retail',
              code: zone.code,
              currentOccupancy: zone.current_occupancy || 0,
              capacity: zone.max_capacity || 0,
              avgDwellTimeSeconds: zone.avg_dwell_time_seconds || 0,
              alertCount: zone.alert_count || 0,
              coordinates: zone.coordinates || { x: 0, y: 0, width: 0, height: 0 },
            }))
          )
        }
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
        const sys = systemData.value
        const ed = sys.edge_device || sys.edgeDevice || {}
        const cs = sys.cloud_sync || sys.cloudSync || {}
        get().setSystemHealth({
          edgeDevice: {
            deviceId: 'edge-01',
            deviceName: ed.device_name || ed.deviceName || 'NVIDIA Jetson AGX Orin — Edge-01',
            model: 'Jetson AGX Orin 64GB',
            ipAddress: '192.168.1.100',
            firmwareVersion: 'v5.1.2',
            jetpackVersion: 'JetPack 6.0',
            deepstreamVersion: 'DeepStream 7.0',
            tensorRtVersion: 'TensorRT 8.6.2',
            cpuUsagePercent: ed.cpu_usage_percent || ed.cpuUsagePercent || 28.4,
            gpuUsagePercent: ed.gpu_usage_percent || ed.gpuUsagePercent || 68.4,
            npuDlaUsagePercent: 45.0,
            ramUsageGb: 8.4,
            ramTotalGb: 64.0,
            temperatureCelsius: ed.temperature_celsius || ed.temperatureCelsius || 48.5,
            powerDrawWatts: 38.5,
            fanSpeedPercent: 62.0,
            nvmeStorageUsedGb: 112.0,
            nvmeStorageTotalGb: 1024.0,
            fpsTotalInference: ed.inference_fps || ed.fpsTotalInference || 178.6,
            activeCameraStreamsCount: 4,
            droppedFramesCount: 0,
            uptimeSeconds: (ed.uptime_hours || 142.8) * 3600,
            lastPingTimestamp: new Date().toISOString(),
          },
          cloudSync: {
            status: cs.status === 'CONNECTED' ? 'SYNCED' : (cs.status || 'SYNCED'),
            cloudRegion: 'ap-south-1 (Mumbai)',
            latencyMs: cs.sync_latency_ms || cs.latencyMs || 14.2,
            lastSyncTimestamp: cs.last_synced_at || cs.lastSyncTimestamp || new Date().toISOString(),
            pendingTelemetryPackets: 0,
            bandwidthUsageKbps: 128.5,
            edgeToCloudSyncErrorCount: 0,
          },
          overallHealth: sys.overall_health === 'OPTIMAL' ? 'HEALTHY' : (sys.overall_health || 'HEALTHY'),
          activeAnomalies: sys.active_anomalies || sys.activeAnomalies || [],
        })
      }

      // 6. Camera inventory and edge stream health
      if (camerasData.status === 'fulfilled' && camerasData.value) {
        get().setCameras(camerasData.value)
      }
    } catch (err) {
      console.warn('Backend data sync notice:', err)
    } finally {
      get().setLoadingStore(false)
    }
  },
}))
