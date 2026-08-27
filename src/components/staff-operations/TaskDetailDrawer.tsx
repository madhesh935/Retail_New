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
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-xs">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {task.title}
              </h3>
              <span className="text-[11px] text-slate-500">
                Task #{task.id?.toUpperCase()} · {task.zone}
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
          {/* 1. Operational Problem & Details */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Task Description
              </span>
              <span className="text-[10px] text-sky-700 font-mono font-semibold">
                Created {task.createdTime || '18:40'}
              </span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed font-sans">
              {task.description}
            </p>
            <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60">
              <span>Source: <strong className="text-slate-800">{task.source || 'Store Floor Alert'}</strong></span>
              <span>Priority: <strong className="text-rose-700">{task.priority}</strong></span>
            </div>
          </div>

          {/* 2. Staff Assignment & Location */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Staff Assignment
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Assigned Staff</span>
                <span className="font-bold text-slate-900 text-xs">
                  {task.assignedStaffName || 'Unassigned'} {task.assignedStaffId && `(${task.assignedStaffId})`}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Expected Resolution</span>
                <span className="font-bold text-sky-700 text-xs">{task.eta}</span>
              </div>
            </div>

            {/* Transit Route */}
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1 shadow-2xs">
              <span className="text-slate-500 font-medium block text-[10px]">Transit Route:</span>
              <div className="text-slate-700 flex items-center gap-1.5 font-sans">
                <MapPin className="h-3 w-3 text-sky-600 shrink-0" />
                <span>Assigned Zone</span>
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="text-sky-700 font-bold">{task.zone}</span>
              </div>
            </div>
          </div>

          {/* 3. Verification Card (if completed or has before/after data) */}
          {isCompleted && (
            <div className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>
                    {isCameraVerified ? 'Camera Vision Observation' : 'Staff Completion Confirmed'}
                  </span>
                </div>
                {isCameraVerified && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold font-mono">
                    {camCode}
                  </span>
                )}
              </div>

              {isCameraVerified && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white border border-rose-200 shadow-2xs">
                    <span className="text-[10px] text-rose-700 font-semibold block">Before Action</span>
                    <div className="text-lg font-bold text-rose-700 font-mono">{beforeVal}%</div>
                    <span className="text-[10px] text-slate-500">Low shelf stock</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                    <span className="text-[10px] text-emerald-700 font-semibold block">After Action</span>
                    <div className="text-lg font-bold text-emerald-700 font-mono">{afterVal}%</div>
                    <span className="text-[10px] text-emerald-600">Inventory replenished</span>
                  </div>
                </div>
              )}

              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Task Successfully Resolved</span>
                </span>
                <span className="text-emerald-700 font-bold text-[11px] uppercase">
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
              className="w-full justify-between h-8 text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs font-sans"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-sky-600" />
                <span>Show Task on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Task #{task.id}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px] text-slate-500 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
