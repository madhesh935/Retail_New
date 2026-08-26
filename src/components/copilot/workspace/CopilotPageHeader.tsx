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
    <div className="space-y-2 pb-3 border-b border-[#1E293B] select-none">
      {/* Top Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Store AI Copilot</span>
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              Live Operations Assistant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
            className="h-7 text-xs px-2.5 gap-1.5 text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span>History</span>
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={onGenerateBrief}
            className="h-7 text-xs px-3 gap-1.5 shadow-sm"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Store Brief</span>
          </Button>
        </div>
      </div>

      {/* Sub-header Single Compact Connection Status Row */}
      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 pt-0.5">
        <span className="flex items-center gap-1.5 font-medium text-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Store Data</span>
        </span>
        <span>•</span>
        <span>Edge Node Online</span>
        <span>•</span>
        <span>6/6 Cameras Online</span>
        <span>•</span>
        <span className="text-slate-500">Updated 2 sec ago</span>
      </div>
    </div>
  )
}
