import React from 'react'
import {
  X,
  UserCheck,
  CheckSquare,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffMember } from './staffData'

interface StaffDetailDrawerProps {
  staff: StaffMember | null
  onClose: () => void
  onAssignTask?: (staff: StaffMember) => void
}

export const StaffDetailDrawer: React.FC<StaffDetailDrawerProps> = ({
  staff,
  onClose,
  onAssignTask,
}) => {
  if (!staff) return null

  const isAvailable = staff.status === 'AVAILABLE'

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              {staff.code}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                {staff.name}
              </h3>
              <span className="text-[11px] text-slate-400">
                {staff.role} · {staff.department}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Status & Zone Overview Card */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium uppercase">
                Current Shift Status
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase border ${
                  isAvailable
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                    : 'bg-[#1E293B] text-slate-300 border-slate-700'
                }`}
              >
                {staff.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Current Zone</span>
                <span className="text-xs font-semibold text-white">{staff.currentZone}</span>
              </div>
              <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Shift Window</span>
                <span className="text-xs font-semibold text-cyan-400">{staff.shiftHours}</span>
              </div>
            </div>
          </div>

          {/* Active Task */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-1.5">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">
              Active Task Assignment
            </span>
            <div className="font-medium text-white text-xs">
              {staff.currentTask}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-[#1E293B]">
              <span>Tasks Completed Today:</span>
              <strong className="text-white">{staff.tasksCompletedToday}</strong>
            </div>
          </div>

          {/* Operational Skill Profile */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <span className="text-[10px] text-slate-400 font-medium uppercase block">
              Operational Skill Capabilities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {staff.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#090D14] border border-[#1E293B] text-slate-200 text-[11px] font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Non-Invasive Note */}
          <div className="p-2.5 rounded-lg bg-[#090D14] border border-[#1E293B] text-[10px] text-slate-400 leading-relaxed">
            Staff location and availability are monitored strictly for operational task dispatch and safety during active shifts.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>{staff.code} · Shift B</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
