import React from 'react'
import { Calendar, HandHelping, ScanBarcode, ClipboardList, MoreHorizontal } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export type StaffNavTab = 'today' | 'assist' | 'scan' | 'work' | 'more'

interface StaffBottomNavProps {
  activeTab: StaffNavTab
  onSelectTab: (tab: StaffNavTab) => void
}

export const StaffBottomNav: React.FC<StaffBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { customerRequests, pendingTasks, authenticatedStaff } = useAppStore()

  const pendingAssistCount = customerRequests.filter((r) => r.status === 'REQUESTED').length
  // Scope to the logged-in staff member's own work (mirrors StaffWorkPage's
  // `myTasks` filter) — this used to count every staff member's active tasks
  // store-wide, which made the badge show a number far larger than what the
  // signed-in staff member actually had to do.
  const myActiveTasks = pendingTasks.filter((t) => {
    if (t.category === 'CUSTOMER_ASSISTANCE') return false
    if (!authenticatedStaff?.id) return true
    return !t.assignedStaffId || t.assignedStaffId === authenticatedStaff.id
  })
  const activeWorkCount = myActiveTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between h-14">
        {/* 1. TODAY */}
        <button
          type="button"
          onClick={() => onSelectTab('today')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-all ${
            activeTab === 'today' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight uppercase font-bold">Today</span>
        </button>

        {/* 2. ASSIST */}
        <button
          type="button"
          onClick={() => onSelectTab('assist')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-all relative ${
            activeTab === 'assist' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <HandHelping className={`w-5 h-5 ${activeTab === 'assist' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {pendingAssistCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center">
                {pendingAssistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight uppercase font-bold">Assist</span>
        </button>

        {/* 3. SCAN (Centerpiece - Bright Blue) */}
        <div className="flex-1 flex items-center justify-center -mt-5">
          <button
            type="button"
            onClick={() => onSelectTab('scan')}
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 bg-blue-600 text-white ring-4 ring-white shadow-blue-500/30 hover:bg-blue-700 ${
              activeTab === 'scan' ? 'ring-blue-100 ring-offset-2 ring-offset-white' : ''
            }`}
            aria-label="Scan Product or Shelf"
          >
            <ScanBarcode className="w-5.5 h-5.5 stroke-[2.25]" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Scan</span>
          </button>
        </div>

        {/* 4. WORK */}
        <button
          type="button"
          onClick={() => onSelectTab('work')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-all relative ${
            activeTab === 'work' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
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
          <span className="text-[10px] tracking-tight uppercase font-bold">Work</span>
        </button>

        {/* 5. MORE */}
        <button
          type="button"
          onClick={() => onSelectTab('more')}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full rounded-xl transition-all ${
            activeTab === 'more' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${activeTab === 'more' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight uppercase font-bold">More</span>
        </button>
      </div>
    </nav>
  )
}
