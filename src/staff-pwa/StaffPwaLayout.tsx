import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { CopilotRobotIcon } from './components/CopilotRobotIcon'
import { useAppStore } from '@/store/useAppStore'
import { useStoreData } from '@/hooks/useStoreData'
import { useWebSocket } from '@/hooks/useWebSocket'
import { StaffTopBar } from './components/StaffTopBar'
import { StaffBottomNav, StaffNavTab } from './components/StaffBottomNav'
import { StaffTodayPage } from './pages/StaffTodayPage'
import { StaffAssistPage } from './pages/StaffAssistPage'
import { StaffScanPage } from './pages/StaffScanPage'
import { StaffWorkPage } from './pages/StaffWorkPage'
import { StaffMorePage } from './pages/StaffMorePage'

// Modals
import { TaskDetailSheet } from './components/TaskDetailSheet'
import { BlockerModal } from './components/BlockerModal'
import { AssistDetailSheet } from './components/AssistDetailSheet'
import { StoreMap2DModal, type StaffMapTarget } from './components/StoreMap2DModal'
import { ShiftHandoverModal } from './components/ShiftHandoverModal'
import { ReportIssueModal } from './components/ReportIssueModal'
import { NotificationsSheet } from './components/NotificationsSheet'
import { StaffCopilotModal } from './components/StaffCopilotModal'
import { BlockerReason, StaffTask } from '@/types'
import { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'

export const StaffPwaLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  useWebSocket()
  // Poll stays as a fallback/heartbeat; DATA_CHANGED push (e.g. a new
  // customer assist request) now updates this app instantly instead of
  // waiting up to 8s for the next poll.
  useStoreData({ pollMs: 8000 })

  const { authenticatedStaff, attendanceState, syncTaskStatus } = useAppStore()

  // Active Tab state
  const [activeTab, setActiveTab] = useState<StaffNavTab>('today')

  // Modals state
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [blockerTask, setBlockerTask] = useState<StaffTask | null>(null)
  const [isBlockerOpen, setIsBlockerOpen] = useState(false)

  const [selectedAssist, setSelectedAssist] = useState<CustomerHelpRequest | null>(null)
  const [isAssistDetailOpen, setIsAssistDetailOpen] = useState(false)

  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mapTarget, setMapTarget] = useState<StaffMapTarget>({
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
      <div className="w-full max-w-md mx-auto relative shadow-2xl h-screen bg-slate-900 overflow-hidden font-sans">
        <Outlet />
      </div>
    )
  }

  // If waiting for auth redirect, send to login instead of blank screen
  if (!authenticatedStaff) {
    return <Navigate to="/staff/login" replace />
  }

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

  const handleOpenMap = (
    targetOrDestination: StaffMapTarget | string,
    zone?: string,
    shelf?: string
  ) => {
    const target: StaffMapTarget =
      typeof targetOrDestination === 'string'
        ? { destination: targetOrDestination, zone, shelf }
        : targetOrDestination
    setMapTarget(target)
    setIsMapOpen(true)
  }

  const handleBlockerSubmit = (reason: BlockerReason, note?: string, photo?: string) => {
    if (blockerTask) {
      void syncTaskStatus(blockerTask.id, 'BLOCKED', undefined, { reason, note, photo })
    }
  }

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-[#F4F6F8] text-slate-900 font-sans overflow-hidden w-full max-w-md mx-auto relative shadow-2xl border-x border-slate-200 select-none">
      {/* 1. Top Mobile Bar */}
      <StaffTopBar
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        storeName={authenticatedStaff?.storeName || 'Chennai Central • Store 01'}
      />

      {/* 2. Main Content Area per Tab */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {activeTab === 'today' && (
          <StaffTodayPage
            onOpenTaskDetails={handleOpenTaskDetails}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenHandover={() => setIsHandoverOpen(true)}
          />
        )}
        {activeTab === 'assist' && (
          <StaffAssistPage
            onOpenAssistDetails={handleOpenAssistDetails}
          />
        )}
        {activeTab === 'scan' && (
          <StaffScanPage
            onOpenMap={handleOpenMap}
            onOpenReportIssue={() => setIsReportIssueOpen(true)}
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

      {/* 3. Floating Copilot — anchored inside phone shell */}
      <div className="absolute bottom-20 right-3 z-30 pointer-events-auto select-none">
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-sky-700 shadow-[0_6px_20px_rgba(15,118,110,0.18)] border-2 border-sky-600 flex items-center justify-center transition-all active:scale-90 group hover:ring-4 hover:ring-sky-100"
          aria-label="Store Copilot"
          title="Store Copilot"
        >
          <CopilotRobotIcon className="w-6.5 h-6.5 text-blue-600 group-hover:scale-110 transition-transform" stroke="#2563EB" />
        </button>
      </div>

      {/* 4. Bottom 5-Destination Navigation */}
      <StaffBottomNav activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* 5. Shared Modals & Drawers */}
      <TaskDetailSheet
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onOpenMap={(task) =>
          handleOpenMap({
            destination: task.title,
            zone: task.zoneName,
            shelf: task.shelfCode,
          })
        }
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
        onOpenMap={(request) =>
          handleOpenMap({
            destination: request.productName
              ? `Assist: ${request.productName}`
              : `Customer in ${request.zoneName}`,
            zone: request.zoneName,
            shelf: request.shelfCode,
            productName: request.productName,
            customerMessage: request.message,
          })
        }
      />

      <StoreMap2DModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} target={mapTarget} />

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
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <StaffCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenTaskDetails={(taskId) => {
          const t = useAppStore.getState().pendingTasks.find((item) => item.id === taskId)
          if (t) handleOpenTaskDetails(t)
        }}
      />
    </div>
  )
}
