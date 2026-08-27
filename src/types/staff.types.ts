export type StaffRole = 'CASHIER' | 'FLOOR_ASSOCIATE' | 'INVENTORY_RESTOCKER' | 'SECURITY' | 'SUPERVISOR' | 'CUSTOMER_SERVICE'
export type StaffStatus = 'ON_DUTY_AVAILABLE' | 'ON_DUTY_BUSY' | 'ON_BREAK' | 'OFF_DUTY' | 'DISPATCHED'

export interface StaffMember {
  id: string
  name: string
  employeeId: string
  role: StaffRole
  status: StaffStatus
  currentZoneId?: string
  currentZoneName?: string
  currentTaskDescription?: string
  shiftStartTime: string
  shiftEndTime: string
  efficiencyScore: number // 0-100
  tasksCompletedToday: number
  avatarUrl?: string
  contactChannel: string
}

export type TaskStatus = 'PENDING' | 'DISPATCHED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'
export type TaskCategory = 'RESTOCK' | 'QUEUE_SUPPORT' | 'SPILL_CLEANUP' | 'SECURITY_CHECK' | 'PLANOGRAM_AUDIT' | 'CUSTOMER_ASSISTANCE' | 'SHELF_INSPECTION' | 'FACILITY'

export interface TaskSopStep {
  id: string
  text: string
  completed: boolean
}

export type BlockerReason =
  | 'PRODUCT_UNAVAILABLE'
  | 'BACKROOM_STOCK_UNAVAILABLE'
  | 'LOCATION_BLOCKED'
  | 'EQUIPMENT_UNAVAILABLE'
  | 'NEED_ANOTHER_WORKER'
  | 'CUSTOMER_OCCUPYING_AREA'
  | 'SAFETY_CONCERN'
  | 'MANAGER_ASSISTANCE_NEEDED'
  | 'OTHER'

export type VerificationType = 'STAFF_CONFIRMED' | 'CAMERA_CONFIRMED' | 'SYSTEM_CONFIRMED' | 'MANAGER_CONFIRMED'

export interface StaffTask {
  id: string
  title: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  zoneId: string
  zoneName: string
  shelfCode?: string
  aisleCode?: string
  productSku?: string
  productName?: string
  shelfAvailabilityPercent?: number
  backroomUnits?: number
  expectedDepletionMinutes?: number
  reason?: string
  assignedStaffId?: string
  assignedStaffName?: string
  sourceIncidentId?: string
  createdAt: string
  etaMinutes: number
  sopSteps?: TaskSopStep[]
  blockerReason?: BlockerReason
  blockerNote?: string
  blockerTimestamp?: string
  assistanceRequested?: boolean
  assistanceReason?: string
  beforePhoto?: string
  afterPhoto?: string
  verificationType?: VerificationType
  verifiedAt?: string
  isOptimizedRun?: boolean
  runSequence?: number
}

export interface OptimizedWorkRun {
  id: string
  title: string
  description: string
  taskIds: string[]
  estimatedMinutes: number
  stops: {
    sequence: number
    label: string
    zoneName: string
    action: string
  }[]
}

export interface ShiftHandoverItem {
  id: string
  title: string
  description: string
  category: 'WATCH' | 'IN_PROGRESS' | 'BLOCKED' | 'GENERAL'
  zoneName?: string
  shelfCode?: string
  createdAt: string
  authorName: string
}

export interface StoreAnnouncement {
  id: string
  title: string
  content: string
  priority: 'NORMAL' | 'URGENT'
  timestamp: string
  author: string
  acknowledged?: boolean
}

export interface StaffOperationsPayload {
  totalStaffOnShift: number
  availableStaffCount: number
  busyStaffCount: number
  breakStaffCount: number
  activeTasksCount: number
  staffMembers: StaffMember[]
  pendingTasks: StaffTask[]
  recommendedReallocations: {
    staffId: string
    staffName: string
    currentZone: string
    recommendedZone: string
    reason: string
    urgency: 'HIGH' | 'MEDIUM'
  }[]
}

export type AttendanceStatus = 'NOT_CHECKED_IN' | 'PRESENT' | 'LATE' | 'ON_BREAK' | 'CHECKED_OUT'

export interface AttendanceStateModel {
  status: AttendanceStatus
  checkInAt?: string
  checkOutAt?: string
  shiftId?: string
  shiftStart?: string
  shiftEnd?: string
  storeId?: string
  storeName?: string
  verificationMethod?: string
}

export interface AuthenticatedStaff {
  id: string
  name: string
  employeeId: string
  role: string
  storeId: string
  storeName: string
  shift: string
  zoneName?: string
}
