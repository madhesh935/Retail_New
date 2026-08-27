import React from 'react'
import {
  Box,
  ListOrdered,
  Layers,
  Camera,
  UserCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
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
  cursorPos?: { x: number; y: number } | null
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export const TwinTooltip: React.FC<TwinTooltipProps> = ({
  data,
  cursorPos,
  containerRef,
}) => {
  if (!data) return null

  // Calculate container-relative coordinates
  const containerW = containerRef?.current?.clientWidth || 900
  const containerH = containerRef?.current?.clientHeight || 600

  let posX = cursorPos?.x ?? 0
  let posY = cursorPos?.y ?? 0

  if ((!cursorPos || (cursorPos.x === 0 && cursorPos.y === 0)) && data.screenX !== undefined && data.screenY !== undefined) {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect()
      posX = data.screenX - rect.left
      posY = data.screenY - rect.top
    } else {
      posX = data.screenX
      posY = data.screenY
    }
  }

  // Estimated tooltip dimensions
  const tooltipWidth = 270
  const tooltipHeight = data.alert ? 190 : 160

  // Smart floating placement:
  // Default: Float above and to the right of cursor
  let left = posX + 16
  let top = posY - tooltipHeight - 12

  // If it goes beyond the right edge, flip to the left of the cursor
  if (left + tooltipWidth > containerW - 14) {
    left = posX - tooltipWidth - 16
  }

  // If too close to the left edge, clamp
  if (left < 14) {
    left = 14
  }

  // If it goes above the top edge, flip below the cursor
  if (top < 14) {
    top = posY + 22
  }

  // If it goes below the bottom edge, clamp
  if (top + tooltipHeight > containerH - 14) {
    top = containerH - tooltipHeight - 14
  }

  const getIcon = () => {
    switch (data.type) {
      case 'shelf':
        return <Box className="h-3.5 w-3.5 text-cyan-400" />
      case 'checkout':
        return <ListOrdered className="h-3.5 w-3.5 text-emerald-400" />
      case 'zone':
        return <Layers className="h-3.5 w-3.5 text-indigo-400" />
      case 'staff':
        return <UserCheck className="h-3.5 w-3.5 text-purple-400" />
      case 'incident':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
      case 'camera':
        return <Camera className="h-3.5 w-3.5 text-sky-400" />
      default:
        return <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
    }
  }

  const getStatusBadge = () => {
    if (!data.status) return null
    let colorClasses = 'bg-sky-50 text-sky-700 border-sky-200'
    if (data.statusColor === 'rose') {
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
    } else if (data.statusColor === 'amber') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs'
    } else if (data.statusColor === 'emerald') {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
    } else if (data.statusColor === 'purple') {
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
    }

    return (
      <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider', colorClasses)}>
        {data.status}
      </span>
    )
  }

  return (
    <div
      className="pointer-events-none absolute z-40 font-sans transition-all duration-75 ease-out"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="w-[268px] rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl p-2.5 space-y-2 select-none text-slate-700 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0 pr-1">
            {getIcon()}
            <span className="font-bold text-slate-900 text-[12px] truncate font-sans tracking-tight">
              {data.title}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {data.subtitle && (
          <div className="text-[10.5px] text-slate-500 font-sans truncate -mt-0.5">
            {data.subtitle}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 font-mono text-[10px]">
          {data.metrics.map((m, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-slate-500 block font-sans text-[9.5px]">{m.label}</span>
              <span className={cn('font-bold text-[11px]', m.highlight ? 'text-rose-700' : 'text-slate-900')}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Alert Pill if any */}
        {data.alert && (
          <div className="text-[9.5px] font-mono bg-rose-50 p-1.5 rounded-lg border border-rose-200 text-rose-700 font-bold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />
            <span className="truncate">{data.alert}</span>
          </div>
        )}

        {/* Action Hint */}
        <div className="text-[9.5px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-100 font-sans">
          <span>Click object to inspect</span>
          <span className="text-sky-700 font-mono font-bold flex items-center gap-0.5 text-[9px]">
            Details <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
