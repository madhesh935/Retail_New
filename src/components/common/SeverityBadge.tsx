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
  let badgeStyle = 'bg-slate-900 border-slate-700 text-slate-300'
  let label = severity.toUpperCase()

  switch (severity) {
    case 'critical':
      badgeStyle = 'bg-rose-950/80 border-rose-500/60 text-rose-300 font-bold'
      break
    case 'high':
      badgeStyle = 'bg-amber-950/70 border-amber-500/50 text-amber-300 font-semibold'
      break
    case 'medium':
      badgeStyle = 'bg-yellow-950/60 border-yellow-500/40 text-yellow-300'
      break
    case 'low':
      badgeStyle = 'bg-blue-950/60 border-blue-500/40 text-blue-300'
      break
    case 'info':
      badgeStyle = 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
      break
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-mono font-medium tracking-wider uppercase select-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        badgeStyle,
        className
      )}
    >
      {label}
    </span>
  )
}
