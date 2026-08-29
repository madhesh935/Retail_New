import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'

const shortStaffCode = (id: string) => id.replace(/^staff-s/i, 'S').toUpperCase()

export interface LiveManagerContext {
  currentOccupancy: number
  occupancyPct: number
  shelfHealthPct: number
  criticalShelvesCount: number
  avgWaitMinutes: string
  criticalIncidentsCount: number
  availableStaffCount: number
  availableStaffCodes: string[]
  storeHealthScore: number
  storeHealthLabel: string
  camerasOnline: number
  camerasTotal: number
  isEdgeConnected: boolean
}

/** Live manager-dashboard metrics shared by the copilot's context panel and its chat grounding. */
export function useLiveManagerContext(): LiveManagerContext {
  const currentOccupancy = useAppStore((s) => s.currentOccupancy)
  const storeInfo = useAppStore((s) => s.storeInfo)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)
  const inventoryAnalytics = useAppStore((s) => s.inventoryAnalytics)
  const overallHealth = useAppStore((s) => s.overallHealth)
  const activeAnomalies = useAppStore((s) => s.activeAnomalies)
  const criticalIncidentsCount = useAppStore((s) => s.criticalIncidentsCount)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const cameras = useAppStore((s) => s.cameras)
  const connectionState = useAppStore((s) => s.connectionState)

  return useMemo(() => {
    const maxCap = storeInfo?.maxCapacity || 1
    const occupancyPct = Math.round((currentOccupancy / maxCap) * 100)

    const totalShelves = inventoryAnalytics.totalShelfSections
    const shelvesNeedingAttention =
      inventoryAnalytics.activeStockoutsCount + inventoryAnalytics.criticalLowStockCount
    const shelfHealthPct =
      totalShelves > 0
        ? Math.round(((totalShelves - shelvesNeedingAttention) / totalShelves) * 100)
        : 100

    const storeHealthScore = Math.max(
      0,
      100 - activeAnomalies.length * 15 - (overallHealth === 'CRITICAL' ? 40 : overallHealth === 'WARNING' ? 15 : 0)
    )

    const availableStaff = staffMembers.filter((s) => s.status === 'ON_DUTY_AVAILABLE')

    return {
      currentOccupancy,
      occupancyPct,
      shelfHealthPct,
      criticalShelvesCount: inventoryAnalytics.criticalLowStockCount,
      avgWaitMinutes: (systemAvgWaitSec / 60).toFixed(1),
      criticalIncidentsCount,
      availableStaffCount: availableStaff.length,
      availableStaffCodes: availableStaff.map((s) => shortStaffCode(s.id)),
      storeHealthScore,
      storeHealthLabel:
        overallHealth === 'HEALTHY' ? 'Healthy' : overallHealth === 'WARNING' ? 'Warning' : 'Critical',
      camerasOnline: cameras.filter((c) => c.status === 'ONLINE').length,
      camerasTotal: cameras.length,
      isEdgeConnected: connectionState === 'CONNECTED',
    }
  }, [
    currentOccupancy,
    storeInfo,
    systemAvgWaitSec,
    inventoryAnalytics,
    overallHealth,
    activeAnomalies,
    criticalIncidentsCount,
    staffMembers,
    cameras,
    connectionState,
  ])
}
