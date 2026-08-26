import React from 'react'
import {
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Zap,
  Clock,
  Users,
} from 'lucide-react'

export const AiActionImpactCard: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Dynamic Allocation Impact Audit
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50">
          59% Wait Reduction
        </span>
      </div>

      {/* Intervention Showcase Card */}
      <div className="p-3 rounded-lg bg-[#090D14] border border-[#1E293B] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-bold text-white font-sans text-xs">
              Intervention: Counter C3 Opened
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
            Executed at 18:42
          </span>
        </div>

        {/* Clear Before / After Comparison Columns */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* BEFORE Block */}
          <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/40 space-y-1.5">
            <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between">
              <span>BEFORE ACTION</span>
              <span className="text-rose-300">Congested</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Queue Depth:</span>
              <strong className="text-rose-400 text-sm">8 shoppers</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Est. Wait:</span>
              <strong className="text-rose-400 text-sm">5.6 min</strong>
            </div>
          </div>

          {/* AFTER Block */}
          <div className="p-2.5 rounded bg-emerald-950/25 border border-emerald-500/50 space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
              <span>AFTER ACTION</span>
              <span className="text-emerald-300">Resolved</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Queue Depth:</span>
              <strong className="text-emerald-400 text-sm">3 shoppers</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Est. Wait:</span>
              <strong className="text-emerald-400 text-sm">2.3 min</strong>
            </div>
          </div>
        </div>

        {/* Summary Impact Banner */}
        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs">
          <span className="text-slate-300 text-[11px]">
            Average customer wait reduced from <strong className="text-rose-400">5.6m</strong> → <strong className="text-emerald-400">2.3 min</strong>
          </span>
          <span className="text-emerald-400 font-bold text-xs bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/60">
            -59% Delay
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400 mt-2">
        <span>Associate Assigned: Marcus Vance (S02)</span>
        <span className="text-cyan-400">Audit Verified</span>
      </div>
    </div>
  )
}
