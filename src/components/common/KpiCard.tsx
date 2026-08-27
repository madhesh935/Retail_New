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
    cyan: 'border-sky-200 hover:border-sky-300',
    emerald: 'border-emerald-200 hover:border-emerald-300',
    amber: 'border-amber-200 hover:border-amber-300',
    rose: 'border-rose-200 hover:border-rose-300',
    blue: 'border-blue-200 hover:border-blue-300',
    slate: 'border-slate-200 hover:border-slate-300',
  }

  const accentIconBgMap: Record<AccentColor, string> = {
    cyan: 'bg-sky-50 text-sky-600 border border-sky-200',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200',
    slate: 'bg-slate-50 text-slate-600 border border-slate-200',
  }

  const percentage = target ? Math.min(100, Math.max(0, (target.current / target.max) * 100)) : null

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl bg-white border p-3.5 shadow-2xs transition-all duration-150 font-sans select-none',
        accentBorderMap[accent],
        onClick ? 'cursor-pointer active:scale-[0.99] hover:shadow-xs' : '',
        className
      )}
    >
      {/* Top row: Title + Icon / Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {statusBadge}
          {isLive && !statusBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 animate-pulse" />
              LIVE
            </span>
          )}
          {Icon && (
            <div className={cn('p-1.5 rounded-md shadow-2xs', accentIconBgMap[accent])}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>

      {/* Main Value Display */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-2xl font-bold font-mono-numbers tracking-tight text-slate-900">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {unit}
          </span>
        )}
      </div>

      {/* Optional Target Progress Bar */}
      {target && percentage !== null && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>{target.label || 'Capacity'}</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={cn(
                'h-full transition-all duration-500',
                percentage > 85
                  ? 'bg-rose-500'
                  : percentage > 70
                  ? 'bg-amber-500'
                  : 'bg-sky-600'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Subtitle / Trend Row */}
      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 font-mono text-[10px] font-bold shrink-0 ml-auto',
                trend.direction === 'up'
                  ? 'text-emerald-700'
                  : trend.direction === 'down'
                  ? 'text-rose-700'
                  : 'text-slate-500'
              )}
            >
              {trend.direction === 'up' && <ArrowUpRight className="h-3 w-3" />}
              {trend.direction === 'down' && <ArrowDownRight className="h-3 w-3" />}
              {trend.direction === 'neutral' && <Minus className="h-3 w-3" />}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-slate-400 ml-0.5 font-normal">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
