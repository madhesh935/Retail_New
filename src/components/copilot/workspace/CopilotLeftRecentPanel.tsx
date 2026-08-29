import React from 'react'
import {
  Plus,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface RecentSessionItem {
  id: string
  title: string
  timestamp: string
  category: 'BRIEF' | 'QUEUE' | 'INVENTORY' | 'RISK' | 'REPORT' | 'STAFF' | 'INCIDENT'
  prompt: string
}

interface CopilotLeftRecentPanelProps {
  activeSessionId: string | null
  onSelectSession: (session: RecentSessionItem) => void
  onNewAnalysis: () => void
}

export const CopilotLeftRecentPanel: React.FC<CopilotLeftRecentPanelProps> = ({
  onNewAnalysis,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col h-full select-none font-sans text-xs shadow-2xs">
      {/* Header with + New Analysis button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Recent Activity
        </span>

        <Button
          variant="outline"
          size="xs"
          onClick={onNewAnalysis}
          className="text-[10px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 gap-1 shadow-2xs font-semibold"
        >
          <Plus className="h-3 w-3 text-sky-600" />
          <span>New</span>
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 py-6">
          <div className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-600">No recent sessions yet</span>
          <span className="text-[10px] text-slate-400 max-w-[180px]">
            Conversation history isn&apos;t stored between sessions yet.
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[9px] text-slate-500 flex items-center justify-between mt-2 font-sans">
        <span>Session history not yet persisted</span>
      </div>
    </div>
  )
}
