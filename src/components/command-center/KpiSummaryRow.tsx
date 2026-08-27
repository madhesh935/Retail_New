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
          <span className="text-emerald-700 flex items-center gap-0.5 font-semibold">
            <ArrowUpRight className="h-3 w-3" /> +14%
          </span>
          <span className="text-slate-400 text-[10px]">vs typical</span>
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
            Peak: 18:00 – 19:00
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-emerald-700 flex items-center gap-0.5 font-semibold">
            <ArrowUpRight className="h-3 w-3" /> +8.4%
          </span>
          <span className="text-slate-400 text-[10px]">vs yesterday</span>
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
            86%
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            3 need attention
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Compliance</span>
          <span className="text-slate-900 font-semibold font-mono">91%</span>
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
            4 active counters
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-emerald-700 flex items-center gap-0.5 font-semibold">
            <ArrowDownRight className="h-3 w-3" /> -18%
          </span>
          <span className="text-slate-400 text-[10px]">vs yesterday</span>
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
            <span>91</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Healthy
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>SLA</span>
          <span className="text-emerald-700 font-semibold">Optimal</span>
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
            2 require action
          </div>
        </div>

        <div className="mt-2 pt-1.5 border-t border-rose-100 flex items-center justify-between text-[11px]">
          <span className="text-rose-700 font-semibold">
            C1 & B4
          </span>
          <span className="text-slate-400 text-[10px]">3 Warnings</span>
        </div>
      </div>
    </div>
  )
}
