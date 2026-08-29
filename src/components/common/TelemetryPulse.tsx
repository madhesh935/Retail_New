import React, { useState, useEffect } from 'react'
import { Activity, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatTimeAgo, cn } from '@/lib/utils'

interface TelemetryPulseProps {
  className?: string
  showText?: boolean
}

export const TelemetryPulse: React.FC<TelemetryPulseProps> = ({
  className,
  showText = true,
}) => {
  const lastTimestamp = useAppStore((s) => s.lastTelemetryTimestamp)
  const connectionState = useAppStore((s) => s.connectionState)
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const isConnected = connectionState === 'CONNECTED'
  const timeAgo = lastTimestamp ? formatTimeAgo(lastTimestamp) : 'Syncing'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] select-none shrink-0 whitespace-nowrap shadow-2xs',
        className
      )}
    >
      <div className="relative flex h-2 w-2 shrink-0">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          )}
        />
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 text-slate-600 shrink-0 whitespace-nowrap font-sans">
          <span className="text-sky-700 font-bold uppercase tracking-wider text-[10px] font-mono">
            LIVE TELEMETRY
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 text-[11px]">{timeAgo}</span>
        </div>
      )}
    </div>
  )
}
