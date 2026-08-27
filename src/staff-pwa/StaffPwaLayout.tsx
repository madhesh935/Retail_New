import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom'
import { CopilotRobotIcon } from './components/CopilotRobotIcon'
import { useAppStore } from '@/store/useAppStore'
import { StaffTopBar } from './components/StaffTopBar'
import { StaffBottomNav, StaffNavTab } from './components/StaffBottomNav'
import { StaffTodayPage } from './pages/StaffTodayPage'
import { StaffAssistPage } from './pages/StaffAssistPage'
import { StaffWorkPage } from './pages/StaffWorkPage'
import { StaffMorePage } from './pages/StaffMorePage'

// Modals
import { TaskDetailSheet } from './components/TaskDetailSheet'
import { BlockerModal } from './components/BlockerModal'
import { AssistDetailSheet } from './components/AssistDetailSheet'
import { StoreMap2DModal } from './components/StoreMap2DModal'
import { ShiftHandoverModal } from './components/ShiftHandoverModal'
import { ReportIssueModal } from './components/ReportIssueModal'
import { NotificationsSheet } from './components/NotificationsSheet'
import { StaffCopilotModal } from './components/StaffCopilotModal'
import { StaffTask } from '@/types'
import { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'

export const StaffPwaLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { authenticatedStaff, attendanceState, blockStaffTask } = useAppStore()

  // Active Tab state (4 primary operations tabs)
  const [activeTab, setActiveTab] = useState<StaffNavTab>('today')

  // Modals state
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [blockerTask, setBlockerTask] = useState<StaffTask | null>(null)
  const [isBlockerOpen, setIsBlockerOpen] = useState(false)

  const [selectedAssist, setSelectedAssist] = useState<CustomerHelpRequest | null>(null)
  const [isAssistDetailOpen, setIsAssistDetailOpen] = useState(false)

  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapTarget, setMapTarget] = useState<{ destination: string; zone?: string; shelf?: string }>({
    destination: 'Shelf B4 — Cold Beverages',
    zone: 'Beverages & Snacks',
    shelf: 'B4',
  })

  const [isHandoverOpen, setIsHandoverOpen] = useState(false)
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)

  // Authentication & Attendance Route Guards
  useEffect(() => {
    const path = location.pathname

    // 1. If not authenticated, force to login
    if (!authenticatedStaff && path !== '/staff/login') {
      navigate('/staff/login', { replace: true })
      return
    }

    // 2. If authenticated but not checked in, force to attendance
    if (
      authenticatedStaff &&
      attendanceState.status === 'NOT_CHECKED_IN' &&
      path !== '/staff/attendance'
    ) {
      navigate('/staff/attendance', { replace: true })
      return
    }

    // 3. If authenticated and checked in, redirect away from login/attendance
    if (
      authenticatedStaff &&
      attendanceState.status !== 'NOT_CHECKED_IN' &&
      (path === '/staff/login' || path === '/staff/attendance')
    ) {
      navigate('/staff', { replace: true })
    }
  }, [authenticatedStaff, attendanceState.status, location.pathname, navigate])

  // Don't render companion shell on login or attendance screens
  if (location.pathname === '/staff/login' || location.pathname === '/staff/attendance') {
    return (
      <div className="w-full max-w-md mx-auto relative shadow-2xl h-screen bg-slate-50 overflow-hidden font-sans">
        <Outlet />
      </div>
    )
  }

  // If waiting for auth redirect, show blank
  if (!authenticatedStaff) return null

  // Handlers
  const handleOpenTaskDetails = (task: StaffTask) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  const handleOpenBlocker = (task: StaffTask) => {
    setIsTaskDetailOpen(false)
    setBlockerTask(task)
    setIsBlockerOpen(true)
  }

  const handleOpenAssistDetails = (request: CustomerHelpRequest) => {
    setSelectedAssist(request)
    setIsAssistDetailOpen(true)
  }

  const handleOpenMap = (destination: string, zone?: string, shelf?: string) => {
    setMapTarget({ destination, zone, shelf })
    setIsMapOpen(true)
  }

  const handleBlockerSubmit = (reason: any, note?: string, photo?: string) => {
    if (blockerTask) {
      blockStaffTask(blockerTask.id, reason, note, photo)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden w-full max-w-md mx-auto relative shadow-2xl border-x border-slate-200 select-none">
      {/* 1. Top Mobile Bar */}
      <StaffTopBar
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        storeName={authenticatedStaff?.storeName || 'Chennai Central • Store 01'}
      />

      {/* 2. Main Content Area per Tab (4 Core Operations) */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {activeTab === 'today' && (
          <StaffTodayPage
            onOpenTaskDetails={handleOpenTaskDetails}
            onNavigateTab={(tab) => setActiveTab(tab as StaffNavTab)}
            onOpenHandover={() => setIsHandoverOpen(true)}
          />
        )}
        {activeTab === 'assist' && (
          <StaffAssistPage
            onOpenAssistDetails={handleOpenAssistDetails}
            onOpenMap={(zone, shelf) => handleOpenMap(`Customer in ${zone}`, zone, shelf)}
          />
        )}
        {activeTab === 'work' && (
          <StaffWorkPage
            onOpenTaskDetails={handleOpenTaskDetails}
            onOpenMap={handleOpenMap}
          />
        )}
        {activeTab === 'more' && (
          <StaffMorePage
            onOpenHandover={() => setIsHandoverOpen(true)}
            onOpenReportIssue={() => setIsReportIssueOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}
      </main>

      {/* 3. Floating Copilot Robot Logo Trigger (Light Clean Theme) */}
      <div className="fixed bottom-18 right-4 max-w-md mx-auto z-30 pointer-events-auto select-none">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-blue-600 shadow-[0_6px_20px_rgba(37,99,235,0.18)] border-2 border-blue-500 flex items-center justify-center transition-all active:scale-90 group hover:ring-4 hover:ring-blue-100 cursor-pointer"
          aria-label="Store Copilot"
          title="Store Copilot"
        >
          <CopilotRobotIcon className="w-6.5 h-6.5 text-blue-600 group-hover:scale-110 transition-transform" stroke="#2563EB" />
        </button>
      </div>

      {/* 4. Bottom 4-Destination Navigation */}
      <StaffBottomNav activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* 5. Shared Modals & Drawers */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onOpenMap={(task) => handleOpenMap(task.title, task.zoneName, task.shelfCode)}
        onOpenBlocker={handleOpenBlocker}
      />

      <BlockerModal
        isOpen={isBlockerOpen}
        onClose={() => setIsBlockerOpen(false)}
        taskTitle={blockerTask?.title || 'Active Task'}
        taskId={blockerTask?.id || ''}
        onSubmitBlocker={handleBlockerSubmit}
      />

      <AssistDetailSheet
        request={selectedAssist}
        isOpen={isAssistDetailOpen}
        onClose={() => setIsAssistDetailOpen(false)}
        onOpenMap={(zone, shelf) => handleOpenMap(`Customer in ${zone}`, zone, shelf)}
      />

      <StoreMap2DModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        destinationName={mapTarget.destination}
        destinationZone={mapTarget.zone}
        shelfCode={mapTarget.shelf}
      />

      <ShiftHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
      />

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as StaffNavTab)}
      />

      <StaffCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as StaffNavTab)}
        onOpenTaskDetails={(taskId) => {
          const t = useAppStore.getState().pendingTasks.find((item) => item.id === taskId)
          if (t) handleOpenTaskDetails(t)
        }}
      />
    </div>
  )
}
