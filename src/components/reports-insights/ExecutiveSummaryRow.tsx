import React from 'react'
import {
  Footprints,
  PackageCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatNumber } from '@/lib/utils'

export const ExecutiveSummaryRow: React.FC = () => {
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall)
  const storeInfo = useAppStore((s) => s.storeInfo)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)
  const queueActionLog = useAppStore((s) => s.queueActionLog)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const incidents = useAppStore((s) => s.incidents)
  const staffMembers = useAppStore((s) => s.staffMembers)

  const avgWaitMin = (systemAvgWaitSec / 60).toFixed(1)
  const isSlaBreached = Number(avgWaitMin) > 3.0

  const avgAvailability = shelfItems.length > 0
    ? Math.round(
        (shelfItems.reduce((acc, s) => acc + (s.capacityCount > 0 ? s.currentCount / s.capacityCount : 0), 0) /
          shelfItems.length) *
          100
      )
    : 0

  const queueActionsCount = queueActionLog.length

  const criticalIncidents = incidents.filter((i) => i.severity === 'critical')
  const criticalResolved = criticalIncidents.filter((i) => i.status === 'RESOLVED').length

  const tasksCompletedToday = staffMembers.reduce((acc, s) => acc + (s.tasksCompletedToday || 0), 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-sans">
      {/* 1. Footfall */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Total Footfall
          </span>
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Footprints className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{formatNumber(todaysTotalFootfall)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Today&apos;s total entries</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-600 font-semibold">Avg dwell: {storeInfo?.averageDwellTimeMinutes ?? 0} min</span>
        </div>
      </div>

      {/* 2. Average Shelf Availability */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Avg Availability
          </span>
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
            <PackageCheck className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">{avgAvailability}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target SLA: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-600 font-semibold">{shelfItems.length} shelves monitored</span>
        </div>
      </div>

      {/* 3. Average Queue Wait */}
      <div className={`rounded-xl bg-white border ${isSlaBreached ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} p-3.5 flex flex-col justify-between shadow-2xs`}>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Avg Queue Wait
          </span>
          <div className={`p-1 rounded-md ${isSlaBreached ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-sky-50 text-sky-600 border border-sky-200'}`}>
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className={`text-2xl font-bold tracking-tight flex items-baseline gap-1 font-mono ${isSlaBreached ? 'text-rose-700' : 'text-slate-900'}`}>
            <span>{avgWaitMin}</span>
            <span className="text-xs text-slate-500 font-normal">min</span>
          </div>
          <div className={`text-[10px] mt-0.5 ${isSlaBreached ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
            {isSlaBreached ? 'SLA Breached (>3.0 min)' : 'Max Wait SLA: 3.0 min'}
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className={`font-semibold ${isSlaBreached ? 'text-rose-700' : 'text-emerald-700'}`}>Live</span>
          <span className="text-slate-400 text-[9px]">YOLO Model</span>
        </div>
      </div>

      {/* 4. Queue Actions Taken */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Queue Actions Taken
          </span>
          <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-700 tracking-tight font-mono">{queueActionsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">This session</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-purple-700 font-semibold">{queueActionsCount > 0 ? 'Manager-triggered' : 'None yet'}</span>
        </div>
      </div>

      {/* 5. Critical Incidents Resolved */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Critical Resolved
          </span>
          <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight font-mono">{criticalResolved}/{criticalIncidents.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {criticalIncidents.length > 0 ? `${Math.round((criticalResolved / criticalIncidents.length) * 100)}% Resolved` : 'None today'}
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-rose-700 font-semibold">{criticalIncidents.length - criticalResolved} active</span>
        </div>
      </div>

      {/* 6. Staff Tasks Completed Today */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Tasks Completed
          </span>
          <div className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-700 tracking-tight font-mono">{tasksCompletedToday}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Staff-reported, today</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-600 font-semibold">{staffMembers.length} staff on roster</span>
        </div>
      </div>
    </div>
  )
}
