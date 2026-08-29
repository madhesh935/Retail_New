import React from 'react'
import { CheckCircle2, ShieldCheck, ArrowRight, Clock } from 'lucide-react'
import { ResolvedIncident } from './incidentData'

interface ResolvedIncidentShowcaseProps {
  resolutions?: ResolvedIncident[]
}

export const ResolvedIncidentShowcase: React.FC<ResolvedIncidentShowcaseProps> = ({
  resolutions = [],
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Recent Resolutions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified completed store incidents and turnaround times
            </p>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
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
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 text-xs shadow-2xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {res.title}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {res.resolvedAt}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                {res.zone} · <span className="text-slate-800 font-semibold">{res.owner}</span>
              </div>

              {/* Before vs After Metric (if measured) */}
              {hasBeforeAfter && (
                <div className="grid grid-cols-2 gap-2 my-1">
                  <div className="p-2 rounded-lg bg-white border border-rose-200 text-center space-y-0.5 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Before</span>
                    <div className="text-base font-bold text-rose-700 font-mono">{res.beforeValue}</div>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-emerald-200 text-center space-y-0.5 shadow-2xs">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">After</span>
                    <div className="text-base font-bold text-emerald-700 font-mono">{res.afterValue}</div>
                  </div>
                </div>
              )}

              {/* Description & Verification Footer */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{res.verificationType}</span>
                </span>
                <span className="text-slate-500 font-mono">{res.duration}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
