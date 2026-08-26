import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AccentColor = 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'slate'

export interface KpiCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  target?: {
    current: number
    max: number
    label?: string
  }
  icon?: LucideIcon
  accent?: AccentColor
  statusBadge?: React.ReactNode
  isLive?: boolean
  className?: string
  onClick?: () => void
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  trend,
  target,
  icon: Icon,
  accent = 'slate',
  statusBadge,
  isLive = false,
  className,
  onClick,
}) => {
  const accentBorderMap: Record<AccentColor, string> = {
    cyan: 'border-cyan-500/40 hover:border-cyan-500/70',
    emerald: 'border-emerald-500/40 hover:border-emerald-500/70',
    amber: 'border-amber-500/40 hover:border-amber-500/70',
    rose: 'border-rose-500/40 hover:border-rose-500/70',
    blue: 'border-blue-500/40 hover:border-blue-500/70',
    slate: 'border-[#1E293B] hover:border-slate-600',
  }

  const accentIconBgMap: Record<AccentColor, string> = {
    cyan: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30',
    emerald: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-950/80 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-950/80 text-rose-400 border border-rose-500/30',
    blue: 'bg-blue-950/80 text-blue-400 border border-blue-500/30',
    slate: 'bg-slate-900 text-slate-400 border border-slate-800',
  }

  const percentage = target ? Math.min(100, Math.max(0, (target.current / target.max) * 100)) : null

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-lg bg-[#0F172A] border p-3.5 shadow-sm transition-all duration-150',
        accentBorderMap[accent],
        onClick ? 'cursor-pointer active:scale-[0.99]' : '',
        className
      )}
    >
      {/* Top row: Title + Icon / Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {statusBadge}
          {isLive && !statusBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE
            </span>
          )}
          {Icon && (
            <div className={cn('p-1 rounded-md', accentIconBgMap[accent])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Main Value Display */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-2xl font-bold font-mono-numbers tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      {/* Optional Target Progress Bar */}
      {target && percentage !== null && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{target.label || 'Capacity'}</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={cn(
                'h-full transition-all duration-500',
                percentage > 85
                  ? 'bg-rose-500'
                  : percentage > 70
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Subtitle / Trend Row */}
      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 font-mono text-[10px] font-medium shrink-0 ml-auto',
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              )}
            >
              {trend.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trend.direction === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-slate-500 ml-0.5">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
