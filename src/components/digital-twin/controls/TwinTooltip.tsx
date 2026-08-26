import React from 'react'
import {
  Box,
  ListOrdered,
  Layers,
  Camera,
  UserCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TooltipType = 'shelf' | 'checkout' | 'zone' | 'staff' | 'incident' | 'camera'

export interface TooltipData {
  type: TooltipType
  title: string
  subtitle?: string
  status?: string
  statusColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple'
  metrics: { label: string; value: string; highlight?: boolean }[]
  alert?: string
  actionHint?: string
  screenX?: number
  screenY?: number
}

interface TwinTooltipProps {
  data: TooltipData | null
}

export const TwinTooltip: React.FC<TwinTooltipProps> = ({ data }) => {
  if (!data) return null

  const getIcon = () => {
    switch (data.type) {
      case 'shelf':
        return <Box className="h-3.5 w-3.5 text-amber-400" />
      case 'checkout':
        return <ListOrdered className="h-3.5 w-3.5 text-cyan-400" />
      case 'zone':
        return <Layers className="h-3.5 w-3.5 text-indigo-400" />
      case 'staff':
        return <UserCheck className="h-3.5 w-3.5 text-purple-400" />
      case 'incident':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
      case 'camera':
        return <Camera className="h-3.5 w-3.5 text-cyan-300" />
      default:
        return <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
    }
  }

  const getStatusBadge = () => {
    if (!data.status) return null
    let colorClasses = 'bg-[#131D31] text-cyan-300 border-cyan-500/30'
    if (data.statusColor === 'rose') {
      colorClasses = 'bg-rose-950 text-rose-300 border-rose-500/40'
    } else if (data.statusColor === 'amber') {
      colorClasses = 'bg-amber-950 text-amber-300 border-amber-500/40'
    } else if (data.statusColor === 'emerald') {
      colorClasses = 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
    } else if (data.statusColor === 'purple') {
      colorClasses = 'bg-purple-950 text-purple-300 border-purple-500/40'
    }

    return (
      <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase', colorClasses)}>
        {data.status}
      </span>
    )
  }

  return (
    <div
      className="pointer-events-none absolute z-30 transition-transform duration-75 ease-out font-sans"
      style={{
        left: data.screenX !== undefined ? Math.min(Math.max(data.screenX + 16, 16), window.innerWidth - 280) : '50%',
        top: data.screenY !== undefined ? Math.min(Math.max(data.screenY - 20, 40), window.innerHeight - 200) : '50%',
      }}
    >
      <div className="w-64 rounded-lg bg-[#090D14]/95 backdrop-blur-md border border-[#1E293B] shadow-2xl p-2.5 space-y-2 select-none text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1E293B]/80">
          <div className="flex items-center gap-1.5 truncate">
            {getIcon()}
            <span className="font-bold text-white text-xs truncate font-sans">
              {data.title}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {data.subtitle && (
          <div className="text-[11px] text-slate-400 font-sans truncate">
            {data.subtitle}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#070A0F] p-1.5 rounded border border-[#1E293B]/60 font-mono text-[10px]">
          {data.metrics.map((m, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-slate-500 block font-sans">{m.label}</span>
              <span className={cn('font-bold', m.highlight ? 'text-rose-400' : 'text-white')}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Alert Pill if any */}
        {data.alert && (
          <div className="text-[10px] font-mono bg-rose-950/40 p-1.5 rounded border border-rose-500/30 text-rose-300 font-medium">
            ? {data.alert}
          </div>
        )}

        {/* Action Hint */}
        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
          <span>Click to pin full details</span>
          <span className="text-cyan-400 font-mono">Inspect ?</span>
        </div>
      </div>
    </div>
  )
}
