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

// Exactly 12 staff members on Shift B (14:00 - 22:00)
export const CANONICAL_STAFF: StaffMember[] = [
  {
    id: 'staff-s01',
    code: 'S01',
    name: 'Elena Rostova',
    role: 'Billing Specialist',
    department: 'Billing',
    skills: ['POS Billing', 'Cash Handling', 'Customer Support'],
    currentZone: 'Checkout Counter C1',
    currentTask: 'Serving register queue (5 wait)',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 4,
    avatarColor: '#06B6D4',
  },
  {
    id: 'staff-s02',
    code: 'S02',
    name: 'Marcus Vance',
    role: 'Billing & Customer Care',
    department: 'Billing',
    skills: ['POS Billing', 'Product Assistance', 'Customer Support'],
    currentZone: 'Aisle 3 (Snacks)',
    currentTask: 'None (Standby in zone)',
    status: 'AVAILABLE',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 3,
    avatarColor: '#10B981',
  },
  {
    id: 'staff-s03',
    code: 'S03',
    name: 'Liam O\'Connor',
    role: 'Inventory Replenishment',
    department: 'Replenishment',
    skills: ['Rapid Restock', 'Stockroom Operations', 'Safety'],
    currentZone: 'Stockroom (Bay 3B)',
    currentTask: 'None (Standby in stockroom)',
    status: 'AVAILABLE',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 5,
    avatarColor: '#2DD4BF',
  },
  {
    id: 'staff-s04',
    code: 'S04',
    name: 'Sarah Jenkins',
    role: 'Store Operations Specialist',
    department: 'Operations',
    skills: ['Planogram Compliance', 'Spill Safety', 'Produce Handling'],
    currentZone: 'Produce Perimeter',
    currentTask: 'Produce facing check & safety sweep',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 4,
    avatarColor: '#F59E0B',
  },
  {
    id: 'staff-s05',
    code: 'S05',
    name: 'David Kim',
    role: 'Customer Guidance & Returns',
    department: 'Support',
    skills: ['Customer Assistance', 'Returns / QA', 'Floor Guide'],
    currentZone: 'Entrance Lobby',
    currentTask: 'Assisting shopper with product navigation',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 2,
    avatarColor: '#A855F7',
  },
  {
    id: 'staff-s06',
    code: 'S06',
    name: 'Priya Sharma',
    role: 'Floor Supervisor',
    department: 'Operations',
    skills: ['Cashier Override', 'Escalation Resolution', 'Team Dispatch'],
    currentZone: 'Store Center Floor',
    currentTask: 'Supervisory floor walk',
    status: 'AVAILABLE',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 3,
    avatarColor: '#EC4899',
  },
  {
    id: 'staff-s07',
    code: 'S07',
    name: 'Ananya Patel',
    role: 'Electronics Specialist',
    department: 'Support',
    skills: ['Gadget Advisory', 'Warranty Support', 'High-Value Care'],
    currentZone: 'Electronics Hub',
    currentTask: 'Demonstrating smart display to customer',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 3,
    avatarColor: '#6366F1',
  },
  {
    id: 'staff-s08',
    code: 'S08',
    name: 'Vikram Rao',
    role: 'Inventory Associate',
    department: 'Replenishment',
    skills: ['Chiller Restock', 'Heavy Pallet Handling', 'Dairy Rotation'],
    currentZone: 'Dairy Cooler Wall',
    currentTask: 'Refilling Greek Yogurt C1',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 4,
    avatarColor: '#14B8A6',
  },
  {
    id: 'staff-s09',
    code: 'S09',
    name: 'Chen Wei',
    role: 'Cashier & Express Counter',
    department: 'Billing',
    skills: ['POS Billing', 'Contactless Pay', 'Quick Checkout'],
    currentZone: 'Checkout Counter C2',
    currentTask: 'Processing express payments',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 6,
    avatarColor: '#84CC16',
  },
  {
    id: 'staff-s10',
    code: 'S10',
    name: 'Aisha Khan',
    role: 'Inventory Associate',
    department: 'Replenishment',
    skills: ['Dry Grocery Restock', 'Barcode Auditing', 'Forklift'],
    currentZone: 'Snacks Gondola D2',
    currentTask: 'Refilling roasted almonds bay',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 3,
    avatarColor: '#F97316',
  },
  {
    id: 'staff-s11',
    code: 'S11',
    name: 'Mateo Rossi',
    role: 'Bakery & Deli Associate',
    department: 'Operations',
    skills: ['Bakery Merchandising', 'Fresh Bread Slicing', 'Hygiene'],
    currentZone: 'Bakery Rack C3',
    currentTask: 'Arranging artisan sourdough loaves',
    status: 'BUSY',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 2,
    avatarColor: '#E11D48',
  },
  {
    id: 'staff-s12',
    code: 'S12',
    name: 'Lucas Silva',
    role: 'Billing & Cashiering',
    department: 'Billing',
    skills: ['POS Billing', 'Bagging Support', 'Cash Drops'],
    currentZone: 'Staff Break Area',
    currentTask: 'Scheduled afternoon break (ends 18:50)',
    status: 'ON_BREAK',
    shiftStatus: 'ON_SHIFT',
    shiftHours: '14:00–22:00',
    tasksCompletedToday: 3,
    avatarColor: '#64748B',
  },
]

// Canonical active tasks
export const CANONICAL_TASKS: OperationalTask[] = [
  {
    id: 'task-101',
    title: 'Spill Hazard Cleanup',
    priority: 'HIGH',
    status: 'TO_DO',
    createdTime: '18:42',
    eta: 'Immediate (<2m)',
    zone: 'Produce Perimeter (Aisle A)',
    description: 'Minor moisture spill detected near produce chiller; slip mitigation required.',
    source: 'Store Floor Safety Alert',
  },
  {
    id: 'task-102',
    title: 'Open Counter C3 (Queue Relief)',
    priority: 'CRITICAL',
    status: 'ASSIGNED',
    assignedStaffId: 'S02',
    assignedStaffName: 'Marcus Vance',
    createdTime: '18:41',
    eta: '1 min',
    zone: 'Checkout Register C3',
    description: 'Queue buildup at Counter C1 requires opening Express Counter C3 for evening rush.',
    source: 'Queue Intelligence',
  },
  {
    id: 'task-103',
    title: 'Snack Shelf D2 Restock',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedStaffId: 'S10',
    assignedStaffName: 'Aisha Khan',
    createdTime: '18:35',
    eta: '3 min',
    zone: 'Snacks Gondola D2',
    description: 'Roasted Almonds facing at 24% capacity; 18 units in stockroom ready.',
    source: 'Inventory Intelligence',
  },
  {
    id: 'task-104',
    title: 'Refill Beverage B4 (Cola Zero)',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedStaffId: 'S03',
    assignedStaffName: 'Liam O\'Connor',
    createdTime: '18:38',
    eta: '2 min',
    zone: 'Beverage Gondola B4',
    description: 'Sparkling Cola 12pk visible units dropped to 3 (17% availability). Restocking 24 units.',
    source: 'Inventory Intelligence',
    cameraVerificationCode: 'CAM-04',
    beforeAvailability: 17,
    afterAvailability: 85,
  },
  {
    id: 'task-105',
    title: 'Dairy Chiller C2 Restock',
    priority: 'HIGH',
    status: 'COMPLETED',
    assignedStaffId: 'S08',
    assignedStaffName: 'Vikram Rao',
    createdTime: '18:15',
    eta: 'Completed',
    zone: 'Dairy Cooler Wall (C2)',
    description: 'Whole Milk 1Gal stockout replenished from cold storage.',
    source: 'Inventory Intelligence',
    cameraVerificationCode: 'CAM-03',
    verificationType: 'CAMERA_VERIFIED',
    beforeAvailability: 0,
    afterAvailability: 88,
  },
  {
    id: 'task-106',
    title: 'A4 Planogram Misplacement Fix',
    priority: 'LOW',
    status: 'COMPLETED',
    assignedStaffId: 'S04',
    assignedStaffName: 'Sarah Jenkins',
    createdTime: '17:50',
    eta: 'Completed',
    zone: 'Produce Tier A4',
    description: 'Honeycrisp Apples facing realigned to correct shelf slot.',
    source: 'Planogram Compliance',
    verificationType: 'STAFF_CONFIRMED',
    beforeAvailability: 45,
    afterAvailability: 94,
  },
]

// Canonical recommendations for top urgent tasks
export const CANONICAL_RECOMMENDATIONS: StaffRecommendation[] = [
  {
    id: 'rec-1',
    taskId: 'task-102',
    taskTitle: 'Open Counter C3 (Queue Relief)',
    priority: 'CRITICAL',
    destinationZone: 'Checkout Register C3',
    recommendedStaffId: 'S02',
    recommendedStaffName: 'Marcus Vance',
    currentStaffZone: 'Aisle 3 (Snacks)',
    distanceMeters: 18,
    estimatedWalkingSeconds: 24,
    reasons: [
      'Billing trained',
      'Available now',
      'Closest qualified staff (18m away)',
    ],
    operationalImpact: 'Reduces checkout queue wait time before peak rush',
  },
  {
    id: 'rec-2',
    taskId: 'task-104',
    taskTitle: 'Replenish Beverage B4 (Cola Zero)',
    priority: 'CRITICAL',
    destinationZone: 'Beverage Gondola B4',
    recommendedStaffId: 'S03',
    recommendedStaffName: 'Liam O\'Connor',
    currentStaffZone: 'Stockroom (Bay 3B)',
    distanceMeters: 28,
    estimatedWalkingSeconds: 38,
    reasons: [
      'Replenishment trained',
      'Available now',
      'Backroom stock ready in Bay 3B',
    ],
    operationalImpact: 'Prevents predicted beverage shelf stockout (~9 min)',
  },
]
