import React from 'react'
import { IncidentSeverity } from '@/types'
import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: IncidentSeverity
  className?: string
  size?: 'sm' | 'md'
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className,
  size = 'sm',
}) => {
  let badgeStyle = 'bg-slate-100 border-slate-200 text-slate-700 font-semibold'
  let label = severity.toUpperCase()

  switch (severity) {
    case 'critical':
      badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
      break
    case 'high':
      badgeStyle = 'bg-amber-50 border-amber-200 text-amber-800 font-bold'
      break
    case 'medium':
      badgeStyle = 'bg-amber-50/60 border-amber-200 text-amber-700 font-semibold'
      break
    case 'low':
      badgeStyle = 'bg-sky-50 border-sky-200 text-sky-700 font-semibold'
      break
    case 'info':
      badgeStyle = 'bg-sky-50 border-sky-200 text-sky-700 font-semibold'
      break
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-mono tracking-wider uppercase select-none shadow-2xs',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        badgeStyle,
        className
      )}
    >
      {label}
    </span>
  )
}
