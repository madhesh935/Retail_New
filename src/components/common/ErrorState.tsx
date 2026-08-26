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
        'rounded-lg border border-rose-500/40 bg-rose-950/20 p-6 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed font-mono">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-500/40 text-rose-200 hover:bg-rose-900/60 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  )
}
