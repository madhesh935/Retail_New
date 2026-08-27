import React, { useMemo, useState } from 'react'
import {
  Users,
  Clock,
} from 'lucide-react'
import { StaffKpiRow } from '@/components/staff-operations/StaffKpiRow'
import {
  AiRecommendedAllocations,
} from '@/components/staff-operations/AiRecommendedAllocations'
import { FloorCoverageMap } from '@/components/staff-operations/FloorCoverageMap'
import {
  KanbanTaskBoard,
} from '@/components/staff-operations/KanbanTaskBoard'
import {
  StaffStatusTable,
} from '@/components/staff-operations/StaffStatusTable'
import { WorkloadDistributionCard } from '@/components/staff-operations/WorkloadDistributionCard'
import { TaskDetailDrawer } from '@/components/staff-operations/TaskDetailDrawer'
import { StaffDetailDrawer } from '@/components/staff-operations/StaffDetailDrawer'
import { StaffRouteModal } from '@/components/staff-operations/StaffRouteModal'
import { AssignConfirmModal } from '@/components/staff-operations/AssignConfirmModal'
import {
  StaffMember,
  OperationalTask,
  StaffRecommendation,
} from '@/components/staff-operations/staffData'
import { useAppStore } from '@/store/useAppStore'
import {
  buildStaffRecommendations,
  toOperationalStaff,
  toOperationalTask,
} from '@/services/api/livePageAdapters'

export const StaffOperationsPage: React.FC = () => {
  const staffMembers = useAppStore((s) => s.staffMembers)
  const pendingTasks = useAppStore((s) => s.pendingTasks)
  const acceptStaffTask = useAppStore((s) => s.acceptStaffTask)

  const liveStaff = useMemo(
    () => staffMembers.map((m, i) => toOperationalStaff(m, i)),
    [staffMembers]
  )

  const liveTasks = useMemo(() => {
    const seen = new Set<string>()
    return pendingTasks
      .filter((t) => {
        const key = `${t.title}-${t.shelfCode || ''}-${t.status}`
        if (t.status === 'IN_PROGRESS' && seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(toOperationalTask)
  }, [pendingTasks])

  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [selectedRouteAllocation, setSelectedRouteAllocation] =
    useState<StaffRecommendation | null>(null)
  const [pendingAssignRec, setPendingAssignRec] =
    useState<StaffRecommendation | null>(null)
  const [assignedRecIds, setAssignedRecIds] = useState<Record<string, boolean>>({})
  const [localTaskOverrides, setLocalTaskOverrides] = useState<Record<string, Partial<OperationalTask>>>({})

  const tasks = useMemo(
    () =>
      liveTasks.map((t) => ({
        ...t,
        ...(localTaskOverrides[t.id] || {}),
      })),
    [liveTasks, localTaskOverrides]
  )

  const recommendations = useMemo(
    () => buildStaffRecommendations(tasks, liveStaff).filter((r) => !assignedRecIds[r.id]),
    [tasks, liveStaff, assignedRecIds]
  )

  const handleConfirmAssignment = (rec: StaffRecommendation) => {
    setAssignedRecIds((prev) => ({ ...prev, [rec.id]: true }))
    setLocalTaskOverrides((prev) => ({
      ...prev,
      [rec.taskId]: {
        status: 'ASSIGNED',
        assignedStaffId: rec.recommendedStaffId,
        assignedStaffName: rec.recommendedStaffName,
      },
    }))
    acceptStaffTask(rec.taskId, rec.recommendedStaffId, rec.recommendedStaffName)
    setPendingAssignRec(null)
  }

  const handleFloorStaffClick = (staffId: string) => {
    const staff = liveStaff.find((s) => s.id === staffId)
    if (staff) setSelectedStaff(staff)
  }

  const handleFloorTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) setSelectedTask(task)
  }

  return (
    <div className="space-y-4 select-none pb-6">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
            <Users className="h-4 w-4 text-sky-600" />
            <span>Staff Operations</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Clock className="h-3.5 w-3.5" />
          Live roster · {liveStaff.length} staff · {tasks.length} tasks
        </div>
      </div>

      <StaffKpiRow staff={liveStaff} tasks={tasks} />

      <AiRecommendedAllocations
        recommendations={recommendations}
        onViewRoute={(rec) => setSelectedRouteAllocation(rec)}
        onAssignRequest={(rec) => setPendingAssignRec(rec)}
        assignedIds={assignedRecIds}
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-5">
          <FloorCoverageMap
            staff={liveStaff}
            tasks={tasks}
            onSelectStaff={handleFloorStaffClick}
            onSelectTask={handleFloorTaskClick}
          />
        </div>
        <div className="xl:col-span-7">
          <KanbanTaskBoard tasks={tasks} onSelectTask={setSelectedTask} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-8">
          <StaffStatusTable
            staff={liveStaff}
            onSelectStaff={setSelectedStaff}
            selectedStaffId={selectedStaff?.id}
          />
        </div>
        <div className="xl:col-span-4">
          <WorkloadDistributionCard staff={liveStaff} />
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      <StaffDetailDrawer
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />
      <StaffRouteModal
        allocation={selectedRouteAllocation}
        onClose={() => setSelectedRouteAllocation(null)}
      />
      <AssignConfirmModal
        recommendation={pendingAssignRec}
        onClose={() => setPendingAssignRec(null)}
        onConfirm={handleConfirmAssignment}
      />
    </div>
  )
}
