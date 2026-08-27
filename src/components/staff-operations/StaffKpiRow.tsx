import React from 'react'
import {
  Users,
  UserCheck,
  CheckSquare,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { StaffMember, OperationalTask } from './staffData'

interface StaffKpiRowProps {
  staff: StaffMember[]
  tasks: OperationalTask[]
}

export const StaffKpiRow: React.FC<StaffKpiRowProps> = ({ staff, tasks }) => {
  const onShiftCount = staff.filter((s) => s.shiftStatus === 'ON_SHIFT').length
  const availableCount = staff.filter((s) => s.status === 'AVAILABLE').length
  const activeTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length
  const criticalTasksCount = tasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length
  const completedTodayCount = staff.reduce((acc, s) => acc + (s.tasksCompletedToday || 0), 0)
  const availableNames = staff.filter((s) => s.status === 'AVAILABLE').slice(0, 3).map((s) => s.code).join(', ') || '—'
  const criticalLabels =
    tasks
      .filter((t) => t.priority === 'CRITICAL' && t.status !== 'COMPLETED')
      .slice(0, 2)
      .map((t) => t.title)
      .join(' · ') || 'None'
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const waiting = tasks.filter((t) => t.status === 'TO_DO' || t.status === 'ASSIGNED').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-sans">
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Staff on Shift</span>
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{onShiftCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Live roster</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          From store DB
        </div>
      </div>

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
          {availableNames}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Active Tasks</span>
          <span className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{activeTasksCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {inProgress} in progress · {waiting} waiting
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-blue-700 font-semibold">
          Live task queue
        </div>
      </div>

      <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Critical Tasks</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">{criticalTasksCount}</div>
          <div className="text-[11px] text-slate-600 mt-0.5 font-mono font-semibold">{criticalLabels}</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-rose-100 text-[11px] text-rose-700 font-semibold">
          Immediate attention
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Completed Today</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{completedTodayCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Staff-reported completions</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 font-semibold flex items-center gap-1">
          <Clock className="h-3 w-3" /> Shift progress
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Coverage</span>
          <UserCheck className="h-3.5 w-3.5 text-sky-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {staff.length ? Math.round((availableCount / Math.max(onShiftCount, 1)) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Available / on shift</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-sky-700 font-semibold flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" /> Live capacity
        </div>
      </div>
    </div>
  )
}
