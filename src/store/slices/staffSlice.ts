import { StateCreator } from 'zustand'
import { StaffMember, StaffTask, StaffOperationsPayload } from '@/types'
import { MOCK_STAFF } from '@/services/mock/mockData'

export interface StaffSlice {
  staffMembers: StaffMember[]
  pendingTasks: StaffTask[]
  recommendedReallocations: StaffOperationsPayload['recommendedReallocations']
  totalStaffOnShift: number
  availableStaffCount: number
  isLoadingStaff: boolean

  setStaffPayload: (payload: StaffOperationsPayload) => void
  updateStaffStatus: (staffId: string, status: StaffMember['status'], zoneId?: string, zoneName?: string) => void
  addStaffTask: (task: StaffTask) => void
  completeStaffTask: (taskId: string) => void
  setLoadingStaff: (loading: boolean) => void
}

export const createStaffSlice: StateCreator<StaffSlice, [], [], StaffSlice> = (set) => ({
  staffMembers: MOCK_STAFF.staffMembers,
  pendingTasks: MOCK_STAFF.pendingTasks,
  recommendedReallocations: MOCK_STAFF.recommendedReallocations,
  totalStaffOnShift: MOCK_STAFF.totalStaffOnShift,
  availableStaffCount: MOCK_STAFF.availableStaffCount,
  isLoadingStaff: false,

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
      availableStaffCount: state.staffMembers.filter((m) => (m.id === staffId ? status === 'ON_DUTY_AVAILABLE' : m.status === 'ON_DUTY_AVAILABLE')).length,
    })),
  addStaffTask: (task) =>
    set((state) => ({
      pendingTasks: [task, ...state.pendingTasks],
    })),
  completeStaffTask: (taskId) =>
    set((state) => ({
      pendingTasks: state.pendingTasks.filter((t) => t.id !== taskId),
    })),
  setLoadingStaff: (isLoadingStaff) => set({ isLoadingStaff }),
})
