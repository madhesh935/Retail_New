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
import {
  buildInventoryAnalytics,
  mapCamera,
  mapCustomerAssistTask,
  mapInventoryBatch,
  mapMarkdownCandidate,
  mapQueueLane,
  mapShelfToItem,
  mapStaffMember,
  mapStaffTask,
  mapWasteRecord,
} from '@/services/api/mappers'

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
    syncTaskStatus: (
      taskId: string,
      status: string,
      assignedStaffId?: string,
      blocker?: { reason?: string; note?: string; photo?: string }
    ) => Promise<void>
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
      const tasks = (await realStoreApi.getStaffTasks()).map(mapStaffTask)
      const members = (await realStoreApi.getStaffMembers()).map(mapStaffMember)
      get().setStaffPayload({
        totalStaffOnShift: members.filter((m) => m.status !== 'OFF_DUTY').length,
        availableStaffCount: members.filter((m) => m.status === 'ON_DUTY_AVAILABLE').length,
        busyStaffCount: members.filter((m) => m.status === 'ON_DUTY_BUSY').length,
        breakStaffCount: members.filter((m) => m.status === 'ON_BREAK').length,
        activeTasksCount: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        staffMembers: members,
        pendingTasks: tasks.filter((t) => t.status !== 'CANCELLED'),
        recommendedReallocations: [],
      })
    } catch (err) {
      console.warn('Could not persist task to backend:', err)
      get().addStaffTask(task)
    }
  },

  syncTaskStatus: async (
    taskId: string,
    status: string,
    assignedStaffId?: string,
    blocker?: { reason?: string; note?: string; photo?: string }
  ) => {
    try {
      await realStoreApi.updateTaskStatus(taskId, status, assignedStaffId, blocker)
    } catch (err) {
      console.warn('Could not sync task status to backend:', err)
    }

    if (status === 'IN_PROGRESS') {
      if (assignedStaffId) {
        const staff = get().staffMembers.find((m) => m.id === assignedStaffId)
        const staffName = staff?.name || get().authenticatedStaff?.name || 'Staff'
        get().acceptStaffTask(taskId, assignedStaffId, staffName)
        get().acceptCustomerRequest(taskId, assignedStaffId, staffName)
      }
      get().startStaffTask(taskId)
    } else if (status === 'ASSISTING') {
      get().startStaffTask(taskId)
      get().startAssistingCustomer(taskId)
    } else if (status === 'COMPLETED') {
      get().completeStaffTask(taskId)
      get().completeCustomerRequest(taskId)
    } else if (status === 'BLOCKED') {
      get().blockStaffTask(taskId, (blocker?.reason as any) || 'OTHER', blocker?.note, blocker?.photo)
    } else if (status === 'CANCELLED') {
      get().completeCustomerRequest(taskId, 'Cancelled')
      set((state) => ({
        pendingTasks: state.pendingTasks.map((t) =>
          t.id === taskId ? { ...t, status: 'CANCELLED' as const } : t
        ),
        customerRequests: state.customerRequests.map((r) =>
          r.id === taskId ? { ...r, status: 'CANCELLED' as const } : r
        ),
      }))
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
      const [
        statusData,
        shelvesData,
        staffMembers,
        staffTasks,
        incidentsData,
        systemData,
        camerasData,
        queueLanesData,
        batchesData,
        markdownData,
        wasteData,
      ] = await Promise.allSettled([
        realStoreApi.getStoreStatus(),
        realStoreApi.getShelves(),
        realStoreApi.getStaffMembers(),
        realStoreApi.getStaffTasks(),
        realStoreApi.getIncidents(),
        realStoreApi.getSystemHealth(),
        realStoreApi.getCameras(),
        realStoreApi.getQueueLanes(),
        realStoreApi.getInventoryBatches(),
        realStoreApi.getMarkdownCandidates(),
        realStoreApi.getWasteRecords(),
      ])

      // 1. Store Status & Occupancy
      if (statusData.status === 'fulfilled' && statusData.value) {
        const s = statusData.value
        get().setStoreInfo({
          storeId: s.store_id || 'store-01',
          name: s.name || 'FreshMart',
          code: s.code || 'STORE-01',
          isOpen: s.is_open ?? true,
          currentOccupancy: s.current_occupancy ?? 0,
          currentActiveShoppers: s.current_occupancy ?? 0,
          maxCapacity: s.max_capacity ?? 0,
          todaysTotalFootfall: s.todays_total_footfall ?? 0,
          peakOccupancyToday: s.peak_occupancy_today ?? 0,
          occupancyRate: s.occupancy_rate ?? 0,
          averageDwellTimeMinutes: s.average_dwell_time_minutes ?? 0,
          edgeAiStatus: s.edge_ai_status || 'ACTIVE',
          activeIncidentsCount: s.active_incidents_count ?? 0,
          onlineCamerasCount: s.online_cameras_count ?? 0,
          totalCamerasCount: s.total_cameras_count ?? 0,
          activeStaffCount: s.active_staff_count ?? 0,
          totalStaffCount: s.total_staff_count ?? 0,
          avgCheckoutWaitTimeSeconds: s.avg_checkout_wait_time_seconds ?? 0,
          lastUpdated: new Date().toISOString(),
        })
        get().updateOccupancy(s.current_occupancy ?? 0, s.occupancy_rate ?? 0)
        set({
          todaysTotalFootfall: s.todays_total_footfall ?? 0,
          peakOccupancyToday: s.peak_occupancy_today ?? 0,
          averageDwellTimeMinutes: s.average_dwell_time_minutes ?? 0,
        })
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
      if (shelvesData.status === 'fulfilled' && Array.isArray(shelvesData.value)) {
        const items = shelvesData.value.map(mapShelfToItem)
        get().setShelfItems(items)
        get().setInventoryAnalytics(buildInventoryAnalytics(items))
      }

      // 3. Staff Members & Tasks
      if (staffMembers.status === 'fulfilled' && Array.isArray(staffMembers.value)) {
        const members = staffMembers.value.map(mapStaffMember)
        const rawTasks = staffTasks.status === 'fulfilled' && Array.isArray(staffTasks.value) ? staffTasks.value : []
        const tasks = rawTasks.map(mapStaffTask)
        const assists = rawTasks.map(mapCustomerAssistTask).filter(Boolean) as any[]
        get().setStaffPayload({
          totalStaffOnShift: members.filter((m) => m.status !== 'OFF_DUTY').length,
          availableStaffCount: members.filter((m) => m.status === 'ON_DUTY_AVAILABLE').length,
          busyStaffCount: members.filter((m) => m.status === 'ON_DUTY_BUSY').length,
          breakStaffCount: members.filter((m) => m.status === 'ON_BREAK').length,
          activeTasksCount: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          staffMembers: members,
          pendingTasks: tasks.filter((t) => t.status !== 'CANCELLED'),
          recommendedReallocations: [],
        })
        if (typeof (get() as any).setCustomerRequests === 'function') {
          ;(get() as any).setCustomerRequests(assists)
        }
      }

      // 4. Incidents
      if (incidentsData.status === 'fulfilled' && Array.isArray(incidentsData.value) && incidentsData.value.length > 0) {
        const incs = incidentsData.value
        get().setIncidentsPayload({
          activeCount: incs.filter((i: any) => i.status === 'ACTIVE').length,
          criticalCount: incs.filter(
            (i: any) => i.status === 'ACTIVE' && String(i.severity).toUpperCase() === 'CRITICAL'
          ).length,
          highCount: incs.filter(
            (i: any) => i.status === 'ACTIVE' && String(i.severity).toUpperCase() === 'HIGH'
          ).length,
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
            deviceName: ed.device_name || ed.deviceName || 'Edge Node',
            model: ed.model || 'Retail Edge Runtime',
            ipAddress: ed.ip_address || ed.ipAddress || '127.0.0.1',
            firmwareVersion: ed.firmware_version || 'live',
            jetpackVersion: ed.jetpack_version || '',
            deepstreamVersion: ed.deepstream_version || '',
            tensorRtVersion: ed.tensor_rt_version || '',
            cpuUsagePercent: ed.cpu_usage_percent ?? ed.cpuUsagePercent ?? 0,
            gpuUsagePercent: ed.gpu_usage_percent ?? ed.gpuUsagePercent ?? 0,
            npuDlaUsagePercent: ed.npu_dla_usage_percent ?? 0,
            ramUsageGb: ed.ram_usage_gb ?? ((ed.memory_usage_percent || 0) / 100) * 16,
            ramTotalGb: ed.ram_total_gb ?? 16,
            temperatureCelsius: ed.temperature_celsius ?? ed.temperatureCelsius ?? 0,
            powerDrawWatts: ed.power_draw_watts ?? 0,
            fanSpeedPercent: ed.fan_speed_percent ?? 0,
            nvmeStorageUsedGb: ed.nvme_storage_used_gb ?? 0,
            nvmeStorageTotalGb: ed.nvme_storage_total_gb ?? 0,
            fpsTotalInference: ed.inference_fps ?? ed.fpsTotalInference ?? 0,
            activeCameraStreamsCount: ed.active_camera_streams_count ?? get().cameras.length,
            droppedFramesCount: ed.dropped_frames_count ?? 0,
            uptimeSeconds: (ed.uptime_hours ?? 0) * 3600,
            lastPingTimestamp: new Date().toISOString(),
          },
          cloudSync: {
            status: cs.status === 'CONNECTED' || cs.status === 'SYNCED' ? 'SYNCED' : (cs.status || 'SYNCED'),
            cloudRegion: cs.cloud_region || cs.cloudRegion || 'local',
            latencyMs: cs.sync_latency_ms ?? cs.latencyMs ?? 0,
            lastSyncTimestamp: cs.last_synced_at || cs.lastSyncTimestamp || new Date().toISOString(),
            pendingTelemetryPackets: cs.pending_telemetry_packets ?? 0,
            bandwidthUsageKbps: cs.bandwidth_usage_kbps ?? 0,
            edgeToCloudSyncErrorCount: cs.edge_to_cloud_sync_error_count ?? 0,
          },
          overallHealth: sys.overall_health === 'OPTIMAL' || sys.overall_health === 'HEALTHY' ? 'HEALTHY' : (sys.overall_health || 'HEALTHY'),
          activeAnomalies: sys.active_anomalies || sys.activeAnomalies || [],
        })
      }

      // 6. Cameras
      if (camerasData.status === 'fulfilled' && Array.isArray(camerasData.value)) {
        get().setCameras(camerasData.value.map(mapCamera))
      }

      // 7. Checkout queues (DB-seeded lanes)
      if (queueLanesData.status === 'fulfilled' && Array.isArray(queueLanesData.value)) {
        const lanes = queueLanesData.value.map(mapQueueLane)
        const active = lanes.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY')
        const avgWait =
          active.length > 0
            ? Math.round(active.reduce((acc, l) => acc + l.currentWaitTimeSeconds, 0) / active.length)
            : 0
        get().setQueuesPayload({
          storeId: get().activeStoreId || 'store-01',
          totalLanes: lanes.length,
          activeLanesCount: active.length,
          congestedLanesCount: lanes.filter((l) => l.status === 'CONGESTED').length,
          closedLanesCount: lanes.filter((l) => l.status === 'CLOSED').length,
          systemAverageWaitTimeSeconds: avgWait,
          systemTargetWaitTimeSeconds: 120,
          estimatedShopperAbandonmentRisk:
            avgWait > 240 ? 'CRITICAL' : avgWait > 180 ? 'HIGH' : avgWait > 120 ? 'MEDIUM' : 'LOW',
          lanes,
          predictedWaitTimeCurve: lanes.map((l) => ({
            time: `Lane ${l.laneNumber}`,
            regularAvgSec: l.currentWaitTimeSeconds,
            expressAvgSec: Math.round(l.currentWaitTimeSeconds * 0.7),
          })),
        })

        get().setPredictions({
          storeId: get().activeStoreId || 'store-01',
          generatedAt: new Date().toISOString(),
          modelName: 'queue-lanes-derived',
          footfallForecast: [],
          queueCongestionForecast: lanes.map((l) => ({
            targetTime: `+10m lane ${l.laneNumber}`,
            predictedQueueCount: l.predictedQueueIn10Min,
            predictedWaitTimeSeconds: l.predictedWaitTimeIn10MinSeconds,
            recommendedOpenLanes: Math.max(1, Math.ceil(l.predictedQueueIn10Min / 4)),
            confidence: 0.8,
          })),
          stockoutForecast: get()
            .inventoryAnalytics.topVulnerableSkus.slice(0, 5)
            .map((sku) => ({
              sku: sku.sku,
              productName: sku.productName,
              zoneName: '',
              predictedDepletionTime: new Date(Date.now() + sku.minutesUntilStockout * 60000).toISOString(),
              timeRemainingMinutes: sku.minutesUntilStockout,
              recommendedRestockUnits: Math.max(4, sku.currentStock === 0 ? 12 : 8),
              urgency: (sku.minutesUntilStockout < 30 ? 'HIGH' : sku.minutesUntilStockout < 90 ? 'MEDIUM' : 'LOW') as
                | 'HIGH'
                | 'MEDIUM'
                | 'LOW',
            })),
          staffingDemandForecast: [],
        })
      }

      // 8. Expiry / waste batches from DB
      if (batchesData.status === 'fulfilled' && Array.isArray(batchesData.value)) {
        const batches = batchesData.value.map(mapInventoryBatch)
        const markdown =
          markdownData.status === 'fulfilled' && Array.isArray(markdownData.value)
            ? markdownData.value.map(mapMarkdownCandidate)
            : undefined
        const waste =
          wasteData.status === 'fulfilled' && Array.isArray(wasteData.value)
            ? wasteData.value.map(mapWasteRecord)
            : undefined
        get().hydrateExpiryFromApi(batches, markdown, waste)
      }
    } catch (err) {
      console.warn('Backend data sync notice:', err)
      get().setStoreError(err instanceof Error ? err.message : 'Failed to sync store data')
    } finally {
      get().setLoadingStore(false)
    }
  },
}))
