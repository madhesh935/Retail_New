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
  const isDemoMode = useAppStore((s) => s.isDemoMode)

  if (!edgeDevice) return null

  const isTempHot = edgeDevice.temperatureCelsius > 70
  const isGpuHigh = edgeDevice.gpuUsagePercent > 85

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-2.5 py-1 rounded bg-[#090D14] border border-[#1E293B] text-[11px] font-mono select-none',
          className
        )}
      >
        <div className="flex items-center gap-1 text-cyan-400">
          <Cpu className="h-3.5 w-3.5" />
          <span>GPU: {edgeDevice.gpuUsagePercent.toFixed(0)}%</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <Activity className="h-3.5 w-3.5" />
          <span>{edgeDevice.fpsTotalInference.toFixed(0)} FPS</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className={cn('flex items-center gap-1', isTempHot ? 'text-rose-400' : 'text-slate-300')}>
          <Thermometer className="h-3.5 w-3.5" />
          <span>{edgeDevice.temperatureCelsius.toFixed(0)}°C</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-[#0F172A] border border-[#1E293B] p-3 shadow-sm space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white font-mono">
              {edgeDevice.deviceName}
            </div>
            <div className="text-[10px] text-slate-400">
              {isDemoMode ? 'Simulated Edge Telemetry' : `IP: ${edgeDevice.ipAddress} • ${edgeDevice.model}`}
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          JETPACK 5.1
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
        {/* GPU */}
        <div className="p-2 rounded bg-[#090D14] border border-[#1E293B]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
            <span>GPU Load</span>
            <Zap className="h-3 w-3 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white">
            {edgeDevice.gpuUsagePercent.toFixed(1)}%
          </div>
          <div className="mt-1 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full',
                isGpuHigh ? 'bg-amber-400' : 'bg-cyan-400'
              )}
              style={{ width: `${edgeDevice.gpuUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Inference FPS */}
        <div className="p-2 rounded bg-[#090D14] border border-[#1E293B]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
            <span>Inference FPS</span>
            <Activity className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400">
            {edgeDevice.fpsTotalInference.toFixed(1)}
          </div>
          <div className="text-[9px] text-slate-500 mt-1">
            6 RTSP Streams @ 30fps
          </div>
        </div>

        {/* Temperature */}
        <div className="p-2 rounded bg-[#090D14] border border-[#1E293B]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
            <span>Core Temp</span>
            <Thermometer className="h-3 w-3 text-amber-400" />
          </div>
          <div className={cn('text-sm font-bold', isTempHot ? 'text-rose-400' : 'text-slate-200')}>
            {edgeDevice.temperatureCelsius.toFixed(1)}°C
          </div>
          <div className="text-[9px] text-slate-500 mt-1">
            Fan: {edgeDevice.fanSpeedPercent}% • {edgeDevice.powerDrawWatts}W
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="p-2 rounded bg-[#090D14] border border-[#1E293B]">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
            <span>Cloud Sync</span>
            <Radio className="h-3 w-3 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-blue-400">
            {cloudSync.latencyMs} ms
          </div>
          <div className="text-[9px] text-slate-500 mt-1">
            {cloudSync.cloudRegion.split(' ')[0]}
          </div>
        </div>
      </div>
    </div>
  )
}
