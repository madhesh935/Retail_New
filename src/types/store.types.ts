export interface StoreZone {
  id: string
  name: string
  category: string
  code: string
  currentOccupancy: number
  capacity: number
  avgDwellTimeSeconds: number
  alertCount: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface StoreStatus {
  storeId: string
  name: string
  code: string
  isOpen: boolean
  currentOccupancy: number
  maxCapacity: number
  occupancyRate: number
  todaysTotalFootfall: number
  currentActiveShoppers: number
  peakOccupancyToday: number
  averageDwellTimeMinutes: number
  edgeAiStatus: 'ACTIVE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE'
  activeIncidentsCount: number
  onlineCamerasCount: number
  totalCamerasCount: number
  activeStaffCount: number
  totalStaffCount: number
  avgCheckoutWaitTimeSeconds: number
  lastUpdated: string
}

export interface StoreState {
  storeId: string
  zones: StoreZone[]
  hourlyFootfall: { hour: string; count: number; predicted: number }[]
  entranceExitRate: { time: string; entries: number; exits: number }[]
  zoneDwellTimes: { zoneId: string; zoneName: string; dwellSeconds: number }[]
  hotspots: { x: number; y: number; intensity: number; zoneName: string }[]
}
