import React, { useState } from 'react'
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ShieldAlert,
  Users,
  CheckSquare,
  Square,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { StaffTask } from '@/types'
import { useAppStore } from '@/store/useAppStore'

interface TaskDetailSheetProps {
  task: StaffTask | null
  isOpen: boolean
  onClose: () => void
  onOpenMap: (task: StaffTask) => void
  onOpenBlocker: (task: StaffTask) => void
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  isOpen,
  onClose,
  onOpenMap,
  onOpenBlocker,
}) => {
  const { startStaffTask, toggleTaskSopStep, completeStaffTask, requestTaskAssistance } = useAppStore()
  const [assistanceSent, setAssistanceSent] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  if (!isOpen || !task) return null

  const isAssigned = task.status === 'ASSIGNED' || task.status === 'ACCEPTED' || task.status === 'PENDING'
  const isInProgress = task.status === 'IN_PROGRESS'
  const isBlocked = task.status === 'BLOCKED'
  const isCompleted = task.status === 'COMPLETED' || task.status === 'VERIFIED'

  const allSopDone = !task.sopSteps || task.sopSteps.every((s) => s.completed)

  const handleStart = () => {
    startStaffTask(task.id)
  }

  const handleComplete = () => {
    setIsCompleting(true)
    setTimeout(() => {
      completeStaffTask(task.id, 'STAFF_CONFIRMED')
      setIsCompleting(false)
      onClose()
    }, 600)
  }

  const handleRequestHelp = () => {
    requestTaskAssistance(task.id, 'Heavy pallet move assistance requested')
    setAssistanceSent(true)
    setTimeout(() => setAssistanceSent(false), 3000)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                task.priority === 'CRITICAL' || task.priority === 'URGENT'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                  : task.priority === 'HIGH'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                  : 'bg-blue-50 text-blue-700 border border-blue-200/80'
              }`}
            >
              {task.priority} Priority
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">#{task.id.slice(-6).toUpperCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Title & Location */}
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{task.zoneName}</span>
              {task.shelfCode && (
                <>
                  <span>•</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                    Shelf {task.shelfCode}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Operational Metrics Cards */}
          {(task.shelfAvailabilityPercent !== undefined || task.backroomUnits !== undefined) && (
            <div className="grid grid-cols-3 gap-2">
              {task.shelfAvailabilityPercent !== undefined && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Shelf Stock</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      task.shelfAvailabilityPercent < 20
                        ? 'text-rose-600'
                        : task.shelfAvailabilityPercent < 50
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {task.shelfAvailabilityPercent}%
                  </span>
                </div>
              )}
              {task.backroomUnits !== undefined && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Backroom</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{task.backroomUnits} units</span>
                </div>
              )}
              {task.expectedDepletionMinutes !== undefined && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Empty In</span>
                  <span className="text-base font-bold text-amber-700 font-mono">~{task.expectedDepletionMinutes}m</span>
                </div>
              )}
            </div>
          )}

          {/* Reason / Context */}
          {task.reason && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Trigger Context
              </span>
              <p className="text-slate-700 font-medium">{task.reason}</p>
            </div>
          )}

          {/* Blocker Alert if Blocked */}
          {isBlocked && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>TASK BLOCKED</span>
              </div>
              <p className="text-rose-900 font-medium">
                Reason: <span className="font-bold">{task.blockerReason?.replace(/_/g, ' ')}</span>
              </p>
              {task.blockerNote && <p className="text-rose-700 italic">"{task.blockerNote}"</p>}
              <div className="text-[10px] text-rose-600 font-semibold pt-1">
                Reported at {task.blockerTimestamp || 'recently'} • Notified Manager Operations
              </div>
            </div>
          )}

          {/* SOP Step-by-Step Checklist */}
          {task.sopSteps && task.sopSteps.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Standard Operating Procedure (SOP)
                </h4>
                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  {task.sopSteps.filter((s) => s.completed).length}/{task.sopSteps.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {task.sopSteps.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleTaskSopStep(task.id, step.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      step.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 line-through opacity-80'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{step.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assistance Sent Toast */}
          {assistanceSent && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Assistance request dispatched to nearby floor associates & supervisor!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          {/* Navigation & Help row */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onOpenMap(task)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Navigate</span>
            </button>
            <button
              type="button"
              onClick={handleRequestHelp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Request Help</span>
            </button>
            {!isCompleted && !isBlocked && (
              <button
                type="button"
                onClick={() => onOpenBlocker(task)}
                className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cannot Complete</span>
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          {isAssigned && (
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Start Task</span>
              <ArrowRight className="w-4 h-4 text-white/90" />
            </button>
          )}

          {isInProgress && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleting ? 'Verifying with Store Edge...' : 'Mark Complete & Verify'}</span>
            </button>
          )}

          {isBlocked && (
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20"
            >
              Resume / Retry Task
            </button>
          )}

          {isCompleted && (
            <div className="p-2.5 bg-emerald-50 rounded-xl text-center text-xs font-bold text-emerald-800 border border-emerald-200">
              ✓ Verified & Completed ({task.verificationType || 'Staff Confirmed'})
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
