import React from 'react'
import { Calendar, HandHelping, ClipboardList, MoreHorizontal } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export type StaffNavTab = 'today' | 'assist' | 'work' | 'more'

interface StaffBottomNavProps {
  activeTab: StaffNavTab
  onSelectTab: (tab: StaffNavTab) => void
}

export const StaffBottomNav: React.FC<StaffBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { customerRequests, pendingTasks } = useAppStore()

  const pendingAssistCount = customerRequests.filter((r) => r.status === 'REQUESTED').length
  const activeWorkCount = pendingTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 pb-safe pt-1.5 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-4 items-center h-14 gap-1">
        {/* 1. TODAY */}
        <button
          type="button"
          onClick={() => onSelectTab('today')}
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'text-blue-600 bg-blue-50/70 font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] tracking-tight">Today</span>
        </button>

        {/* 2. ASSIST */}
        <button
          type="button"
          onClick={() => onSelectTab('assist')}
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'assist'
              ? 'text-blue-600 bg-blue-50/70 font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <div className="relative">
            <HandHelping className={`w-5 h-5 ${activeTab === 'assist' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {pendingAssistCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                {pendingAssistCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Assist</span>
        </button>

        {/* 3. WORK */}
        <button
          type="button"
          onClick={() => onSelectTab('work')}
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all cursor-pointer relative ${
            activeTab === 'work'
              ? 'text-blue-600 bg-blue-50/70 font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <div className="relative">
            <ClipboardList className={`w-5 h-5 ${activeTab === 'work' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {activeWorkCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center">
                {activeWorkCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Work</span>
        </button>

        {/* 4. MORE */}
        <button
          type="button"
          onClick={() => onSelectTab('more')}
          className={`flex flex-col items-center justify-center gap-1 h-full rounded-2xl transition-all cursor-pointer ${
            activeTab === 'more'
              ? 'text-blue-600 bg-blue-50/70 font-bold'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${activeTab === 'more' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[11px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  )
}
