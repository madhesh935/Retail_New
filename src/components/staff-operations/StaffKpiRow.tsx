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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-sans">
      {/* 1. Staff on Shift */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Staff on Shift</span>
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{onShiftCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Shift B · 14:00–22:00</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          Full attendance
        </div>
      </div>

      {/* 2. Available Now */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Available Now</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">{availableCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for assignment</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          S02, S03, S06
        </div>
      </div>

      {/* 3. Active Tasks */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Active Tasks</span>
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{activeTasksCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">4 in progress · 2 waiting</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-blue-700 font-semibold">
          All within SLA
        </div>
      </div>

      {/* 4. Critical Tasks */}
      <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Critical Tasks</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">{criticalTasksCount}</div>
          <div className="text-[11px] text-slate-600 mt-0.5 font-mono font-semibold">Counter C3 · Refill B4</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-rose-100 text-[11px] text-rose-700 font-semibold">
          Immediate attention
        </div>
      </div>

      {/* 5. Average Response */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Avg Response</span>
          <span className="h-2 w-2 rounded-full bg-purple-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            3.1 <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target &lt;5.0 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          -0.4 min vs target
        </div>
      </div>

      {/* 6. Completed Today */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Completed Today</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{completedTodayCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified / confirmed</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          100% resolution
        </div>
      </div>
    </div>
  )
}
