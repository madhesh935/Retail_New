import React from 'react'
import { ShieldAlert, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react'

interface IncidentSummaryKpisProps {
  criticalCount?: number
  highCount?: number
  activeCount?: number
  resolvedTodayCount?: number
}

export const IncidentSummaryKpis: React.FC<IncidentSummaryKpisProps> = ({
  criticalCount = 2,
  highCount = 4,
  activeCount = 7,
  resolvedTodayCount = 18,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
      {/* 1. Critical */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/40 p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            Critical
          </span>
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            {criticalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Need immediate action
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-rose-400 font-medium">
          C1 Congestion · Express C2
        </div>
      </div>

      {/* 2. High */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            High Severity
          </span>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {highCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Priority operational issues
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-amber-400 font-medium">
          B4 Depletion · Floor Spill
        </div>
      </div>

      {/* 3. Active Incidents */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            Active Incidents
          </span>
          <span className="h-2 w-2 rounded-full bg-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Assigned / In Progress
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-blue-400 font-medium">
          Under active resolution
        </div>
      </div>

      {/* 4. Resolved Today */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            Resolved Today
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {resolvedTodayCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Completed & confirmed
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          100% resolution rate
        </div>
      </div>
    </div>
  )
}
