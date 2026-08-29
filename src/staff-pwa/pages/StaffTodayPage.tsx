import React from 'react'
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { StaffTask } from '@/types'

interface StaffTodayPageProps {
  onOpenTaskDetails: (task: StaffTask) => void
  onNavigateTab: (tab: 'today' | 'assist' | 'scan' | 'work' | 'more') => void
  onOpenHandover: () => void
}

export const StaffTodayPage: React.FC<StaffTodayPageProps> = ({
  onOpenTaskDetails,
  onNavigateTab,
  onOpenHandover,
}) => {
  const { authenticatedStaff, attendanceState, pendingTasks, storeAnnouncements, handoverItems } = useAppStore()

  const staffName = authenticatedStaff?.name || 'Loading…'
  const staffRole = authenticatedStaff?.role || '—'
  const shiftName = authenticatedStaff?.shift || '—'
  const zoneName = authenticatedStaff?.zoneName || '—'

  // Find top priority active/assigned task
  const topTask =
    pendingTasks.find((t) => t.status === 'IN_PROGRESS') ||
    pendingTasks.find((t) => t.priority === 'CRITICAL' && t.status === 'ASSIGNED') ||
    pendingTasks.find((t) => t.priority === 'HIGH' && t.status === 'ASSIGNED') ||
    pendingTasks.find((t) => t.status === 'ASSIGNED')

  // Personal shift count
  const completedCount = pendingTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'VERIFIED').length
  const inProgressCount = pendingTasks.filter((t) => t.status === 'IN_PROGRESS').length
  const waitingCount = pendingTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'BLOCKED').length

  // Top store announcement
  const topAnnouncement = storeAnnouncements.find((a) => !a.acknowledged) || storeAnnouncements[0]

  return (
    <div className="space-y-3.5 p-4 pb-28">
      {/* 1. Worker Shift Header Card */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Assignment</div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Good afternoon, {staffName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-1">
              <span className="font-bold text-slate-900">{zoneName}</span>
              <span>•</span>
              <span className="font-mono text-slate-500">
                {shiftName} · {attendanceState.shiftStart || '—'}–{attendanceState.shiftEnd || '—'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-xs flex items-center justify-center shadow-xs">
            {staffName.charAt(0)}
          </div>
        </div>

        {/* Check-in status badge */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Present • Checked In {attendanceState.checkInAt || '—'}</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md font-mono">
            {authenticatedStaff?.employeeId || '—'}
          </span>
        </div>
      </div>

      {/* 2. WHAT NEEDS YOUR ATTENTION */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>What Needs Your Attention</span>
          </span>
        </div>

        {topTask ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-4.5 space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    topTask.priority === 'CRITICAL' || topTask.priority === 'URGENT'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                      : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                  }`}
                >
                  {topTask.priority} Priority
                </span>
                <span className="text-[11px] font-medium text-slate-400 font-mono">ETA {topTask.etaMinutes}m</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{topTask.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{topTask.zoneName}</span>
                {topTask.shelfCode && (
                  <span className="font-bold text-slate-900 font-mono">({topTask.shelfCode})</span>
                )}
              </div>
            </div>

            {/* Metrics */}
            {(topTask.shelfAvailabilityPercent !== undefined || topTask.backroomUnits !== undefined) && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Shelf Stock</span>
                  <span className="text-sm font-bold text-rose-600 font-mono mt-0.5 block">
                    {topTask.shelfAvailabilityPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Backroom</span>
                  <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">
                    {topTask.backroomUnits} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Empty In</span>
                  <span className="text-sm font-bold text-amber-700 font-mono mt-0.5 block">
                    {typeof topTask.expectedDepletionMinutes === 'number' ? `~${topTask.expectedDepletionMinutes}m` : '—'}
                  </span>
                </div>
              </div>
            )}

            {/* Action CTA */}
            <button
              type="button"
              onClick={() => onOpenTaskDetails(topTask)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{topTask.status === 'IN_PROGRESS' ? 'Resume Task' : 'View Work Details'}</span>
              <ArrowRight className="w-4 h-4 text-white/90" />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">You're Available</h3>
              <p className="text-xs text-slate-500 mt-0.5">No immediate work assigned. Check store queue.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('work')}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20"
            >
              View Store Work
            </button>
          </div>
        )}
      </div>

      {/* 3. PERSONAL SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Progress</div>
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
          <div>
            <span className="text-lg font-bold text-emerald-600 font-mono">{completedCount}</span>
            <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Completed</span>
          </div>
          <div>
            <span className="text-lg font-bold text-blue-600 font-mono">{inProgressCount}</span>
            <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">In Progress</span>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-700 font-mono">{waitingCount}</span>
            <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Waiting</span>
          </div>
        </div>
      </div>

      {/* 4. IMPORTANT STORE UPDATE */}
      {topAnnouncement && (
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>Store Notice</span>
            </span>
            <span className="text-[10px] text-amber-700 font-mono">{topAnnouncement.timestamp}</span>
          </div>
          <h4 className="text-xs font-bold text-amber-950 leading-snug">{topAnnouncement.title}</h4>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">{topAnnouncement.content}</p>
        </div>
      )}

      {/* 5. SHIFT HANDOVER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">Shift Handover</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 font-mono">
            {handoverItems.length} items from Shift A
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-700">
          {handoverItems.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-start gap-2 py-1 border-b border-slate-50 last:border-none">
              <span className="text-slate-400 font-bold">•</span>
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenHandover}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors"
        >
          <span>Review All Handover Items</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
