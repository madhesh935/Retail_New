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

export interface StaffTask {
  id: string
  title: string
  category: 'RESTOCK' | 'QUEUE_SUPPORT' | 'SPILL_CLEANUP' | 'SECURITY_CHECK' | 'PLANOGRAM_AUDIT' | 'CUSTOMER_ASSISTANCE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  zoneId: string
  zoneName: string
  assignedStaffId?: string
  assignedStaffName?: string
  sourceIncidentId?: string
  createdAt: string
  etaMinutes: number
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
