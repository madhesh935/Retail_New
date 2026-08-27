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
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
              AI Dynamic Allocation Impact Audit
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          59% Wait Reduction
        </span>
      </div>

      {/* Intervention Showcase Card */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900 font-sans text-xs">
              Intervention: Counter C3 Opened
            </span>
          </div>
          <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-semibold">
            Executed at 18:42
          </span>
        </div>

        {/* Clear Before / After Comparison Columns */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* BEFORE Block */}
          <div className="p-2.5 rounded-lg bg-rose-50/30 border border-rose-200 space-y-1.5">
            <div className="text-[10px] font-bold text-rose-700 uppercase flex items-center justify-between font-sans">
              <span>BEFORE ACTION</span>
              <span className="text-rose-600">Congested</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">Queue Depth:</span>
              <strong className="text-rose-600 text-sm">8 shoppers</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">Est. Wait:</span>
              <strong className="text-rose-600 text-sm">5.6 min</strong>
            </div>
          </div>

          {/* AFTER Block */}
          <div className="p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-200 space-y-1.5">
            <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center justify-between font-sans">
              <span>AFTER ACTION</span>
              <span className="text-emerald-700">Resolved</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">Queue Depth:</span>
              <strong className="text-emerald-700 text-sm">3 shoppers</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-sans">Est. Wait:</span>
              <strong className="text-emerald-700 text-sm">2.3 min</strong>
            </div>
          </div>
        </div>

        {/* Summary Impact Banner */}
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <span className="text-slate-700 text-[11px] font-sans">
            Average customer wait reduced from <strong className="text-rose-600">5.6m</strong> → <strong className="text-emerald-700 font-bold">2.3 min</strong>
          </span>
          <span className="text-emerald-700 font-bold text-xs bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
            -59% Delay
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 mt-2">
        <span className="font-sans">Associate Assigned: Marcus Vance (S02)</span>
        <span className="text-sky-700 font-semibold">Audit Verified</span>
      </div>
    </div>
  )
}
