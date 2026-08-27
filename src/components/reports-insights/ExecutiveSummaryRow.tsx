import React from 'react'
import {
  Footprints,
  PackageCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const ExecutiveSummaryRow: React.FC = () => {
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)
  const queues = useAppStore((s) => s.queues)
  const queueActionLog = useAppStore((s) => s.queueActionLog)

  const avgWaitMin = systemAvgWaitSec ? (systemAvgWaitSec / 60).toFixed(1) : '2.7'
  const isSlaBreached = Number(avgWaitMin) > 3.0

  // Resolve critical incidents: queue action log entries count as resolved
  const queueActionsCount = queueActionLog.length

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
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">1,284</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Entrances: 1,840</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> +12%
          </span>
          <span className="text-slate-400 text-[9px]">vs yesterday</span>
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
          <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">91%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target SLA: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-emerald-700 font-semibold">+1.8% vs last wk</span>
          <span className="text-slate-400 text-[9px]">Optimal</span>
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
            {isSlaBreached ? '⚠️ SLA Breached (>3.0 min)' : 'Max Wait SLA: 3.0 min'}
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className={`flex items-center gap-0.5 font-semibold ${isSlaBreached ? 'text-rose-700' : 'text-emerald-700'}`}>
            <ArrowDownRight className="h-3 w-3" /> Live
          </span>
          <span className="text-slate-400 text-[9px]">YOLO Model</span>
        </div>
      </div>

      {/* 4. AI Actions Completed */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            AI Actions Done
          </span>
          <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-700 tracking-tight font-mono">18</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Vision Verified</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-purple-700 font-semibold">100% Executed</span>
          <span className="text-slate-400 text-[9px]">Autonomous</span>
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
          <div className="text-2xl font-bold text-rose-700 tracking-tight font-mono">7/8</div>
          <div className="text-[10px] text-slate-500 mt-0.5">87.5% Resolved</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-rose-700 font-semibold">1 Active (C1 Queue)</span>
          <span className="text-slate-400 text-[9px]">In Progress</span>
        </div>
      </div>

      {/* 6. Average Staff Response */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            Staff Response
          </span>
          <div className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-700 tracking-tight flex items-baseline gap-1 font-mono">
            <span>3.2</span>
            <span className="text-xs text-slate-500 font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dispatch to arrival</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-emerald-700 font-semibold">-0.4 min vs target</span>
          <span className="text-slate-400 text-[9px]">High Velocity</span>
        </div>
      </div>
    </div>
  )
}
