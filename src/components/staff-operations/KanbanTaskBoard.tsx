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
    { id: 'TO_DO', title: 'To Do', countBadgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
    { id: 'ASSIGNED', title: 'Assigned', countBadgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' },
    { id: 'IN_PROGRESS', title: 'In Progress', countBadgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/30' },
    { id: 'COMPLETED', title: 'Completed', countBadgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
  ]

  const activeCount = tasks.filter((t) => t.status !== 'COMPLETED').length

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-slate-300">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Live Task Board
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          {activeCount} active tasks
        </span>
      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)

          return (
            <div
              key={col.id}
              className="rounded-lg bg-[#090D14] border border-[#1E293B] p-2.5 flex flex-col justify-between min-h-[220px]"
            >
              {/* Column Title & Counter */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E293B]">
                  <span className="text-xs font-semibold text-slate-300">
                    {col.title}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                      col.countBadgeColor
                    )}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div className="space-y-2">
                  {colTasks.map((task) => {
                    const isCritical = task.priority === 'CRITICAL'
                    const isHigh = task.priority === 'HIGH'

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all cursor-pointer space-y-2 group',
                          isCritical
                            ? 'bg-[#0F172A] border-rose-500/40 hover:border-rose-400'
                            : 'bg-[#0F172A] border-[#1E293B] hover:border-slate-500'
                        )}
                      >
                        {/* Priority Badge & ID */}
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              'text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase border',
                              isCritical
                                ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                : isHigh
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                : 'bg-[#1E293B] text-slate-400 border-slate-700'
                            )}
                          >
                            {task.priority}
                          </span>

                          <span className="text-[10px] text-slate-500 font-mono">
                            {task.createdTime}
                          </span>
                        </div>

                        {/* Title & Zone */}
                        <div>
                          <div className="font-semibold text-white text-xs leading-snug group-hover:text-cyan-300 transition-colors">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {task.zone}
                          </div>
                        </div>

                        {/* Footer: Assigned Staff / Verification */}
                        <div className="pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-[10px]">
                          {col.id === 'COMPLETED' ? (
                            <div className="flex items-center gap-1 text-emerald-400 font-medium">
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
                            <div className="flex items-center gap-1 text-slate-300 font-medium">
                              <span className="text-cyan-400 font-mono text-[9px] font-bold">
                                {task.assignedStaffId}
                              </span>
                              <span>{task.assignedStaffName}</span>
                            </div>
                          ) : (
                            <span className="text-amber-400 font-medium">Unassigned</span>
                          )}

                          <span className="text-slate-500">{task.eta}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {colTasks.length === 0 && (
                <div className="my-auto py-6 text-center text-[11px] text-slate-500">
                  No tasks in this stage
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
