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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 select-none font-sans">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
          Command Center
        </h1>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-mono text-emerald-700 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Last Updated Timestamp Ticker */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-sans">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-sky-600" />
          <span className="text-xs">
            Updated <strong className="text-slate-800">{lastTimestamp ? formatTimeAgo(lastTimestamp) : '2 sec ago'}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
