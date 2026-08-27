import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatTimeAgo } from '@/lib/utils'

export const CommandCenterHeader: React.FC = () => {
  const lastTimestamp = useAppStore((s) => s.lastTelemetryTimestamp)
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200/80 select-none font-sans">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Command Center
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-700 font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            LIVE
          </span>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Real-time store operations · cameras, queues, inventory & dispatch
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <Clock className="h-3.5 w-3.5 text-sky-600" />
          <span>
            Updated{' '}
            <strong className="text-slate-800 font-semibold">
              {lastTimestamp ? formatTimeAgo(lastTimestamp) : '2 sec ago'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
