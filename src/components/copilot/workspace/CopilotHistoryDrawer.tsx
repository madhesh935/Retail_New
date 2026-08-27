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

        {/* Search History Box */}
        <div className="my-3 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversation history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs font-sans"
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
                  'w-full p-2.5 rounded-xl text-left transition-all cursor-pointer group flex flex-col justify-between border shadow-2xs',
                  isSelected
                    ? 'bg-sky-50 border-sky-500 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-sky-700 truncate">
                    {ses.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ses.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    {ses.category}
                  </span>
                  <span className="text-slate-400 truncate max-w-[180px]">
                    {ses.prompt}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
          <span>{filteredSessions.length} conversations stored</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-500 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
