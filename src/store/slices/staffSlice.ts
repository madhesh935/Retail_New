import { StateCreator } from 'zustand'
import {
  StaffMember,
  StaffTask,
  StaffOperationsPayload,
  ShiftHandoverItem,
  StoreAnnouncement,
  OptimizedWorkRun,
  BlockerReason,
  VerificationType,
} from '@/types'

export interface StaffSlice {
  staffMembers: StaffMember[]
  pendingTasks: StaffTask[]
  recommendedReallocations: StaffOperationsPayload['recommendedReallocations']
  totalStaffOnShift: number
  availableStaffCount: number
  isLoadingStaff: boolean

  // Worker Companion State
  operationalStatus: 'AVAILABLE' | 'BUSY' | 'ON_BREAK'
  handoverItems: ShiftHandoverItem[]
  storeAnnouncements: StoreAnnouncement[]
  optimizedWorkRun: OptimizedWorkRun | null

  // Actions
  setStaffPayload: (payload: StaffOperationsPayload) => void
  updateStaffStatus: (staffId: string, status: StaffMember['status'], zoneId?: string, zoneName?: string) => void
  setOperationalStatus: (status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK') => void
  addStaffTask: (task: StaffTask) => void
  acceptStaffTask: (taskId: string, staffId: string, staffName: string) => void
  startStaffTask: (taskId: string) => void
  blockStaffTask: (taskId: string, reason: BlockerReason, note?: string, photo?: string) => void
  requestTaskAssistance: (taskId: string, reason: string) => void
  toggleTaskSopStep: (taskId: string, stepId: string) => void
  completeStaffTask: (taskId: string, verificationType?: VerificationType, afterPhoto?: string) => void
  addHandoverItem: (item: Omit<ShiftHandoverItem, 'id' | 'createdAt'>) => void
  acknowledgeAnnouncement: (announcementId: string) => void
  setLoadingStaff: (loading: boolean) => void
}

export const createStaffSlice: StateCreator<StaffSlice, [], [], StaffSlice> = (set) => ({
  staffMembers: [],
  pendingTasks: [],
  recommendedReallocations: [],
  totalStaffOnShift: 0,
  availableStaffCount: 0,
  isLoadingStaff: false,

  operationalStatus: 'AVAILABLE',
  handoverItems: [],
  storeAnnouncements: [],
  optimizedWorkRun: null,

  setStaffPayload: (payload) =>
    set({
      staffMembers: payload.staffMembers,
      pendingTasks: payload.pendingTasks,
      recommendedReallocations: payload.recommendedReallocations,
      totalStaffOnShift: payload.totalStaffOnShift,
      availableStaffCount: payload.availableStaffCount,
    }),

  updateStaffStatus: (staffId, status, zoneId, zoneName) =>
    set((state) => ({
      staffMembers: state.staffMembers.map((m) =>
        m.id === staffId
          ? {
              ...m,
              status,
              ...(zoneId ? { currentZoneId: zoneId } : {}),
              ...(zoneName ? { currentZoneName: zoneName } : {}),
            }
          : m
      ),
      availableStaffCount: state.staffMembers.filter((m) =>
        m.id === staffId ? status === 'ON_DUTY_AVAILABLE' : m.status === 'ON_DUTY_AVAILABLE'
      ).length,
    })),

  setOperationalStatus: (operationalStatus) => set({ operationalStatus }),

  addStaffTask: (task) =>
    set((state) => ({
      pendingTasks: [task, ...state.pendingTasks],
    })),

  acceptStaffTask: (taskId, staffId, staffName) =>
    set((state) => ({
      pendingTasks: state.pendingTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'ACCEPTED',
              assignedStaffId: staffId,
              assignedStaffName: staffName,
            }
          : t
      ),
    })),

  startStaffTask: (taskId) =>
    set((state) => ({
      operationalStatus: 'BUSY',
      pendingTasks: state.pendingTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'IN_PROGRESS',
            }
          : t
      ),
    })),

  blockStaffTask: (taskId, reason, note, photo) =>
    set((state) => ({
      operationalStatus: 'AVAILABLE',
      pendingTasks: state.pendingTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'BLOCKED',
              blockerReason: reason,
              blockerNote: note,
              blockerTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              beforePhoto: photo || t.beforePhoto,
            }
          : t
      ),
    })),

  requestTaskAssistance: (taskId, reason) =>
    set((state) => ({
      pendingTasks: state.pendingTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assistanceRequested: true,
              assistanceReason: reason,
            }
          : t
      ),
    })),

  toggleTaskSopStep: (taskId, stepId) =>
    set((state) => ({
      pendingTasks: state.pendingTasks.map((t) => {
        if (t.id !== taskId || !t.sopSteps) return t
        return {
          ...t,
          sopSteps: t.sopSteps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s)),
        }
      }),
    })),

  completeStaffTask: (taskId, verificationType = 'STAFF_CONFIRMED', afterPhoto) =>
    set((state) => {
      const target = state.pendingTasks.find((t) => t.id === taskId)
      // Check if any other in-progress task exists
      const remainingInProgress = state.pendingTasks.filter((t) => t.id !== taskId && t.status === 'IN_PROGRESS').length
      return {
        operationalStatus: remainingInProgress > 0 ? 'BUSY' : 'AVAILABLE',
        pendingTasks: state.pendingTasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'COMPLETED',
                verificationType,
                afterPhoto: afterPhoto || t.afterPhoto,
                verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                shelfAvailabilityPercent: t.shelfAvailabilityPercent !== undefined ? Math.min(100, Math.max(80, t.shelfAvailabilityPercent + 60)) : undefined,
              }
            : t
        ),
      }
    }),

  addHandoverItem: (item) =>
    set((state) => ({
      handoverItems: [
        {
          ...item,
          id: `ho-${Date.now()}`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...state.handoverItems,
      ],
    })),

  acknowledgeAnnouncement: (announcementId) =>
    set((state) => ({
      storeAnnouncements: state.storeAnnouncements.map((a) =>
        a.id === announcementId ? { ...a, acknowledged: true } : a
      ),
    })),

  setLoadingStaff: (isLoadingStaff) => set({ isLoadingStaff }),
})
