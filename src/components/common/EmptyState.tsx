import React from 'react'
import { LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center font-sans select-none',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 mb-3 shadow-2xs">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
