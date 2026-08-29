import React, { useMemo } from 'react'
import { Footprints, PackageCheck, Clock, UserCheck } from 'lucide-react'
import { FootfallTrendEChart } from './charts/FootfallTrendEChart'
import { ShelfHealthEChart } from './charts/ShelfHealthEChart'
import { QueueWaitTimeEChart } from './charts/QueueWaitTimeEChart'
import { StaffResponseEChart } from './charts/StaffResponseEChart'
import { useAppStore } from '@/store/useAppStore'
import { useMetricHistory } from '@/hooks/useMetricHistory'

const fmtSeconds = (seconds: number) => (seconds < 60 ? `${Math.round(seconds)}s` : `${(seconds / 60).toFixed(1)} min`)

export const FourCoreTrendGrid: React.FC = () => {
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const queues = useAppStore((s) => s.queues)
  const inventoryAnalytics = useAppStore((s) => s.inventoryAnalytics)
  const { points: dispatchPoints } = useMetricHistory('DISPATCH_RESPONSE', 60000)

  const activeLanes = Array.isArray(queues) ? queues.filter((q) => q.status !== 'CLOSED') : []
  const avgWaitSeconds = activeLanes.length > 0
    ? Math.round(activeLanes.reduce((acc, l) => acc + l.currentWaitTimeSeconds, 0) / activeLanes.length)
    : 0
  const avgWaitLabel = fmtSeconds(avgWaitSeconds)
  const healthyShelves = shelfItems.filter((s) => s.status === 'OPTIMAL').length
  const avgDispatchLabel = useMemo(() => {
    if (dispatchPoints.length === 0) return null
    const avg = dispatchPoints.reduce((acc, p) => acc + p.value, 0) / dispatchPoints.length
    return fmtSeconds(avg)
  }, [dispatchPoints])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none font-sans">
      {/* 1. Footfall Volume Trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <Footprints className="h-3.5 w-3.5 text-sky-600" />
            <span>1. Footfall Volume Trend</span>
          </div>
          <span className="text-[10px] text-slate-600 font-semibold">{todaysTotalFootfall} today</span>
        </div>
        <FootfallTrendEChart />
      </div>

      {/* 2. Shelf Availability Health */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>2. Shelf Availability Health</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {healthyShelves}/{shelfItems.length} healthy • {Math.round(inventoryAnalytics.overallPlanogramCompliance)}% compliance
          </span>
        </div>
        <ShelfHealthEChart />
      </div>

      {/* 3. Checkout Queue Wait Time */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>3. Checkout Queue Wait Time</span>
          </div>
          <span className="text-[10px] text-sky-700 font-semibold">{avgWaitLabel} avg (SLA &lt;3m)</span>
        </div>
        <QueueWaitTimeEChart />
      </div>

      {/* 4. Staff Dispatch Response Time */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <UserCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>4. Staff Dispatch Response Time</span>
          </div>
          <span className="text-[10px] text-purple-700 font-semibold">
            {avgDispatchLabel ? `${avgDispatchLabel} avg (SLA <5m)` : 'Collecting data…'}
          </span>
        </div>
        <StaffResponseEChart />
      </div>
    </div>
  )
}
