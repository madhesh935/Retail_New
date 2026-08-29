import React from 'react'
import {
  X,
  Plus,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface RecentSessionItem {
  id: string
  title: string
  timestamp: string
  category: 'Brief' | 'Queue' | 'Inventory' | 'Opportunity' | 'Report' | 'Staff' | 'Incident'
  prompt: string
}

interface CopilotHistoryDrawerProps {
  isOpen: boolean
  activeSessionId: string | null
  onClose: () => void
  onSelectSession: (session: RecentSessionItem) => void
  onNewAnalysis: () => void
}

export const CopilotHistoryDrawer: React.FC<CopilotHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onNewAnalysis,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-start select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm h-full bg-white border-r border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-left duration-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Recent Conversations
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                onNewAnalysis()
                onClose()
              }}
              className="h-6 px-2 text-[10px] text-slate-700 border-slate-200 bg-white hover:bg-slate-50 gap-1 shadow-2xs font-semibold"
            >
              <Plus className="h-3 w-3 text-sky-600" />
              <span>New</span>
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-1.5 py-8">
            <div className="p-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">No recent sessions yet</span>
            <span className="text-[11px] text-slate-400 max-w-[220px]">
              Conversation history isn&apos;t stored between sessions yet.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
          <span>0 conversations stored</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-500 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
