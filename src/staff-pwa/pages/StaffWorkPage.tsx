import React, { useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Sparkles,
  Route,
  ShieldAlert,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { StaffTask } from '@/types'

interface StaffWorkPageProps {
  onOpenTaskDetails: (task: StaffTask) => void
  onOpenMap: (destination: string, zone?: string, shelf?: string) => void
}

type TabCategory = 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED'

export const StaffWorkPage: React.FC<StaffWorkPageProps> = ({
  onOpenTaskDetails,
  onOpenMap,
}) => {
  const { pendingTasks, optimizedWorkRun, syncTaskStatus, authenticatedStaff } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabCategory>('TODO')

  const myTasks = pendingTasks.filter((t) => {
    if (t.category === 'CUSTOMER_ASSISTANCE') return false
    if (!authenticatedStaff?.id) return true
    return !t.assignedStaffId || t.assignedStaffId === authenticatedStaff.id
  })

  const todoTasks = myTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'ACCEPTED' || t.status === 'PENDING')
  const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS')
  const waitingTasks = myTasks.filter((t) => t.status === 'BLOCKED')
  const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'VERIFIED')

  const displayedTasks =
    activeTab === 'TODO'
      ? todoTasks
      : activeTab === 'IN_PROGRESS'
      ? inProgressTasks
      : activeTab === 'WAITING'
      ? waitingTasks
      : completedTasks

  const handleStartRun = () => {
    if (optimizedWorkRun && optimizedWorkRun.taskIds.length > 0) {
      void syncTaskStatus(optimizedWorkRun.taskIds[0], 'IN_PROGRESS', authenticatedStaff?.id)
      setActiveTab('IN_PROGRESS')
    }
  }

  return (
    <div className="space-y-3.5 p-4 pb-28">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Store Operations Work</span>
          </h2>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
            {todoTasks.length + inProgressTasks.length} Active
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Assigned replenishment, queue support, safety and planogram tasks
        </p>
      </div>

      {/* 2. OPTIMIZED WORK RUN (Standout Feature - Clean Light Theme) */}
      {optimizedWorkRun && activeTab === 'TODO' && (
        <div className="bg-blue-50/80 rounded-2xl p-4.5 border border-blue-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Optimized Work Run</span>
            </div>
            <span className="text-[10px] bg-white text-blue-800 border border-blue-200 font-bold px-2 py-0.5 rounded-md font-mono shadow-2xs">
              ~{optimizedWorkRun.estimatedMinutes}m sequence
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">{optimizedWorkRun.title}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{optimizedWorkRun.description}</p>
          </div>

          {/* Turn-by-Turn Run Sequence */}
          <div className="space-y-1.5 bg-white/90 p-3 rounded-xl border border-blue-100 text-xs">
            {optimizedWorkRun.stops.map((stop) => (
              <div key={stop.sequence} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                    {stop.sequence}
                  </span>
                  <span className="font-medium text-slate-800">{stop.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{stop.zoneName}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleStartRun}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Start Work Run</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenMap('Aisle 4 Run Cluster', 'Beverages & Stockroom', 'Bay 3B → B4')}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1 transition-colors"
            >
              <Route className="w-4 h-4 text-blue-600" />
              <span>Route</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. 4 Clean Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('TODO')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'TODO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>To Do</span>
          {todoTasks.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {todoTasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'IN_PROGRESS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Active</span>
          {inProgressTasks.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
              {inProgressTasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WAITING')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === 'WAITING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Waiting</span>
          {waitingTasks.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
              {waitingTasks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Done
        </button>
      </div>

      {/* 4. Task Cards */}
      <div className="space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              {activeTab === 'TODO'
                ? "You're All Caught Up"
                : activeTab === 'IN_PROGRESS'
                ? 'No Tasks Currently In Progress'
                : activeTab === 'WAITING'
                ? 'No Blocked or Waiting Tasks'
                : 'No Completed Tasks Yet Today'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'TODO'
                ? 'Store intelligence will dispatch tasks as inventory or queue events occur.'
                : 'Tasks appear here based on your workflow state.'}
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const isBlocked = task.status === 'BLOCKED'
            const isInProgress = task.status === 'IN_PROGRESS'

            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskDetails(task)}
                className={`bg-white rounded-2xl border p-4.5 space-y-3 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all hover:border-slate-300 ${
                  isBlocked
                    ? 'border-rose-300 bg-rose-50/20'
                    : isInProgress
                    ? 'border-blue-400 ring-2 ring-blue-100/60'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Priority & Status Banner */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        task.priority === 'CRITICAL' || task.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/70'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase font-mono">{task.category}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 font-mono">ETA {task.etaMinutes}m</span>
                </div>

                {/* Title & Location */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{task.zoneName}</span>
                    {task.shelfCode && (
                      <span className="font-bold text-slate-900 font-mono">({task.shelfCode})</span>
                    )}
                  </div>
                </div>

                {/* Key Metric pill */}
                {(task.shelfAvailabilityPercent !== undefined || task.backroomUnits !== undefined) && (
                  <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {task.shelfAvailabilityPercent !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Shelf: </span>
                        <span className="font-bold text-rose-600 font-mono">{task.shelfAvailabilityPercent}%</span>
                      </div>
                    )}
                    {task.backroomUnits !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Backroom: </span>
                        <span className="font-bold text-slate-900 font-mono">{task.backroomUnits} units</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Blocker alert preview */}
                {isBlocked && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    <span>Blocked: {task.blockerReason?.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {/* SOP Progress preview */}
                {task.sopSteps && task.sopSteps.length > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>SOP Checklist:</span>
                    <span className="font-bold font-mono">
                      {task.sopSteps.filter((s) => s.completed).length}/{task.sopSteps.length} done
                    </span>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">{task.createdAt}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenTaskDetails(task)
                    }}
                    className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 flex items-center gap-1 transition-all"
                  >
                    <span>{isInProgress ? 'Resume' : isBlocked ? 'Review Blocker' : 'Open Details'}</span>
                    <ArrowRight className="w-3 h-3 text-white/90" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
