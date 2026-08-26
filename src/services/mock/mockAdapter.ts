import {
  StoreStatus,
  StoreState,
  CameraFeed,
  InventoryAnalytics,
  ShelfSection,
  ShelfItem,
  ShopperAnalyticsPayload,
  QueueAnalyticsPayload,
  StaffOperationsPayload,
  IncidentsAnalyticsPayload,
  SystemHealthPayload,
  PredictionsPayload,
  ApiResponse,
  WebSocketMessage,
} from '@/types'
import {
  MOCK_STORE_STATUS,
  MOCK_STORE_STATE,
  MOCK_CAMERAS,
  MOCK_SHELF_ITEMS,
  MOCK_INVENTORY_ANALYTICS,
  MOCK_QUEUES,
  MOCK_STAFF,
  MOCK_INCIDENTS,
  MOCK_SYSTEM_HEALTH,
  MOCK_PREDICTIONS,
} from './mockData'

type MockTelemetryListener = (message: WebSocketMessage) => void

export class MockDemoAdapter {
  private listeners: Set<MockTelemetryListener> = new Set()
  private simulationInterval: number | null = null
  private currentStatus: StoreStatus = { ...MOCK_STORE_STATUS }
  private currentQueues: QueueAnalyticsPayload = JSON.parse(JSON.stringify(MOCK_QUEUES))
  private currentSystemHealth: SystemHealthPayload = JSON.parse(JSON.stringify(MOCK_SYSTEM_HEALTH))
  private currentIncidents: IncidentsAnalyticsPayload = JSON.parse(JSON.stringify(MOCK_INCIDENTS))

  constructor() {}

  public startSimulation(intervalMs = 3000) {
    this.stopSimulation()
    this.simulationInterval = window.setInterval(() => {
      this.tick()
    }, intervalMs)
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }

  public onTelemetry(listener: MockTelemetryListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private broadcast(event: WebSocketMessage) {
    this.listeners.forEach((fn) => fn(event))
  }

  private tick() {
    // 1. Simulate slight random occupancy drift (-3 to +4)
    const delta = Math.floor(Math.random() * 8) - 3
    const newOccupancy = Math.max(80, Math.min(320, this.currentStatus.currentOccupancy + delta))
    const entryDelta = delta > 0 ? delta : Math.floor(Math.random() * 2)
    const exitDelta = delta < 0 ? Math.abs(delta) : Math.floor(Math.random() * 2)

    this.currentStatus = {
      ...this.currentStatus,
      currentOccupancy: newOccupancy,
      currentActiveShoppers: newOccupancy,
      todaysTotalFootfall: this.currentStatus.todaysTotalFootfall + entryDelta,
      occupancyRate: parseFloat(((newOccupancy / this.currentStatus.maxCapacity) * 100).toFixed(1)),
      lastUpdated: new Date().toISOString(),
    }

    this.broadcast({
      event: 'OCCUPANCY_CHANGED',
      storeId: this.currentStatus.storeId,
      timestamp: new Date().toISOString(),
      payload: {
        currentOccupancy: newOccupancy,
        occupancyRate: this.currentStatus.occupancyRate,
        entryDelta,
        exitDelta,
      },
    })

    // 2. Simulate Jetson Edge hardware telemetry jitter
    const gpuJitter = Math.min(98, Math.max(35, this.currentSystemHealth.edgeDevice.gpuUsagePercent + (Math.random() * 6 - 3)))
    const cpuJitter = Math.min(90, Math.max(20, this.currentSystemHealth.edgeDevice.cpuUsagePercent + (Math.random() * 4 - 2)))
    const tempJitter = Math.min(68, Math.max(42, 49.5 + (Math.random() * 3 - 1.5)))
    const fpsJitter = Math.min(180, Math.max(174, 178.6 + (Math.random() * 2 - 1)))

    this.currentSystemHealth.edgeDevice = {
      ...this.currentSystemHealth.edgeDevice,
      gpuUsagePercent: parseFloat(gpuJitter.toFixed(1)),
      cpuUsagePercent: parseFloat(cpuJitter.toFixed(1)),
      temperatureCelsius: parseFloat(tempJitter.toFixed(1)),
      fpsTotalInference: parseFloat(fpsJitter.toFixed(1)),
      lastPingTimestamp: new Date().toISOString(),
    }

    this.broadcast({
      event: 'EDGE_HEALTH_TELEMETRY',
      storeId: this.currentStatus.storeId,
      timestamp: new Date().toISOString(),
      payload: this.currentSystemHealth.edgeDevice,
    })

    // 3. Queue state subtle fluctuation
    if (Math.random() > 0.6) {
      const laneIndex = Math.floor(Math.random() * 4)
      const lane = this.currentQueues.lanes[laneIndex]
      if (lane && lane.status !== 'CLOSED') {
        const queueDelta = Math.floor(Math.random() * 3) - 1
        lane.currentQueueLength = Math.max(1, Math.min(12, lane.currentQueueLength + queueDelta))
        lane.currentWaitTimeSeconds = Math.round(lane.currentQueueLength * 28 + Math.random() * 15)
        lane.status = lane.currentQueueLength > 5 ? 'CONGESTED' : 'ACTIVE'

        this.broadcast({
          event: 'QUEUE_METRICS_UPDATE',
          storeId: this.currentStatus.storeId,
          timestamp: new Date().toISOString(),
          payload: {
            lanes: this.currentQueues.lanes,
            avgWaitSeconds: Math.round(
              this.currentQueues.lanes
                .filter((l) => l.status !== 'CLOSED')
                .reduce((acc, curr) => acc + curr.currentWaitTimeSeconds, 0) / 4
            ),
          },
        })
      }
    }
  }

  // Mock API methods
  async getStatus(storeId = 'store-01'): Promise<ApiResponse<StoreStatus>> {
    return {
      success: true,
      data: { ...this.currentStatus, storeId },
      timestamp: new Date().toISOString(),
      meta: { storeId, edgeDeviceId: 'jetson-orin-nx-01', latencyMs: 2, isSimulated: true },
    }
  }

  async getState(storeId = 'store-01'): Promise<ApiResponse<StoreState>> {
    return {
      success: true,
      data: { ...MOCK_STORE_STATE, storeId },
      timestamp: new Date().toISOString(),
      meta: { storeId, edgeDeviceId: 'jetson-orin-nx-01', latencyMs: 3, isSimulated: true },
    }
  }

  async getCameras(storeId = 'store-01'): Promise<ApiResponse<CameraFeed[]>> {
    return {
      success: true,
      data: MOCK_CAMERAS,
      timestamp: new Date().toISOString(),
      meta: { storeId, edgeDeviceId: 'jetson-orin-nx-01', latencyMs: 2, isSimulated: true },
    }
  }

  async getInventory(storeId = 'store-01'): Promise<ApiResponse<InventoryAnalytics>> {
    return {
      success: true,
      data: MOCK_INVENTORY_ANALYTICS,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getShelfItems(storeId = 'store-01'): Promise<ApiResponse<ShelfItem[]>> {
    return {
      success: true,
      data: MOCK_SHELF_ITEMS,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getShelves(storeId = 'store-01'): Promise<ApiResponse<ShelfSection[]>> {
    const mockSections: ShelfSection[] = [
      {
        id: 'sec-01',
        name: 'Produce Bay 1 - Apples & Citrus (Shelf A1)',
        zoneId: 'zone-2',
        aisleNumber: 1,
        tierCount: 4,
        overallComplianceScore: 84.5,
        outOfStockItemsCount: 0,
        lowStockItemsCount: 1,
        lastScannedTime: 'Just now',
        items: [MOCK_SHELF_ITEMS[0]],
      },
      {
        id: 'sec-02',
        name: 'Dairy Cooler Wall - Milk & Yogurts (Shelf C2)',
        zoneId: 'zone-3',
        aisleNumber: 2,
        tierCount: 5,
        overallComplianceScore: 72.0,
        outOfStockItemsCount: 1,
        lowStockItemsCount: 0,
        lastScannedTime: '2 mins ago',
        items: [MOCK_SHELF_ITEMS[1]],
      },
      {
        id: 'sec-03',
        name: 'Beverage Gondola B4 (Shelf B4)',
        zoneId: 'zone-4',
        aisleNumber: 4,
        tierCount: 4,
        overallComplianceScore: 84.0,
        outOfStockItemsCount: 0,
        lowStockItemsCount: 1,
        lastScannedTime: '1 min ago',
        items: [MOCK_SHELF_ITEMS[2]],
      },
    ]
    return {
      success: true,
      data: mockSections,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 3, isSimulated: true },
    }
  }

  async getShopperAnalytics(storeId = 'store-01'): Promise<ApiResponse<ShopperAnalyticsPayload>> {
    const payload: ShopperAnalyticsPayload = {
      storeId,
      currentOccupancy: this.currentStatus.currentOccupancy,
      totalDailyFootfall: this.currentStatus.todaysTotalFootfall,
      entranceCountToday: 1840,
      exitCountToday: 1698,
      averageDwellMinutes: 24.5,
      peakHourToday: '18:00 - 19:00',
      activeShoppers: [
        { trackingId: 'T-1082', zoneId: 'zone-2', zoneName: 'Produce', entryTime: '17:42', dwellTimeSeconds: 380, currentCoordinates: { x: 22, y: 55 }, velocity: 0.8, shoppingState: 'ENGAGED', basketInteractionCount: 3 },
        { trackingId: 'T-1085', zoneId: 'zone-4', zoneName: 'Beverages', entryTime: '17:48', dwellTimeSeconds: 210, currentCoordinates: { x: 108, y: 64 }, velocity: 1.1, shoppingState: 'BROWSING', basketInteractionCount: 1 },
        { trackingId: 'T-1090', zoneId: 'zone-7', zoneName: 'Checkout', entryTime: '17:35', dwellTimeSeconds: 740, currentCoordinates: { x: 102, y: 96 }, velocity: 0.1, shoppingState: 'QUEUED', basketInteractionCount: 6 },
      ],
      zoneMetrics: [
        { zoneId: 'zone-2', zoneName: 'Produce & Fruits', visitorCount: 480, avgDwellSeconds: 420, engagementRatePercent: 78.4, trafficDensity: 'HIGH', bounceRatePercent: 12.0 },
        { zoneId: 'zone-3', zoneName: 'Dairy & Bakery', visitorCount: 410, avgDwellSeconds: 310, engagementRatePercent: 82.1, trafficDensity: 'MODERATE', bounceRatePercent: 8.5 },
        { zoneId: 'zone-4', zoneName: 'Beverages & Snacks (B4)', visitorCount: 520, avgDwellSeconds: 380, engagementRatePercent: 74.0, trafficDensity: 'HIGH', bounceRatePercent: 15.2 },
        { zoneId: 'zone-6', zoneName: 'Electronics', visitorCount: 140, avgDwellSeconds: 540, engagementRatePercent: 62.0, trafficDensity: 'LOW', bounceRatePercent: 28.4 },
        { zoneId: 'zone-7', zoneName: 'Checkout Lanes (C1-C4)', visitorCount: 610, avgDwellSeconds: 150, engagementRatePercent: 98.0, trafficDensity: 'HIGH', bounceRatePercent: 0.5 },
      ],
      dwellTimeDistribution: [
        { bracket: '0-5 mins', percentage: 14, count: 257 },
        { bracket: '5-15 mins', percentage: 32, count: 588 },
        { bracket: '15-30 mins', percentage: 38, count: 699 },
        { bracket: '30+ mins', percentage: 16, count: 296 },
      ],
      heatmapGrid: {
        resolutionX: 10,
        resolutionY: 10,
        points: [
          { x: 2, y: 5, weight: 0.9 },
          { x: 3, y: 5, weight: 0.8 },
          { x: 6, y: 6, weight: 0.7 },
          { x: 9, y: 8, weight: 0.95 },
        ],
      },
    }

    return {
      success: true,
      data: payload,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getQueues(storeId = 'store-01'): Promise<ApiResponse<QueueAnalyticsPayload>> {
    return {
      success: true,
      data: { ...this.currentQueues, storeId },
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getStaff(storeId = 'store-01'): Promise<ApiResponse<StaffOperationsPayload>> {
    return {
      success: true,
      data: MOCK_STAFF,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getIncidents(storeId = 'store-01'): Promise<ApiResponse<IncidentsAnalyticsPayload>> {
    return {
      success: true,
      data: this.currentIncidents,
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 2, isSimulated: true },
    }
  }

  async getSystemHealth(storeId = 'store-01'): Promise<ApiResponse<SystemHealthPayload>> {
    return {
      success: true,
      data: this.currentSystemHealth,
      timestamp: new Date().toISOString(),
      meta: { storeId, edgeDeviceId: 'jetson-orin-nx-01', latencyMs: 1, isSimulated: true },
    }
  }

  async getPredictions(storeId = 'store-01'): Promise<ApiResponse<PredictionsPayload>> {
    return {
      success: true,
      data: { ...MOCK_PREDICTIONS, storeId },
      timestamp: new Date().toISOString(),
      meta: { storeId, latencyMs: 3, isSimulated: true },
    }
  }
}

export const mockDemoAdapter = new MockDemoAdapter()
