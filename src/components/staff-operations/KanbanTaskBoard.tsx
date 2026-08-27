import React from 'react'
import {
  ListOrdered,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CANONICAL_TASKS,
  OperationalTask,
} from './staffData'

export type TaskStatusColumn = 'TO_DO' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'

interface KanbanTaskBoardProps {
  tasks?: OperationalTask[]
  onSelectTask: (task: OperationalTask) => void
}

export const KanbanTaskBoard: React.FC<KanbanTaskBoardProps> = ({
  tasks = CANONICAL_TASKS,
  onSelectTask,
}) => {
  const columns: { id: TaskStatusColumn; title: string; countBadgeColor: string }[] = [
    { id: 'TO_DO', title: 'To Do', countBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'ASSIGNED', title: 'Assigned', countBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'IN_PROGRESS', title: 'In Progress', countBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'COMPLETED', title: 'Completed', countBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  const activeCount = tasks.filter((t) => t.status !== 'COMPLETED').length

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Live Task Board
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          {activeCount} active tasks
        </span>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 min-h-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)

          return (
            <div
              key={col.id}
              className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex flex-col justify-between h-full min-h-0 shadow-2xs"
            >
              {/* Column Title & Counter */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 shrink-0">
                  <span className="text-xs font-bold text-slate-900">
                    {col.title}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
                      col.countBadgeColor
                    )}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {colTasks.map((task) => {
                    const isCritical = task.priority === 'CRITICAL'
                    const isHigh = task.priority === 'HIGH'

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 group shadow-2xs bg-white',
                          isCritical
                            ? 'border-rose-200 hover:border-rose-400'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {/* Priority Badge & ID */}
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase border',
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isHigh
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.createdTime}
                          </span>
                        </div>

                        {/* Title & Zone */}
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-snug group-hover:text-sky-700 transition-colors">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {task.zone}
                          </div>
                        </div>

                        {/* Footer: Assigned Staff / Verification */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          {col.id === 'COMPLETED' ? (
                            <div className="flex items-center gap-1 text-emerald-700 font-bold">
                              {task.verificationType === 'CAMERA_VERIFIED' ? (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  <span>Camera Verified</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Staff Confirmed</span>
                                </>
                              )}
                            </div>
                          ) : task.assignedStaffName ? (
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <span className="text-sky-700 font-mono text-[9px] font-bold">
                                {task.assignedStaffId}
                              </span>
                              <span className="truncate max-w-[80px]">{task.assignedStaffName}</span>
                            </div>
                          ) : (
                            <span className="text-amber-800 font-semibold">Unassigned</span>
                          )}

                          <span className="text-slate-400 shrink-0">{task.eta}</span>
                        </div>
                      </div>
                    )
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
