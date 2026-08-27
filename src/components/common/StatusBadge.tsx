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
  let badgeClasses = 'bg-slate-50 border-slate-200 text-slate-700'
  let displayLabel = label || status

  switch (normStatus) {
    case 'ONLINE':
    case 'ACTIVE':
    case 'HEALTHY':
    case 'SYNCED':
      dotColor = 'bg-emerald-500'
      badgeClasses = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
      break
    case 'DEGRADED':
    case 'WARNING':
    case 'CONGESTED':
    case 'STANDBY':
      dotColor = 'bg-amber-500'
      badgeClasses = 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
      break
    case 'CRITICAL':
    case 'OFFLINE':
      dotColor = 'bg-rose-500'
      badgeClasses = 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
      break
    case 'CONNECTING':
      dotColor = 'bg-sky-500'
      badgeClasses = 'bg-sky-50 border-sky-200 text-sky-700 font-bold'
      break
    case 'CLOSED':
    default:
      dotColor = 'bg-slate-400'
      badgeClasses = 'bg-slate-100 border-slate-200 text-slate-600'
      break
  }

  const isPositive = ['ONLINE', 'ACTIVE', 'HEALTHY', 'SYNCED'].includes(normStatus)
  const isAlert = ['CRITICAL', 'WARNING', 'CONGESTED'].includes(normStatus)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-mono uppercase select-none shadow-2xs',
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
