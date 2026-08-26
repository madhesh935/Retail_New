import React from 'react'
import {
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RecentSessionItem {
  id: string
  title: string
  timestamp: string
  category: 'BRIEF' | 'QUEUE' | 'INVENTORY' | 'RISK' | 'REPORT' | 'STAFF' | 'INCIDENT'
  prompt: string
}

export const RECENT_SESSIONS: RecentSessionItem[] = [
  {
    id: 'ses-1',
    title: 'Morning Operations Brief',
    timestamp: '08:15 AM',
    category: 'BRIEF',
    prompt: 'Summarize today\'s store performance and morning operations.',
  },
  {
    id: 'ses-2',
    title: 'Queue Congestion Analysis',
    timestamp: '11:42 AM',
    category: 'QUEUE',
    prompt: 'Which checkout will become congested and why should Counter C3 open?',
  },
  {
    id: 'ses-3',
    title: 'Shelf Replenishment Priorities',
    timestamp: '01:20 PM',
    category: 'INVENTORY',
    prompt: 'Which shelves should I refill first?',
  },
  {
    id: 'ses-4',
    title: 'Lost-Sale Risk Analysis',
    timestamp: '03:10 PM',
    category: 'RISK',
    prompt: 'Why are we losing beverage sales opportunities?',
  },
  {
    id: 'ses-5',
    title: 'Yesterday vs Today',
    timestamp: '04:30 PM',
    category: 'REPORT',
    prompt: 'Compare today with yesterday.',
  },
  {
    id: 'ses-6',
    title: 'Staff Allocation Review',
    timestamp: '05:45 PM',
    category: 'STAFF',
    prompt: 'Where should I deploy available staff?',
  },
  {
    id: 'ses-7',
    title: 'Critical Incident Summary',
    timestamp: '06:12 PM',
    category: 'INCIDENT',
    prompt: 'What\'s critical right now?',
  },
]

const categoryIcons = {
  BRIEF: FileText,
  QUEUE: ListOrdered,
  INVENTORY: PackageCheck,
  RISK: TrendingDown,
  REPORT: Calendar,
  STAFF: UserCheck,
  INCIDENT: ShieldAlert,
}

interface CopilotLeftRecentPanelProps {
  activeSessionId: string | null
  onSelectSession: (session: RecentSessionItem) => void
  onNewAnalysis: () => void
}

export const CopilotLeftRecentPanel: React.FC<CopilotLeftRecentPanelProps> = ({
  activeSessionId,
  onSelectSession,
  onNewAnalysis,
}) => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 flex flex-col h-full select-none font-mono text-xs shadow-sm">
      {/* Header with + New Analysis button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B] mb-2">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Recent Activity
        </span>

        <Button
          variant="outline"
          size="xs"
          onClick={onNewAnalysis}
          className="text-[10px] h-6 px-2 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/60 gap-1"
        >
          <Plus className="h-3 w-3" />
          <span>New</span>
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {RECENT_SESSIONS.map((ses) => {
          const Icon = categoryIcons[ses.category] || MessageSquare
          const isSelected = ses.id === activeSessionId

          return (
            <button
              key={ses.id}
              onClick={() => onSelectSession(ses)}
              className={cn(
                'w-full p-2 rounded-lg text-left transition-all cursor-pointer group flex items-start gap-2 border',
                isSelected
                  ? 'bg-[#131D31] border-cyan-500/60 text-white shadow-sm'
                  : 'bg-[#090D14] border-transparent hover:border-[#1E293B] hover:bg-[#0F172A] text-slate-300'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded shrink-0 mt-0.5',
                  isSelected
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                    : 'bg-[#0F172A] text-slate-400 border border-[#1E293B]'
                )}
              >
                <Icon className="h-3 w-3" />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'text-[11px] font-sans font-semibold truncate',
                    isSelected ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                  )}
                >
                  {ses.title}
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                  <span className="uppercase">{ses.category}</span>
                  <span>{ses.timestamp}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] text-[9px] text-slate-500 flex items-center justify-between mt-2">
        <span>History Grounded</span>
        <span className="text-cyan-400">Zero Hallucinations</span>
      </div>
    </div>
  )
}
