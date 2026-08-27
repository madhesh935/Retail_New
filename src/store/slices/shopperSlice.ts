import { StateCreator } from 'zustand'
import { TrackedShopper, ZoneTrafficMetric } from '@/types'

export interface ShopperSlice {
  currentOccupancy: number
  todaysTotalFootfall: number
  peakOccupancyToday: number
  occupancyRate: number
  averageDwellTimeMinutes: number
  activeShoppers: TrackedShopper[]
  zoneMetrics: ZoneTrafficMetric[]
  dwellTimeDistribution: { bracket: string; percentage: number; count: number }[]
  isLoadingShoppers: boolean

  updateOccupancy: (occupancy: number, rate: number, entryDelta?: number, exitDelta?: number) => void
  setActiveShoppers: (shoppers: TrackedShopper[]) => void
  setZoneMetrics: (metrics: ZoneTrafficMetric[]) => void
  setDwellDistribution: (dist: { bracket: string; percentage: number; count: number }[]) => void
  setLoadingShoppers: (loading: boolean) => void
}

export const createShopperSlice: StateCreator<ShopperSlice, [], [], ShopperSlice> = (set) => ({
  currentOccupancy: 0,
  todaysTotalFootfall: 0,
  peakOccupancyToday: 0,
  occupancyRate: 0,
  averageDwellTimeMinutes: 0,
  activeShoppers: [],
  zoneMetrics: [],
  dwellTimeDistribution: [],
  isLoadingShoppers: false,

  updateOccupancy: (occupancy, rate, entryDelta = 0) =>
    set((state) => ({
      currentOccupancy: occupancy,
      occupancyRate: rate,
      todaysTotalFootfall: state.todaysTotalFootfall + entryDelta,
      peakOccupancyToday: Math.max(state.peakOccupancyToday, occupancy),
    })),
  setActiveShoppers: (activeShoppers) => set({ activeShoppers }),
  setZoneMetrics: (zoneMetrics) => set({ zoneMetrics }),
  setDwellDistribution: (dwellTimeDistribution) => set({ dwellTimeDistribution }),
  setLoadingShoppers: (isLoadingShoppers) => set({ isLoadingShoppers }),
})
