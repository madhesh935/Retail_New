export interface StaffMember {
  id: string
  code: string
  name: string
  role: string
  department: 'Billing' | 'Replenishment' | 'Support' | 'Operations'
  skills: string[]
  currentZone: string
  currentTask: string
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK'
  shiftStatus: 'ON_SHIFT' | 'OFF_SHIFT'
  shiftHours: string
  tasksCompletedToday: number
  avatarColor: string
}

export interface OperationalTask {
  id: string
  title: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TO_DO' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  assignedStaffId?: string
  assignedStaffName?: string
  createdTime: string
  eta: string
  zone: string
  description: string
  source: string
  cameraVerificationCode?: string
  verificationType?: 'CAMERA_VERIFIED' | 'STAFF_CONFIRMED'
  beforeAvailability?: number
  afterAvailability?: number
}

export interface StaffRecommendation {
  id: string
  taskId: string
  taskTitle: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  destinationZone: string
  recommendedStaffId: string
  recommendedStaffName: string
  currentStaffZone: string
  distanceMeters: number
  estimatedWalkingSeconds: number
  reasons: string[]
  operationalImpact: string
  isAssigned?: boolean
}

