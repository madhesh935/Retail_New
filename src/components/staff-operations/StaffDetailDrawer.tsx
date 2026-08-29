import React from 'react'
import { X, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffMember } from './staffData'

interface StaffDetailDrawerProps {
  staff: StaffMember | null
  onClose: () => void
  onAssignTask?: (staff: StaffMember) => void
  canAssignTask?: boolean
}

export const StaffDetailDrawer: React.FC<StaffDetailDrawerProps> = ({
  staff,
  onClose,
  onAssignTask,
  canAssignTask,
}) => {
  if (!staff) return null

  const isAvailable = staff.status === 'AVAILABLE'

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-mono font-bold text-xs">
              {staff.code}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {staff.name}
              </h3>
              <span className="text-[11px] text-slate-500">
                {staff.role} · {staff.department}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Status & Zone Overview Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">
                Current Shift Status
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {staff.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Current Zone</span>
                <span className="text-xs font-bold text-slate-900">{staff.currentZone}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Shift Window</span>
                <span className="text-xs font-bold text-sky-700">{staff.shiftHours}</span>
              </div>
            </div>
          </div>

          {/* Active Task */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              Active Task Assignment
            </span>
            <div className="font-semibold text-slate-900 text-xs">
              {staff.currentTask}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
              <span>Tasks Completed Today:</span>
              <strong className="text-slate-900">{staff.tasksCompletedToday}</strong>
            </div>
          </div>

          {/* Operational Skill Profile */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              Operational Skill Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {staff.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-2xs"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Non-Invasive Note */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed shadow-2xs">
            Staff location and availability are monitored strictly for operational task dispatch and safety during active shifts.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{staff.code} · Shift B</span>
          <div className="flex items-center gap-2">
            {isAvailable && canAssignTask && onAssignTask && (
              <Button
                variant="action"
                size="xs"
                onClick={() => onAssignTask(staff)}
                className="h-7 text-[11px] bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-1"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Assign Task
              </Button>
            )}
            <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px] text-slate-500 hover:text-slate-900">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
