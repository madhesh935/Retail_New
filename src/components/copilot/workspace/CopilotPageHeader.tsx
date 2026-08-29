import React from 'react'
import {
  Sparkles,
  FileText,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface CopilotPageHeaderProps {
  onGenerateBrief: () => void
  onToggleHistory: () => void
}

export const CopilotPageHeader: React.FC<CopilotPageHeaderProps> = ({
  onGenerateBrief,
  onToggleHistory,
}) => {
  const connectionState = useAppStore((s) => s.connectionState)
  const isConnected = connectionState === 'CONNECTED'

  return (
    <div className="space-y-2 pb-3 border-b border-slate-200 select-none font-sans">
      {/* Top Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span>Store AI Copilot</span>
            </h1>
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1.5',
                isConnected
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                {isConnected && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60 animate-ping" />
                )}
                <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', isConnected ? 'bg-sky-500' : 'bg-slate-400')} />
              </span>
              {isConnected ? 'Live Operations Assistant' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
            className="h-7 text-xs px-2.5 gap-1.5 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs font-semibold"
          >
            <History className="h-3.5 w-3.5 text-slate-500" />
            <span>History</span>
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={onGenerateBrief}
            className="h-7 text-xs px-3 gap-1.5 shadow-2xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Store Brief</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
