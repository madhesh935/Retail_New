import React from 'react'
import { CheckCircle2, ShieldCheck, ArrowRight, Clock } from 'lucide-react'
import { CANONICAL_RESOLUTIONS, ResolvedIncident } from './incidentData'

interface ResolvedIncidentShowcaseProps {
  resolutions?: ResolvedIncident[]
}

export const ResolvedIncidentShowcase: React.FC<ResolvedIncidentShowcaseProps> = ({
  resolutions = CANONICAL_RESOLUTIONS,
}) => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Recent Resolutions
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Verified completed store incidents and turnaround times
            </p>
          </div>
        </div>

        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
          {resolutions.length} Recently Resolved
        </span>
      </div>

      {/* 3 Resolution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {resolutions.slice(0, 3).map((res) => {
          const hasBeforeAfter = res.beforeValue && res.afterValue

          return (
            <div
              key={res.id}
              className="p-3 rounded-lg bg-[#090D14] border border-[#1E293B] flex flex-col justify-between space-y-2 text-xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white text-xs truncate">
                  {res.title}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {res.resolvedAt}
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                {res.zone} · <span className="text-slate-300">{res.owner}</span>
              </div>

              {/* Before vs After Metric (if measured) */}
              {hasBeforeAfter && (
                <div className="grid grid-cols-2 gap-2 my-1">
                  <div className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-center space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase">Before</span>
                    <div className="text-base font-bold text-rose-400 font-mono">{res.beforeValue}</div>
                  </div>

                  <div className="p-2 rounded bg-[#0F172A] border border-[#1E293B] text-center space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase">After</span>
                    <div className="text-base font-bold text-emerald-400 font-mono">{res.afterValue}</div>
                  </div>
                </div>
              )}

              {/* Description & Verification Footer */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{res.verificationType}</span>
                </span>
                <span className="text-slate-400 font-mono">{res.duration}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
