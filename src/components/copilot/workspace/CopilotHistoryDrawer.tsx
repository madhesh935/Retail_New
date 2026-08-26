import React, { useState } from 'react'
import {
  X,
  Plus,
  Clock,
  FileText,
  ListOrdered,
  PackageCheck,
  TrendingDown,
  Calendar,
  UserCheck,
  ShieldAlert,
  MessageSquare,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RecentSessionItem {
  id: string
  title: string
  timestamp: string
  category: 'Brief' | 'Queue' | 'Inventory' | 'Opportunity' | 'Report' | 'Staff' | 'Incident'
  prompt: string
}

export const RECENT_SESSIONS: RecentSessionItem[] = [
  {
    id: 'ses-1',
    title: 'Morning Operations Brief',
    timestamp: '08:15 AM',
    category: 'Brief',
    prompt: "Summarize today's store performance and morning operations.",
  },
  {
    id: 'ses-2',
    title: 'Queue Congestion Analysis',
    timestamp: '11:42 AM',
    category: 'Queue',
    prompt: 'Which checkout will become congested and why should Counter C3 open?',
  },
  {
    id: 'ses-3',
    title: 'Shelf Replenishment Priorities',
    timestamp: '01:20 PM',
    category: 'Inventory',
    prompt: 'Which shelves should I refill first?',
  },
  {
    id: 'ses-4',
    title: 'Opportunity Risk Analysis',
    timestamp: '03:10 PM',
    category: 'Opportunity',
    prompt: 'Which zone has high shopper interest but low shelf availability?',
  },
  {
    id: 'ses-5',
    title: 'Yesterday vs Today',
    timestamp: '04:30 PM',
    category: 'Report',
    prompt: 'Compare today with yesterday.',
  },
  {
    id: 'ses-6',
    title: 'Staff Allocation Review',
    timestamp: '05:45 PM',
    category: 'Staff',
    prompt: 'Where should available staff be deployed?',
  },
  {
    id: 'ses-7',
    title: 'Critical Incident Summary',
    timestamp: '06:12 PM',
    category: 'Incident',
    prompt: "What's critical right now?",
  },
]

interface CopilotHistoryDrawerProps {
  isOpen: boolean
  activeSessionId: string | null
  onClose: () => void
  onSelectSession: (session: RecentSessionItem) => void
  onNewAnalysis: () => void
}

export const CopilotHistoryDrawer: React.FC<CopilotHistoryDrawerProps> = ({
  isOpen,
  activeSessionId,
  onClose,
  onSelectSession,
  onNewAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredSessions = RECENT_SESSIONS.filter((ses) =>
    ses.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ses.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ses.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-start select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm h-full bg-[#0B0F17] border-r border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-white">
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
              className="h-6 px-2 text-[10px] text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/60 gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>New</span>
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search History Box */}
        <div className="my-3 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversation history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D14] border border-[#1E293B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* List of Sessions */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {filteredSessions.map((ses) => {
            const isSelected = ses.id === activeSessionId

            return (
              <button
                key={ses.id}
                onClick={() => {
                  onSelectSession(ses)
                  onClose()
                }}
                className={cn(
                  'w-full p-2.5 rounded-lg text-left transition-all cursor-pointer group flex flex-col justify-between border',
                  isSelected
                    ? 'bg-[#131D31] border-cyan-500/60 text-white shadow-sm'
                    : 'bg-[#090D14] border-transparent hover:border-[#1E293B] hover:bg-[#0F172A] text-slate-300'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-white group-hover:text-cyan-300 truncate">
                    {ses.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {ses.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-[#0F172A] text-slate-400 border border-[#1E293B]">
                    {ses.category}
                  </span>
                  <span className="text-slate-500 truncate max-w-[180px]">
                    {ses.prompt}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] text-[10px] text-slate-500 flex justify-between">
          <span>{filteredSessions.length} conversations stored</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
