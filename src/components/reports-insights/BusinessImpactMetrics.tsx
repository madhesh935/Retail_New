import React from 'react'
import {
  TrendingDown,
  ShieldCheck,
  Zap,
  PackageCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export const BusinessImpactMetrics: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quantifiable Edge-AI Operational Impact
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50">
          ROI Metric Audited
        </span>
      </div>

      {/* 5 Impact Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Predicted Stock-Outs Prevented */}
        <div className="bg-[#090D14] p-3 rounded-lg border border-emerald-500/40 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            Stock-Outs Prevented
          </span>
          <div className="text-2xl font-bold text-emerald-400">8</div>
          <span className="text-[9px] text-slate-500">Early restock triggers</span>
        </div>

        {/* 2. Queue Interventions */}
        <div className="bg-[#090D14] p-3 rounded-lg border border-cyan-500/40 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            Queue Interventions
          </span>
          <div className="text-2xl font-bold text-cyan-300">6</div>
          <span className="text-[9px] text-slate-500">Dynamic counter activation</span>
        </div>

        {/* 3. Wait Reduction */}
        <div className="bg-[#090D14] p-3 rounded-lg border border-purple-500/40 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            Avg Wait Reduction
          </span>
          <div className="text-2xl font-bold text-purple-300">34%</div>
          <span className="text-[9px] text-emerald-400 font-semibold">-1.8m delay saved</span>
        </div>

        {/* 4. Replenishment Events */}
        <div className="bg-[#090D14] p-3 rounded-lg border border-blue-500/40 flex flex-col justify-between space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            Replenishments Done
          </span>
          <div className="text-2xl font-bold text-blue-300">14</div>
          <span className="text-[9px] text-slate-500">100% camera verified</span>
        </div>

        {/* 5. High Lost-Sale Risk Events */}
        <div className="bg-[#090D14] p-3 rounded-lg border border-rose-500/40 flex flex-col justify-between space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            Lost-Sale Risks Mitigated
          </span>
          <div className="text-2xl font-bold text-rose-400">4</div>
          <span className="text-[9px] text-amber-300 font-semibold">$2,110 estimated saved</span>
        </div>
      </div>
    </div>
  )
}
