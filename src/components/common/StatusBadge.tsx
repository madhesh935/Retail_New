import React from 'react'
import { cn } from '@/lib/utils'

export type OperationalStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'CONGESTED'
  | 'STANDBY'
  | 'CLOSED'
  | 'HEALTHY'
  | 'WARNING'
  | 'CRITICAL'
  | 'SYNCED'
  | 'CONNECTING'

interface StatusBadgeProps {
  status: OperationalStatus | string
  label?: string
  pulse?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse = true,
  className,
  size = 'sm',
}) => {
  const normStatus = (status || '').toUpperCase()

  let dotColor = 'bg-slate-400'
  let badgeClasses = 'bg-slate-900/80 border-slate-700 text-slate-300'
  let displayLabel = label || status

  switch (normStatus) {
    case 'ONLINE':
    case 'ACTIVE':
    case 'HEALTHY':
    case 'SYNCED':
      dotColor = 'bg-emerald-400'
      badgeClasses = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
      break
    case 'DEGRADED':
    case 'WARNING':
    case 'CONGESTED':
    case 'STANDBY':
      dotColor = 'bg-amber-400'
      badgeClasses = 'bg-amber-950/60 border-amber-500/40 text-amber-300'
      break
    case 'CRITICAL':
    case 'OFFLINE':
      dotColor = 'bg-rose-500'
      badgeClasses = 'bg-rose-950/60 border-rose-500/40 text-rose-300'
      break
    case 'CONNECTING':
      dotColor = 'bg-cyan-400'
      badgeClasses = 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
      break
    case 'CLOSED':
    default:
      dotColor = 'bg-slate-500'
      badgeClasses = 'bg-slate-900 border-slate-700 text-slate-400'
      break
  }

  const isPositive = ['ONLINE', 'ACTIVE', 'HEALTHY', 'SYNCED'].includes(normStatus)
  const isAlert = ['CRITICAL', 'WARNING', 'CONGESTED'].includes(normStatus)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-mono font-medium uppercase select-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px] tracking-wider' : 'px-2.5 py-1 text-xs tracking-wider',
        badgeClasses,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (isPositive || isAlert) && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping-slow',
              dotColor
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
      </span>
      <span>{displayLabel}</span>
    </span>
  )
}
