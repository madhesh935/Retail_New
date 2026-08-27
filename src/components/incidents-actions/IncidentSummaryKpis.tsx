import React from 'react'
import { ShieldAlert, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react'

interface IncidentSummaryKpisProps {
  criticalCount?: number
  highCount?: number
  activeCount?: number
  resolvedTodayCount?: number
  latestCriticalMessage?: string
  latestHighMessage?: string
}

export const IncidentSummaryKpis: React.FC<IncidentSummaryKpisProps> = ({
  criticalCount = 2,
  highCount = 4,
  activeCount = 7,
  resolvedTodayCount = 18,
  latestCriticalMessage = 'C1 Congestion · Express C2',
  latestHighMessage = 'B4 Depletion · Floor Spill',
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none font-sans">
      {/* 1. Critical */}
      <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500 truncate">
            Critical
          </span>
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight font-mono">
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Need immediate action
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-rose-100 text-[11px] text-rose-700 font-semibold truncate">
          {latestCriticalMessage}
        </div>
      </div>

      {/* 2. High */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500 truncate">
            High Severity
          </span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-800 tracking-tight font-mono">
            {highCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Priority operational issues
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-amber-800 font-semibold truncate">
          {latestHighMessage}
        </div>
      </div>

      {/* 3. Active Incidents */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500 truncate">
            Active Incidents
          </span>
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Assigned / In Progress
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-blue-700 font-semibold">
          Under active resolution
        </div>
      </div>

      {/* 4. Resolved Today */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500 truncate">
            Resolved Today
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
            {resolvedTodayCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Completed & confirmed
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          100% resolution rate
        </div>
      </div>
    </div>
  )
}
