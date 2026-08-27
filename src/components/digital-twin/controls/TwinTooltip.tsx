import React, { useEffect, useRef, useState } from 'react'
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
  containerRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * Self-contained tooltip: tracks cursor via refs + rAF so the 3D Canvas parent
 * does not re-render on every mousemove (that caused scene flicker).
 */
export const TwinTooltip: React.FC<TwinTooltipProps> = ({ data, containerRef }) => {
  const tipRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef({ x: 0, y: 0 })
  const [visiblePos, setVisiblePos] = useState({ left: 0, top: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = containerRef?.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return
      }
      cursorRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [containerRef])

  useEffect(() => {
    if (!data) return

    let raf = 0
    const tick = () => {
      const containerW = containerRef?.current?.clientWidth || 900
      const containerH = containerRef?.current?.clientHeight || 600

      let posX = cursorRef.current.x
      let posY = cursorRef.current.y

      if ((posX === 0 && posY === 0) && data.screenX !== undefined && data.screenY !== undefined) {
        if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect()
          posX = data.screenX - rect.left
          posY = data.screenY - rect.top
        }
      }

      const tooltipWidth = 240
      const tooltipHeight = data.alert ? 150 : 120

      let left = posX + 14
      let top = posY - tooltipHeight - 10
      if (left + tooltipWidth > containerW - 12) left = posX - tooltipWidth - 14
      if (left < 12) left = 12
      if (top < 12) top = posY + 18
      if (top + tooltipHeight > containerH - 12) top = containerH - tooltipHeight - 12

      setVisiblePos((prev) =>
        Math.abs(prev.left - left) > 0.5 || Math.abs(prev.top - top) > 0.5
          ? { left, top }
          : prev
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [data, containerRef])

  if (!data) return null

  const getIcon = () => {
    switch (data.type) {
      case 'shelf':
        return <Box className="h-3.5 w-3.5 text-teal-600" />
      case 'checkout':
        return <ListOrdered className="h-3.5 w-3.5 text-slate-600" />
      case 'zone':
        return <Layers className="h-3.5 w-3.5 text-slate-600" />
      case 'staff':
        return <UserCheck className="h-3.5 w-3.5 text-teal-600" />
      case 'incident':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
      case 'camera':
        return <Camera className="h-3.5 w-3.5 text-slate-500" />
      default:
        return <Sparkles className="h-3.5 w-3.5 text-slate-500" />
    }
  }

  const statusClass =
    data.statusColor === 'rose'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : data.statusColor === 'amber'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : data.statusColor === 'emerald'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div
      ref={tipRef}
      className="pointer-events-none absolute z-40 font-sans"
      style={{ left: `${visiblePos.left}px`, top: `${visiblePos.top}px` }}
    >
      <div className="w-[236px] rounded-lg bg-white/98 backdrop-blur-md border border-slate-200 shadow-lg p-2 space-y-1.5 select-none text-slate-700 text-xs">
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 min-w-0">
            {getIcon()}
            <span className="font-semibold text-slate-900 text-[12px] truncate">{data.title}</span>
          </div>
          {data.status && (
            <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0', statusClass)}>
              {data.status}
            </span>
          )}
        </div>

        {data.subtitle && (
          <div className="text-[10px] text-slate-500 truncate">{data.subtitle}</div>
        )}

        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {data.metrics.slice(0, 4).map((m, idx) => (
            <div key={idx}>
              <span className="text-slate-500 block text-[9px]">{m.label}</span>
              <span className={cn('font-semibold', m.highlight ? 'text-rose-700' : 'text-slate-900')}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {data.alert && (
          <div className="text-[9.5px] bg-rose-50 px-1.5 py-1 rounded border border-rose-200 text-rose-700 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span className="truncate">{data.alert}</span>
          </div>
        )}

        <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-100">
          <span>Click to inspect</span>
          <span className="text-teal-700 font-medium flex items-center gap-0.5">
            Details <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
