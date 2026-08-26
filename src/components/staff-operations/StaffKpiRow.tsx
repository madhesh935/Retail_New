import React from 'react'
import {
  Users,
  UserCheck,
  CheckSquare,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { CANONICAL_STAFF, CANONICAL_TASKS } from './staffData'

export const StaffKpiRow: React.FC = () => {
  const onShiftCount = CANONICAL_STAFF.filter((s) => s.shiftStatus === 'ON_SHIFT').length // 12
  const availableCount = CANONICAL_STAFF.filter((s) => s.status === 'AVAILABLE').length // 3
  const activeTasksCount = CANONICAL_TASKS.filter((t) => t.status !== 'COMPLETED').length // 4 in progress + 2 to do/assigned = 6
  const criticalTasksCount = CANONICAL_TASKS.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length // 2
  const completedTodayCount = 18 // 18 verified / confirmed tasks today

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {/* 1. Staff on Shift */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Staff on Shift</span>
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{onShiftCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Shift B · 14:00–22:00</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          Full attendance
        </div>
      </div>

      {/* 2. Available Now */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Available Now</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{availableCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for assignment</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          S02, S03, S06
        </div>
      </div>

      {/* 3. Active Tasks */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Active Tasks</span>
          <span className="h-2 w-2 rounded-full bg-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{activeTasksCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">4 in progress · 2 waiting</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-blue-400 font-medium">
          All within SLA
        </div>
      </div>

      {/* 4. Critical Tasks */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/40 p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Critical Tasks</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{criticalTasksCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Counter C3 · Refill B4</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-rose-400 font-medium">
          Immediate attention
        </div>
      </div>

      {/* 5. Average Response */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Avg Response</span>
          <span className="h-2 w-2 rounded-full bg-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            3.1 <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target &lt;5.0 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          -0.4 min vs target
        </div>
      </div>

      {/* 6. Completed Today */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Completed Today</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">{completedTodayCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified / confirmed</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          100% resolution
        </div>
      </div>
    </div>
  )
}
