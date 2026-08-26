import React from 'react'
import { Clock, TrendingDown, ArrowDownRight, CheckCircle2 } from 'lucide-react'

export const WaitTimeTrendCard: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Wait Time Trends & SLA Compliance
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
          91.4% SLA Met
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 my-2 text-xs">
        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-500 block">Current Wait</span>
          <div className="text-xl font-bold text-white">2.8 min</div>
          <span className="text-[9px] text-emerald-400 font-semibold">-18% vs peak</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-500 block">Hourly Average</span>
          <div className="text-xl font-bold text-slate-200">3.1 min</div>
          <span className="text-[9px] text-slate-500">Last 4 Hours</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-rose-500/40">
          <span className="text-[10px] text-slate-500 block">Peak Wait</span>
          <div className="text-xl font-bold text-rose-400">5.6 min</div>
          <span className="text-[9px] text-rose-300">at 18:30 (C1)</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
        <span>Customer SLA: Maximum 3.0 min Wait</span>
        <span className="text-cyan-400">DeepStream Video Timing</span>
      </div>
    </div>
  )
}
