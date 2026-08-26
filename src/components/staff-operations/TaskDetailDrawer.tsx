import React from 'react'
import {
  X,
  CheckSquare,
  Sparkles,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationalTask } from './staffData'
import { useNavigate } from 'react-router-dom'

interface TaskDetailDrawerProps {
  task: any | null
  onClose: () => void
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
}) => {
  const navigate = useNavigate()

  if (!task) return null

  const isCompleted = task.status === 'COMPLETED' || task.column === 'VERIFIED'
  const isCameraVerified = task.verificationType === 'CAMERA_VERIFIED' || task.cameraVerificationCode
  const beforeVal = task.beforeAvailability ?? 17
  const afterVal = task.afterAvailability ?? 85
  const camCode = task.cameraVerificationCode ?? 'CAM-04'

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#1E293B] flex items-center justify-center text-cyan-400 font-bold text-xs">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                {task.title}
              </h3>
              <span className="text-[11px] text-slate-400">
                Task #{task.id?.toUpperCase()} · {task.zone}
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
          {/* 1. Operational Problem & Details */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Task Description
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Created {task.createdTime || '18:40'}
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">
              {task.description}
            </p>
            <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-[#1E293B]">
              <span>Source: <strong className="text-slate-300">{task.source || 'Store Floor Alert'}</strong></span>
              <span>Priority: <strong className="text-rose-400">{task.priority}</strong></span>
            </div>
          </div>

          {/* 2. Staff Assignment & Location */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Staff Assignment
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Assigned Staff</span>
                <span className="font-semibold text-white text-xs">
                  {task.assignedStaffName || 'Unassigned'} {task.assignedStaffId && `(${task.assignedStaffId})`}
                </span>
              </div>
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Expected Resolution</span>
                <span className="font-semibold text-cyan-400 text-xs">{task.eta}</span>
              </div>
            </div>

            {/* Transit Route */}
            <div className="p-2 rounded bg-[#090D14] border border-[#1E293B] text-[11px] space-y-1">
              <span className="text-slate-400 font-medium block text-[10px]">Transit Route:</span>
              <div className="text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>Assigned Zone</span>
                <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                <span className="text-cyan-300 font-semibold">{task.zone}</span>
              </div>
            </div>
          </div>

          {/* 3. Verification Card (if completed or has before/after data) */}
          {isCompleted && (
            <div className="p-3 rounded-lg bg-[#0F172A] border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>
                    {isCameraVerified ? 'Camera Vision Observation' : 'Staff Completion Confirmed'}
                  </span>
                </div>
                {isCameraVerified && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    {camCode}
                  </span>
                )}
              </div>

              {isCameraVerified && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded bg-[#090D14] border border-rose-500/30">
                    <span className="text-[10px] text-rose-400 font-medium block">Before Action</span>
                    <div className="text-lg font-bold text-rose-400">{beforeVal}%</div>
                    <span className="text-[10px] text-slate-500">Low shelf stock</span>
                  </div>

                  <div className="p-2 rounded bg-[#090D14] border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-medium block">After Action</span>
                    <div className="text-lg font-bold text-emerald-400">{afterVal}%</div>
                    <span className="text-[10px] text-emerald-300">Inventory replenished</span>
                  </div>
                </div>
              )}

              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Task Successfully Resolved</span>
                </span>
                <span className="text-emerald-400 font-semibold text-[11px] uppercase">
                  Verified
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/digital-twin')
              }}
              className="w-full justify-between h-8 text-xs text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Show Task on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>Task #{task.id}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
