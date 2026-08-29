import React from 'react'
import { Cpu, Zap, Activity, Thermometer, Radio } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface EdgeHealthIndicatorProps {
  compact?: boolean
  className?: string
}

export const EdgeHealthIndicator: React.FC<EdgeHealthIndicatorProps> = ({
  compact = false,
  className,
}) => {
  const edgeDevice = useAppStore((s) => s.edgeDevice)
  const cloudSync = useAppStore((s) => s.cloudSync)

  if (!edgeDevice) return null

  const isTempHot = edgeDevice.temperatureCelsius > 70
  const isGpuHigh = edgeDevice.gpuUsagePercent > 85

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono select-none shadow-2xs',
          className
        )}
      >
        <div className="flex items-center gap-1 text-sky-700 font-semibold">
          <Cpu className="h-3.5 w-3.5 text-sky-600" />
          <span>GPU: {edgeDevice.gpuUsagePercent.toFixed(0)}%</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Activity className="h-3.5 w-3.5 text-emerald-600" />
          <span>{edgeDevice.fpsTotalInference.toFixed(0)} FPS</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className={cn('flex items-center gap-1 font-semibold', isTempHot ? 'text-rose-700' : 'text-slate-700')}>
          <Thermometer className="h-3.5 w-3.5 text-amber-600" />
          <span>{edgeDevice.temperatureCelsius.toFixed(0)}°C</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs space-y-3 font-sans select-none',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {edgeDevice.deviceName}
            </div>
            <div className="text-[10px] text-slate-500">
              {`IP: ${edgeDevice.ipAddress} • ${edgeDevice.model}`}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          JETPACK 5.1
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-sans text-xs">
        {/* GPU */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 flex items-center justify-between mb-1 font-medium">
            <span>GPU Load</span>
            <Zap className="h-3 w-3 text-sky-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            {edgeDevice.gpuUsagePercent.toFixed(1)}%
          </div>
          <div className="mt-1 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full',
                isGpuHigh ? 'bg-amber-500' : 'bg-sky-600'
              )}
              style={{ width: `${edgeDevice.gpuUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Inference FPS */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 flex items-center justify-between mb-1 font-medium">
            <span>Inference FPS</span>
            <Activity className="h-3 w-3 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-700 font-mono">
            {edgeDevice.fpsTotalInference.toFixed(1)}
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">
            6 RTSP Streams @ 30fps
          </div>
        </div>

        {/* Temperature */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 flex items-center justify-between mb-1 font-medium">
            <span>Core Temp</span>
            <Thermometer className="h-3 w-3 text-amber-600" />
          </div>
          <div className={cn('text-sm font-bold font-mono', isTempHot ? 'text-rose-700' : 'text-slate-900')}>
            {edgeDevice.temperatureCelsius.toFixed(1)}°C
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">
            Fan: {edgeDevice.fanSpeedPercent}% • {edgeDevice.powerDrawWatts}W
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 flex items-center justify-between mb-1 font-medium">
            <span>Cloud Sync</span>
            <Radio className="h-3 w-3 text-sky-600" />
          </div>
          <div className="text-sm font-bold text-sky-700 font-mono">
            {cloudSync.latencyMs} ms
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-mono">
            {cloudSync.cloudRegion.split(' ')[0]}
          </div>
        </div>
      </div>
    </div>
  )
}
