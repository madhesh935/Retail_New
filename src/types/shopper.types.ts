export interface ShopperTrajectoryPoint {
  x: number
  y: number
  timestamp: string
}

export interface TrackedShopper {
  trackingId: string
  zoneId: string
  zoneName: string
  entryTime: string
  dwellTimeSeconds: number
  currentCoordinates: { x: number; y: number }
  velocity: number
  shoppingState: 'BROWSING' | 'DECIDING' | 'ENGAGED' | 'CHECKOUT_BOUND' | 'QUEUED'
  basketInteractionCount: number
}

export interface ZoneTrafficMetric {
  zoneId: string
  zoneName: string
  visitorCount: number
  avgDwellSeconds: number
  engagementRatePercent: number
  trafficDensity: 'LOW' | 'MODERATE' | 'HIGH' | 'CONGESTED'
  bounceRatePercent: number
}

export interface ShopperAnalyticsPayload {
  storeId: string
  currentOccupancy: number
  totalDailyFootfall: number
  entranceCountToday: number
  exitCountToday: number
  averageDwellMinutes: number
  peakHourToday: string
  activeShoppers: TrackedShopper[]
  zoneMetrics: ZoneTrafficMetric[]
  dwellTimeDistribution: { bracket: string; percentage: number; count: number }[]
  heatmapGrid: {
    resolutionX: number
    resolutionY: number
    points: { x: number; y: number; weight: number }[]
  }
}
