import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'API Synchronization Error',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50/40 p-6 text-center flex flex-col items-center justify-center font-sans select-none shadow-2xs',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-3 shadow-2xs">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed font-mono">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 gap-1.5 shadow-2xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  )
}
