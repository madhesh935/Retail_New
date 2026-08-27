import React, { useState } from 'react'
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
  CANONICAL_STAFF,
  CANONICAL_TASKS,
  StaffMember,
  OperationalTask,
  StaffRecommendation,
} from '@/components/staff-operations/staffData'

export const StaffOperationsPage: React.FC = () => {
  // Selected task for detail inspection
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null)

  // Selected staff for profile inspection
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)

  // Selected allocation for route preview
  const [selectedRouteAllocation, setSelectedRouteAllocation] =
    useState<StaffRecommendation | null>(null)

  // Recommendation pending assignment confirmation
  const [pendingAssignRec, setPendingAssignRec] =
    useState<StaffRecommendation | null>(null)

  // Track assigned recommendations
  const [assignedRecIds, setAssignedRecIds] = useState<Record<string, boolean>>({})

  // Track local task state to reflect assignments dynamically
  const [tasks, setTasks] = useState<OperationalTask[]>(CANONICAL_TASKS)

  const handleConfirmAssignment = (rec: StaffRecommendation) => {
    // 1. Mark recommendation as assigned
    setAssignedRecIds((prev) => ({ ...prev, [rec.id]: true }))

    // 2. Update tasks state
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === rec.taskId) {
          return {
            ...t,
            status: 'ASSIGNED',
            assignedStaffId: rec.recommendedStaffId,
            assignedStaffName: rec.recommendedStaffName,
          }
        }
        return t
      })
    )

    // 3. Close modal
    setPendingAssignRec(null)
  }

  const handleFloorStaffClick = (staffId: string) => {
    const staff = CANONICAL_STAFF.find((s) => s.id === staffId)
    if (staff) setSelectedStaff(staff)
  }

  const handleFloorTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) setSelectedTask(task)
  }

  return (
    <div className="space-y-4 select-none pb-6">
      {/* ======================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
              <Users className="h-4 w-4 text-sky-600" />
              <span>Staff Operations</span>
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono">
              Shift B · 14:00–22:00
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-sky-600" />
            <span>Shift B: <strong>12 On Shift</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated 2 sec ago</span>
          </div>
        </div>
      </div>

      {/* 2. Top 6 Staff Operations KPI Cards */}
      <StaffKpiRow />

      {/* 3. Recommended Assignments (Left) & Floor Coverage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <AiRecommendedAllocations
            onAssignRequest={(rec) => setPendingAssignRec(rec)}
            onViewRoute={(rec) => setSelectedRouteAllocation(rec)}
            assignedIds={assignedRecIds}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <FloorCoverageMap
            onSelectStaff={handleFloorStaffClick}
            onSelectTask={handleFloorTaskClick}
          />
        </div>
      </div>

      {/* 4. Live Task Board (4 Columns) */}
      <KanbanTaskBoard
        tasks={tasks}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* 5. Staff Availability (Left) & Workload by Function (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <StaffStatusTable
            selectedStaffId={selectedStaff?.id}
            onSelectStaff={(staff) => setSelectedStaff(staff)}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <WorkloadDistributionCard />
        </div>
      </div>

      {/* ======================================================= */}
      {/* DRAWERS & MODALS */}
      {/* ======================================================= */}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Staff Detail Drawer */}
      <StaffDetailDrawer
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
      />

      {/* Staff Transit Route Preview Modal */}
      <StaffRouteModal
        allocation={selectedRouteAllocation}
        onClose={() => setSelectedRouteAllocation(null)}
      />

      {/* Assignment Confirmation Modal */}
      <AssignConfirmModal
        recommendation={pendingAssignRec}
        onClose={() => setPendingAssignRec(null)}
        onConfirm={handleConfirmAssignment}
      />
    </div>
  )
}
