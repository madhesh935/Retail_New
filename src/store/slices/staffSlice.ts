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
import { MOCK_STAFF } from '@/services/mock/mockData'

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

const INITIAL_TASKS: StaffTask[] = [
  {
    id: 'task-b4-replenish',
    title: 'Refill Beverage B4',
    category: 'RESTOCK',
    priority: 'HIGH',
    status: 'ASSIGNED',
    zoneId: 'zone-4',
    zoneName: 'Beverages & Snacks Aisle',
    shelfCode: 'B4',
    aisleCode: 'Aisle 4',
    productSku: 'SKU-BEV-1029',
    productName: 'Sparkling Cola Zero 12-Pack',
    shelfAvailabilityPercent: 17,
    backroomUnits: 14,
    expectedDepletionMinutes: 9,
    reason: 'Predicted shelf depletion (High footfall velocity)',
    createdAt: '4 mins ago',
    etaMinutes: 8,
    sopSteps: [
      { id: 's1', text: 'Confirm product barcode at Backroom Bay 3B', completed: false },
      { id: 's2', text: 'Retrieve 12 units from stock pallet', completed: false },
      { id: 's3', text: 'Transport to Shelf B4 (Beverages)', completed: false },
      { id: 's4', text: 'Restock shelf & pull front facing forward', completed: false },
    ],
  },
  {
    id: 'task-c3-checkout',
    title: 'Open Checkout Counter C3',
    category: 'QUEUE_SUPPORT',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    zoneId: 'zone-7',
    zoneName: 'Checkout Lanes',
    shelfCode: 'C3',
    aisleCode: 'Lane 3 (Express)',
    reason: 'Queue wait time exceeds 180s threshold (7 shoppers waiting in C2)',
    createdAt: '2 mins ago',
    etaMinutes: 3,
    sopSteps: [
      { id: 'q1', text: 'Log in to POS terminal C3', completed: false },
      { id: 'q2', text: 'Switch lane light to ACTIVE (Green)', completed: false },
      { id: 'q3', text: 'Direct express shoppers from C2 queue', completed: false },
    ],
  },
  {
    id: 'task-b4-spill',
    title: 'Clean water spill near Shelf B4',
    category: 'SPILL_CLEANUP',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    zoneId: 'zone-4',
    zoneName: 'Beverages & Snacks Aisle',
    shelfCode: 'B4 Walkway',
    aisleCode: 'Aisle 4',
    reason: 'Safety hazard detected by Camera 04',
    assignedStaffId: 'STAFF-03',
    assignedStaffName: 'Liam',
    createdAt: '6 mins ago',
    etaMinutes: 5,
    sopSteps: [
      { id: 'sp1', text: 'Secure area & position Yellow Caution Cone', completed: true },
      { id: 'sp2', text: 'Mop liquid thoroughly with absorbent pads', completed: true },
      { id: 'sp3', text: 'Ensure walkway is dry and traction restored', completed: false },
      { id: 'sp4', text: 'Confirm area safe & remove cone', completed: false },
    ],
  },
  {
    id: 'task-b2-facing',
    title: 'Correct facing on Shelf B2',
    category: 'PLANOGRAM_AUDIT',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    zoneId: 'zone-4',
    zoneName: 'Beverages & Snacks Aisle',
    shelfCode: 'B2',
    aisleCode: 'Aisle 4',
    productSku: 'SKU-SNK-402',
    productName: 'Roasted Almonds 200g',
    shelfAvailabilityPercent: 65,
    backroomUnits: 20,
    reason: 'Misplaced SKUs blocking primary facing',
    createdAt: '15 mins ago',
    etaMinutes: 6,
    sopSteps: [
      { id: 'p1', text: 'Relocate misplaced Cashews to Shelf B3', completed: false },
      { id: 'p2', text: 'Align Almonds with shelf price tag', completed: false },
    ],
  },
]

const INITIAL_HANDOVERS: ShiftHandoverItem[] = [
  {
    id: 'ho-1',
    title: 'Shelf B6 price label replacement needed',
    description: 'Promo shelf tag for Sparkling Water 500ml expired at 14:00. New ₹35 label printed in manager office.',
    category: 'WATCH',
    zoneName: 'Beverages',
    shelfCode: 'B6',
    createdAt: '13:50',
    authorName: 'Elena (Shift A)',
  },
  {
    id: 'ho-2',
    title: 'Cooler 2 temperature recheck',
    description: 'Dairy cooler temp rose to 5.2°C during stocking. Compressor reset; recheck required before 16:00.',
    category: 'IN_PROGRESS',
    zoneName: 'Dairy & Chilled',
    shelfCode: 'Cooler 2',
    createdAt: '13:45',
    authorName: 'Marcus (Shift A)',
  },
]

const INITIAL_ANNOUNCEMENTS: StoreAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Checkout surge expected around 17:30',
    content: 'Evening peak traffic forecast. All available floor associates should be prepared for secondary cashier standby.',
    priority: 'URGENT',
    timestamp: '14:05',
    author: 'Tariq (Supervisor)',
    acknowledged: false,
  },
  {
    id: 'ann-2',
    title: 'Beverage delivery arrived in Stockroom Bay 3',
    content: 'Wave Cola and Juice pallets are staged for verification. Restockers can draw directly from Bay 3B.',
    priority: 'NORMAL',
    timestamp: '13:30',
    author: 'Stockroom Lead',
    acknowledged: true,
  },
]

const INITIAL_WORK_RUN: OptimizedWorkRun = {
  id: 'run-b4-opt',
  title: 'Optimized Work Run — Aisle 4 Cluster',
  description: '3 nearby activities bundled for walking efficiency (~8 min saved)',
  taskIds: ['task-b4-replenish', 'task-b4-spill', 'task-b2-facing'],
  estimatedMinutes: 8,
  stops: [
    { sequence: 1, label: 'Pick Cola Zero 12-Pack', zoneName: 'Stockroom Bay 3B', action: 'Collect 12 units' },
    { sequence: 2, label: 'Refill Shelf B4', zoneName: 'Beverages Aisle 4', action: 'Restock & Face' },
    { sequence: 3, label: 'Check Shelf B2 Facing', zoneName: 'Beverages Aisle 4', action: 'Audit Planogram' },
  ],
}

export const createStaffSlice: StateCreator<StaffSlice, [], [], StaffSlice> = (set) => ({
  staffMembers: MOCK_STAFF.staffMembers,
  pendingTasks: INITIAL_TASKS,
  recommendedReallocations: MOCK_STAFF.recommendedReallocations,
  totalStaffOnShift: MOCK_STAFF.totalStaffOnShift,
  availableStaffCount: MOCK_STAFF.availableStaffCount,
  isLoadingStaff: false,

  operationalStatus: 'AVAILABLE',
  handoverItems: INITIAL_HANDOVERS,
  storeAnnouncements: INITIAL_ANNOUNCEMENTS,
  optimizedWorkRun: INITIAL_WORK_RUN,

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
