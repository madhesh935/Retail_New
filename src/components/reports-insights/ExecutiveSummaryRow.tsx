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

export const ExecutiveSummaryRow: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-mono">
      {/* 1. Footfall */}
      <div className="rounded-lg bg-[#0F172A] border border-cyan-500/40 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Total Footfall
          </span>
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <Footprints className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">1,284</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Entrances: 1,840</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> +12%
          </span>
          <span className="text-slate-500 text-[9px]">vs yesterday</span>
        </div>
      </div>

      {/* 2. Average Shelf Availability */}
      <div className="rounded-lg bg-[#0F172A] border border-emerald-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Avg Availability
          </span>
          <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <PackageCheck className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">91%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Target SLA: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400">+1.8% vs last week</span>
          <span className="text-slate-500 text-[9px]">Optimal</span>
        </div>
      </div>

      {/* 3. Average Queue Wait */}
      <div className="rounded-lg bg-[#0F172A] border border-cyan-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Avg Queue Wait
          </span>
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1">
            <span>2.7</span>
            <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Max Wait SLA: 3.0 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowDownRight className="h-3 w-3" /> -18%
          </span>
          <span className="text-slate-500 text-[9px]">vs baseline</span>
        </div>
      </div>

      {/* 4. AI Actions Completed */}
      <div className="rounded-lg bg-[#0F172A] border border-purple-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            AI Actions Done
          </span>
          <div className="p-1 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-300 tracking-tight">18</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vision Verified</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-purple-300 font-semibold">100% Executed</span>
          <span className="text-slate-500 text-[9px]">Autonomous</span>
        </div>
      </div>

      {/* 5. Critical Incidents Resolved */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Critical Resolved
          </span>
          <div className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
            <ShieldCheck className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">7/8</div>
          <div className="text-[10px] text-slate-400 mt-0.5">87.5% Resolved</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-rose-400">1 Active (C1 Queue)</span>
          <span className="text-slate-500 text-[9px]">In Progress</span>
        </div>
      </div>

      {/* 6. Average Staff Response */}
      <div className="rounded-lg bg-[#0F172A] border border-blue-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Staff Response
          </span>
          <div className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
            <UserCheck className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-300 tracking-tight flex items-baseline gap-1">
            <span>3.2</span>
            <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dispatch to arrival</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400">-0.4 min vs target</span>
          <span className="text-slate-500 text-[9px]">High Velocity</span>
        </div>
      </div>
    </div>
  )
}
