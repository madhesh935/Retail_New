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

const STAFF_SESSION_KEY = 'retail-edge-staff-session'

function loadStaffSession(): {
  authenticatedStaff: AuthenticatedStaff | null
  attendanceState: AttendanceStateModel
} {
  if (typeof window === 'undefined') {
    return { authenticatedStaff: null, attendanceState: initialAttendanceState }
  }
  try {
    const raw = window.localStorage.getItem(STAFF_SESSION_KEY)
    if (!raw) return { authenticatedStaff: null, attendanceState: initialAttendanceState }
    const parsed = JSON.parse(raw)
    return {
      authenticatedStaff: parsed.authenticatedStaff || null,
      attendanceState: { ...initialAttendanceState, ...(parsed.attendanceState || {}) },
    }
  } catch {
    window.localStorage.removeItem(STAFF_SESSION_KEY)
    return { authenticatedStaff: null, attendanceState: initialAttendanceState }
  }
}

function saveStaffSession(
  authenticatedStaff: AuthenticatedStaff | null,
  attendanceState: AttendanceStateModel
) {
  if (typeof window === 'undefined') return
  if (!authenticatedStaff) {
    window.localStorage.removeItem(STAFF_SESSION_KEY)
    return
  }
  window.localStorage.setItem(
    STAFF_SESSION_KEY,
    JSON.stringify({ authenticatedStaff, attendanceState })
  )
}

const savedSession = loadStaffSession()

export const createAttendanceSlice: StateCreator<AttendanceSlice, [], [], AttendanceSlice> = (set) => ({
  authenticatedStaff: savedSession.authenticatedStaff,
  attendanceState: savedSession.attendanceState,

  loginStaff: (staff) =>
    set((state) => {
      const attendanceState =
        state.attendanceState.status === 'CHECKED_OUT'
          ? initialAttendanceState
          : state.attendanceState
      saveStaffSession(staff, attendanceState)
      return { authenticatedStaff: staff, attendanceState }
    }),
  
  logoutStaff: () =>
    set(() => {
      saveStaffSession(null, initialAttendanceState)
      return {
        authenticatedStaff: null,
        attendanceState: initialAttendanceState,
      }
    }),

  checkInShift: (checkInAt, status = 'PRESENT') => set((state) => {
    const attendanceState = {
      ...state.attendanceState,
      status,
      checkInAt,
    }
    saveStaffSession(state.authenticatedStaff, attendanceState)
    return { attendanceState }
  }),

  startStaffBreak: () => set((state) => {
    const attendanceState = {
      ...state.attendanceState,
      status: 'ON_BREAK' as const,
    }
    saveStaffSession(state.authenticatedStaff, attendanceState)
    return { attendanceState }
  }),

  endStaffBreak: () => set((state) => {
    const attendanceState = {
      ...state.attendanceState,
      status: 'PRESENT' as const,
    }
    saveStaffSession(state.authenticatedStaff, attendanceState)
    return { attendanceState }
  }),

  checkOutShift: (checkOutAt) => set((state) => {
    const attendanceState = {
      ...state.attendanceState,
      status: 'CHECKED_OUT' as const,
      checkOutAt,
    }
    saveStaffSession(null, attendanceState)
    return {
      attendanceState,
      authenticatedStaff: null,
    }
  }),
})
