import { StateCreator } from 'zustand'
import { AttendanceStateModel, AuthenticatedStaff, AttendanceStatus } from '@/types'

export interface AttendanceSlice {
  authenticatedStaff: AuthenticatedStaff | null
  attendanceState: AttendanceStateModel
  
  // Actions
  loginStaff: (staff: AuthenticatedStaff) => void
  logoutStaff: () => void
  checkInShift: (checkInAt: string, status?: AttendanceStatus) => void
  startStaffBreak: (breakAt: string) => void
  endStaffBreak: () => void
  checkOutShift: (checkOutAt: string) => void
}

const initialAttendanceState: AttendanceStateModel = {
  status: 'NOT_CHECKED_IN',
  storeId: 'STORE-01',
  storeName: 'Chennai Central',
  shiftId: 'SHIFT-B',
  shiftStart: '14:00',
  shiftEnd: '22:00',
}

export const createAttendanceSlice: StateCreator<AttendanceSlice, [], [], AttendanceSlice> = (set) => ({
  authenticatedStaff: null,
  attendanceState: initialAttendanceState,

  loginStaff: (staff) => set({ authenticatedStaff: staff }),
  
  logoutStaff: () => set({ 
    authenticatedStaff: null, 
    attendanceState: initialAttendanceState 
  }),

  checkInShift: (checkInAt, status = 'PRESENT') => set((state) => ({
    attendanceState: {
      ...state.attendanceState,
      status,
      checkInAt,
    }
  })),

  startStaffBreak: () => set((state) => ({
    attendanceState: {
      ...state.attendanceState,
      status: 'ON_BREAK',
    }
  })),

  endStaffBreak: () => set((state) => ({
    attendanceState: {
      ...state.attendanceState,
      status: 'PRESENT',
    }
  })),

  checkOutShift: (checkOutAt) => set((state) => ({
    attendanceState: {
      ...state.attendanceState,
      status: 'CHECKED_OUT',
      checkOutAt,
    },
    authenticatedStaff: null // Optional: clear auth on checkout depending on flow
  })),
})
