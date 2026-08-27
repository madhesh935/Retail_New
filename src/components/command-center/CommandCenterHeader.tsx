import React from 'react'

export const CommandCenterHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 select-none font-sans">
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          Command Center
        </h1>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-700 font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          LIVE
        </span>
      </div>
    </div>
  )
}
