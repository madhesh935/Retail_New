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
  currentOccupancy: 142,
  todaysTotalFootfall: 1840,
  peakOccupancyToday: 288,
  occupancyRate: 40.5,
  averageDwellTimeMinutes: 24.5,
  activeShoppers: [],
  zoneMetrics: [],
  dwellTimeDistribution: [
    { bracket: '0-5 mins', percentage: 14, count: 257 },
    { bracket: '5-15 mins', percentage: 32, count: 588 },
    { bracket: '15-30 mins', percentage: 38, count: 699 },
    { bracket: '30+ mins', percentage: 16, count: 296 },
  ],
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
