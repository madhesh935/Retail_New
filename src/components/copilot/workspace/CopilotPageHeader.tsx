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

interface CopilotPageHeaderProps {
  onGenerateBrief: () => void
  onToggleHistory: () => void
}

export const CopilotPageHeader: React.FC<CopilotPageHeaderProps> = ({
  onGenerateBrief,
  onToggleHistory,
}) => {
  const isDemoMode = useAppStore((s) => s.isDemoMode)
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
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              Live Operations Assistant
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

      {/* Sub-header Single Compact Connection Status Row */}
      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 pt-0.5">
        <span className="flex items-center gap-1.5 font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Store Data</span>
        </span>
        <span>•</span>
        <span>Edge Node Online</span>
        <span>•</span>
        <span>6/6 Cameras Online</span>
        <span>•</span>
        <span className="text-slate-400">Updated 2 sec ago</span>
      </div>
    </div>
  )
}
