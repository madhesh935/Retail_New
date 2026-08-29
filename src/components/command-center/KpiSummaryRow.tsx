import React from 'react'
import {
  Users,
  Footprints,
  PackageCheck,
  Clock,
  Activity,
  AlertOctagon,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatNumber } from '@/lib/utils'

export const KpiSummaryRow: React.FC = () => {
  const currentOccupancy = useAppStore((s) => s.currentOccupancy)
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall)
  const peakOccupancyToday = useAppStore((s) => s.peakOccupancyToday)
  const storeInfo = useAppStore((s) => s.storeInfo)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)
  const queues = useAppStore((s) => s.queues)
  const inventoryAnalytics = useAppStore((s) => s.inventoryAnalytics)
  const overallHealth = useAppStore((s) => s.overallHealth)
  const activeAnomalies = useAppStore((s) => s.activeAnomalies)
  const activeIncidentsCount = useAppStore((s) => s.activeIncidentsCount)
  const criticalIncidentsCount = useAppStore((s) => s.criticalIncidentsCount)
  const highIncidentsCount = useAppStore((s) => s.highIncidentsCount)
  const incidents = useAppStore((s) => s.incidents)

  const waitMinutes = (systemAvgWaitSec / 60).toFixed(1)
  const maxCap = storeInfo?.maxCapacity || 1
  const occupancyPct = Math.round((currentOccupancy / maxCap) * 100)

  const activeLanes = Array.isArray(queues) ? queues.filter((q) => q.status !== 'CLOSED') : []
  const congestedLanes = activeLanes.filter((q) => q.status === 'CONGESTED')

  const totalShelves = inventoryAnalytics.totalShelfSections
  const shelvesNeedingAttention = inventoryAnalytics.activeStockoutsCount + inventoryAnalytics.criticalLowStockCount
  const shelfHealthPct = totalShelves > 0
    ? Math.round(((totalShelves - shelvesNeedingAttention) / totalShelves) * 100)
    : 100

  const storeHealthScore = Math.max(
    0,
    100 - activeAnomalies.length * 15 - (overallHealth === 'CRITICAL' ? 40 : overallHealth === 'WARNING' ? 15 : 0)
  )

  const topOpenIncident = incidents.find((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 font-sans">
      {/* 1. Occupancy */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
            Occupancy
          </span>
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-slate-900 tracking-tight">
            {currentOccupancy}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {occupancyPct}% of capacity
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-600 font-semibold">Peak today: {peakOccupancyToday}</span>
        </div>
      </div>

      {/* 2. Footfall */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
            Footfall
          </span>
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <Footprints className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-slate-900 tracking-tight">
            {formatNumber(todaysTotalFootfall)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Today&apos;s total entries
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-600 font-semibold">
            Avg dwell: {storeInfo?.averageDwellTimeMinutes ?? 0} min
          </span>
        </div>
      </div>

      {/* 3. Shelf Health */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
            Shelf Health
          </span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <PackageCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-slate-900 tracking-tight">
            {shelfHealthPct}%
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {shelvesNeedingAttention} need attention
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Compliance</span>
          <span className="text-slate-900 font-semibold font-mono">
            {Math.round(inventoryAnalytics.overallPlanogramCompliance)}%
          </span>
        </div>
      </div>

      {/* 4. Wait Time */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
            Wait Time
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{waitMinutes}</span>
            <span className="text-xs text-slate-500 font-normal">min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {activeLanes.length} active counters
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className={congestedLanes.length > 0 ? 'text-rose-700 font-semibold' : 'text-emerald-700 font-semibold'}>
            {congestedLanes.length > 0 ? `${congestedLanes.length} congested` : 'No congestion'}
          </span>
        </div>
      </div>

      {/* 5. Store Health */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.06em]">
            Store Health
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <Activity className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-slate-900 tracking-tight flex items-baseline gap-1">
            <span>{storeHealthScore}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {overallHealth === 'HEALTHY' ? 'Healthy' : overallHealth === 'WARNING' ? 'Warning' : 'Critical'}
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Anomalies</span>
          <span className="text-slate-900 font-semibold">{activeAnomalies.length}</span>
        </div>
      </div>

      {/* 6. Alerts */}
      <div className="erp-kpi p-3.5 flex flex-col justify-between select-none cursor-default border-rose-200/80 hover:border-rose-300">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-[0.06em]">
            Alerts
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
            <AlertOctagon className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-[1.65rem] font-extrabold font-mono text-rose-600 tracking-tight">
            {activeIncidentsCount}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
            {criticalIncidentsCount} critical, {highIncidentsCount} high
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-rose-100 flex items-center justify-between text-[11px]">
          <span className="text-rose-700 font-semibold truncate max-w-[70%]">
            {topOpenIncident ? topOpenIncident.zoneName : 'None open'}
          </span>
        </div>
      </div>
    </div>
  )
}
