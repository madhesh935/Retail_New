import React from 'react'
import {
  Users,
  Footprints,
  PackageCheck,
  Clock,
  Activity,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatNumber } from '@/lib/utils'

export const KpiSummaryRow: React.FC = () => {
  const currentOccupancy = useAppStore((s) => s.currentOccupancy) || 179
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall) || 2006
  const storeInfo = useAppStore((s) => s.storeInfo)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds) || 144
  const activeIncidentsCount = useAppStore((s) => s.activeIncidentsCount) || 5

  const waitMinutes = (systemAvgWaitSec / 60).toFixed(1)
  const maxCap = storeInfo?.maxCapacity || 350
  const occupancyPct = Math.round((currentOccupancy / maxCap) * 100)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 font-sans">
      {/* 1. Occupancy */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-cyan-500/30 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-400">
            Occupancy
          </span>
          <div className="p-1 rounded bg-[#131D31] text-cyan-400 border border-cyan-500/20 shrink-0">
            <Users className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {currentOccupancy}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {occupancyPct}% of capacity
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <ArrowUpRight className="h-3 w-3" /> +14%
          </span>
          <span className="text-slate-500 text-[10px]">vs typical</span>
        </div>
      </div>

      {/* 2. Footfall */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-cyan-500/30 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-400">
            Footfall
          </span>
          <div className="p-1 rounded bg-[#131D31] text-cyan-400 border border-cyan-500/20 shrink-0">
            <Footprints className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatNumber(todaysTotalFootfall)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Peak: 18:00 – 19:00
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <ArrowUpRight className="h-3 w-3" /> +8.4%
          </span>
          <span className="text-slate-500 text-[10px]">vs yesterday</span>
        </div>
      </div>

      {/* 3. Shelf Health */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-amber-500/30 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-400">
            Shelf Health
          </span>
          <div className="p-1 rounded bg-[#1E1B18] text-amber-400 border border-amber-500/20 shrink-0">
            <PackageCheck className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            86%
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            3 need attention
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>Compliance</span>
          <span className="text-white font-medium font-mono">91%</span>
        </div>
      </div>

      {/* 4. Wait Time */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/30 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-400">
            Wait Time
          </span>
          <div className="p-1 rounded bg-[#10231D] text-emerald-400 border border-emerald-500/20 shrink-0">
            <Clock className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
            <span>{waitMinutes}</span>
            <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            4 active counters
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <ArrowDownRight className="h-3 w-3" /> -18%
          </span>
          <span className="text-slate-500 text-[10px]">vs yesterday</span>
        </div>
      </div>

      {/* 5. Store Health */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-emerald-500/30 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-400">
            Store Health
          </span>
          <div className="p-1 rounded bg-[#10231D] text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
            <span>91</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Healthy
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>SLA</span>
          <span className="text-emerald-400 font-medium">Optimal</span>
        </div>
      </div>

      {/* 6. Alerts */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/40 hover:border-rose-500/70 p-3.5 shadow-sm transition-all flex flex-col justify-between select-none">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-semibold text-slate-300">
            Alerts
          </span>
          <div className="p-1 rounded bg-rose-950/80 text-rose-400 border border-rose-500/30 shrink-0">
            <AlertOctagon className="h-3 w-3" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
            {activeIncidentsCount}
          </div>
          <div className="text-[11px] text-rose-300/90 font-medium mt-0.5">
            2 require action
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
          <span className="text-rose-400 font-medium">
            C1 & B4
          </span>
          <span className="text-slate-500 text-[10px]">3 Warnings</span>
        </div>
      </div>
    </div>
  )
}
