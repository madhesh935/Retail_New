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
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quantifiable Edge-AI Operational Impact
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          ROI Metric Audited
        </span>
      </div>

      {/* 5 Impact Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Predicted Stock-Outs Prevented */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Stock-Outs Prevented
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">8</div>
          <span className="text-[9px] text-slate-500 font-sans">Early restock triggers</span>
        </div>

        {/* 2. Queue Interventions */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Queue Interventions
          </span>
          <div className="text-2xl font-bold text-sky-700 font-mono">6</div>
          <span className="text-[9px] text-slate-500 font-sans">Dynamic counter activation</span>
        </div>

        {/* 3. Wait Reduction */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Avg Wait Reduction
          </span>
          <div className="text-2xl font-bold text-purple-700 font-mono">34%</div>
          <span className="text-[9px] text-emerald-700 font-semibold font-sans">-1.8m delay saved</span>
        </div>

        {/* 4. Replenishment Events */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Replenishments Done
          </span>
          <div className="text-2xl font-bold text-blue-700 font-mono">14</div>
          <span className="text-[9px] text-slate-500 font-sans">100% camera verified</span>
        </div>

        {/* 5. High Lost-Sale Risk Events */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 col-span-2 md:col-span-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Lost-Sale Risks Mitigated
          </span>
          <div className="text-2xl font-bold text-rose-700 font-mono">4</div>
          <span className="text-[9px] text-amber-800 font-bold font-sans">$2,110 estimated saved</span>
        </div>
      </div>
    </div>
  )
}
