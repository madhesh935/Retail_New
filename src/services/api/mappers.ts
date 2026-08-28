import type {
  CameraFeed,
  CheckoutQueue,
  InventoryAnalytics,
  ShelfItem,
  StaffMember,
  StaffTask,
  StockStatus,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '@/types'
import type { InventoryBatch, MarkdownCandidate, WasteRecord } from '@/types/expiry.types'
import type { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'

/** Map inventory shelf API rows → ShelfItem used by the manager dashboard. */
export function mapShelfToItem(raw: any): ShelfItem {
  const status = normalizeStockStatus(raw.status, raw.visibleUnits ?? raw.currentSkusCount, raw.capacityCount)
  const capacity = Number(raw.capacityCount ?? 0)
  const visible = Number(raw.visibleUnits ?? raw.currentSkusCount ?? 0)
  const facingCapacity = Number(raw.facingCapacity ?? 4)
  return {
    id: String(raw.id ?? `shelf-${raw.code}`),
    shelfId: String(raw.code ?? raw.id),
    shelfName: String(raw.name ?? `Shelf ${raw.code}`),
    zoneId: String(raw.zoneId ?? ''),
    zoneName: String(raw.zoneName ?? ''),
    sku: String(raw.sku ?? ''),
    productName: String(raw.skuName ?? raw.productName ?? ''),
    brand: String(raw.brand ?? ''),
    category: String(raw.category ?? ''),
    unitPrice: Number(raw.unitPrice ?? 0),
    capacityCount: capacity,
    currentCount: visible,
    facingCapacity,
    currentFacings: Number(raw.currentFacings ?? Math.min(facingCapacity, Math.round((visible / Math.max(capacity, 1)) * facingCapacity))),
    status,
    planogramComplianceScore: Number(raw.complianceScore ?? 0),
    isMisplaced: Boolean(raw.isMisplaced),
    lastRestocked: raw.lastRestocked || new Date().toISOString(),
    expectedRestockTime: raw.expectedRestockTime,
    confidenceScore: Number(raw.confidenceScore ?? 0.9),
    cameraSourceId: String(raw.cameraCode ?? raw.cameraSourceId ?? ''),
    backroomUnits: Number(raw.backroomUnits ?? 0),
  }
}

function normalizeStockStatus(status: unknown, count: number, capacity: number): StockStatus {
  const s = String(status || '').toUpperCase()
  if (s === 'MISPLACED') return 'MISPLACED'
  if (s === 'OUT_OF_STOCK' || count <= 0) return 'OUT_OF_STOCK'
  if (s === 'CRITICAL' || (capacity > 0 && count / capacity < 0.15)) return 'CRITICAL'
  if (s === 'LOW' || (capacity > 0 && count / capacity < 0.35)) return 'LOW'
  return 'OPTIMAL'
}

export function buildInventoryAnalytics(items: ShelfItem[]): InventoryAnalytics {
  const stockouts = items.filter((i) => i.status === 'OUT_OF_STOCK')
  const critical = items.filter((i) => i.status === 'CRITICAL' || i.status === 'LOW')
  const misplaced = items.filter((i) => i.isMisplaced)
  const compliance =
    items.length === 0
      ? 0
      : Math.round(items.reduce((acc, i) => acc + i.planogramComplianceScore, 0) / items.length)

  return {
    totalSkusMonitored: items.length,
    totalShelfSections: new Set(items.map((i) => i.shelfId)).size,
    overallPlanogramCompliance: compliance,
    activeStockoutsCount: stockouts.length,
    criticalLowStockCount: critical.length,
    misplacedItemsCount: misplaced.length,
    estimatedStockoutRevenueLoss: stockouts.reduce((acc, i) => acc + i.unitPrice * 8, 0),
    topVulnerableSkus: [...items]
      .filter((i) => i.status !== 'OPTIMAL')
      .sort((a, b) => a.currentCount - b.currentCount)
      .slice(0, 5)
      .map((i) => ({
        sku: i.sku,
        productName: i.productName,
        currentStock: i.currentCount,
        depletionRatePerHour: Math.max(1, Math.round((i.capacityCount - i.currentCount) / 4)),
        minutesUntilStockout: i.currentCount <= 0 ? 0 : Math.max(5, i.currentCount * 12),
      })),
  }
}

export function mapCamera(raw: any): CameraFeed {
  const statusRaw = String(raw.status || 'ONLINE').toUpperCase()
  const status: CameraFeed['status'] =
    statusRaw === 'DEGRADED' || statusRaw === 'OFFLINE' || statusRaw === 'CONNECTING'
      ? statusRaw
      : 'ONLINE'

  return {
    id: String(raw.id ?? raw.code),
    name: String(raw.name ?? raw.code),
    code: String(raw.code ?? ''),
    zoneId: String(raw.zoneId ?? ''),
    zoneName: String(raw.zoneName ?? ''),
    rtspUrl: String(raw.rtspUrl ?? raw.stream_url ?? ''),
    snapshotUrl: raw.snapshotUrl,
    status,
    resolution: String(raw.resolution ?? '1920x1080'),
    fps: Number(raw.fps ?? 0),
    targetFps: Number(raw.targetFps ?? 30),
    inferenceLatencyMs: Number(raw.inferenceLatencyMs ?? 0),
    modelLoaded: String(raw.modelLoaded ?? 'YOLOv8'),
    aiTasks: Array.isArray(raw.aiTasks) ? raw.aiTasks : [],
    uptimePercent: Number(raw.uptimePercent ?? 99),
    activeDetectionsCount: Number(raw.activeDetectionsCount ?? 0),
    lensFov: String(raw.lensFov ?? '90°'),
    ipAddress: String(raw.ipAddress ?? ''),
    macAddress: String(raw.macAddress ?? ''),
    lastHeartbeat: String(raw.lastHeartbeat ?? new Date().toISOString()),
  }
}

export function mapQueueLane(raw: any): CheckoutQueue {
  const statusRaw = String(raw.status || 'ACTIVE').toUpperCase()
  const status: CheckoutQueue['status'] =
    statusRaw === 'CONGESTED' || statusRaw === 'STANDBY' || statusRaw === 'CLOSED'
      ? statusRaw
      : 'ACTIVE'

  const laneTypeRaw = String(raw.laneType || raw.type || 'REGULAR_CASHIER').toUpperCase()
  const laneType: CheckoutQueue['laneType'] =
    laneTypeRaw.includes('SELF')
      ? 'SELF_CHECKOUT'
      : laneTypeRaw.includes('EXPRESS')
        ? 'EXPRESS_10_ITEMS'
        : laneTypeRaw.includes('PRIORITY')
          ? 'PRIORITY'
          : 'REGULAR_CASHIER'

  return {
    // Always normalize to the app-wide "lane-N" id convention (used by the YOLO
    // WebSocket updates, background camera processor, and digital twin) — the
    // backend's raw id/laneCode is a display code like "C1", not this key.
    id: `lane-${Number(raw.laneNumber ?? 0)}`,
    laneNumber: Number(raw.laneNumber ?? 0),
    laneType,
    status,
    assignedStaffId: raw.assignedStaffId,
    assignedStaffName: raw.assignedStaffName ?? raw.cashierName,
    currentQueueLength: Number(raw.currentQueueLength ?? raw.queue_length ?? 0),
    currentWaitTimeSeconds: Number(raw.currentWaitTimeSeconds ?? raw.wait_time_seconds ?? 0),
    processingRateItemsPerMinute: Number(raw.processingRateItemsPerMinute ?? 18),
    predictedQueueIn10Min: Number(raw.predictedQueueIn10Min ?? 0),
    predictedWaitTimeIn10MinSeconds: Number(raw.predictedWaitTimeIn10MinSeconds ?? 0),
    cameraSourceId: String(raw.cameraCode ?? raw.cameraSourceId ?? ''),
    lastStateChange: String(raw.lastStateChange ?? new Date().toISOString()),
  }
}

export function mapStaffMember(raw: any): StaffMember {
  const statusRaw = String(raw.status || '').toUpperCase()
  let status: StaffMember['status'] = 'OFF_DUTY'
  if (statusRaw === 'AVAILABLE' || statusRaw === 'ON_DUTY_AVAILABLE') status = 'ON_DUTY_AVAILABLE'
  else if (statusRaw === 'BUSY' || statusRaw === 'ON_DUTY_BUSY' || statusRaw === 'DISPATCHED') status = 'ON_DUTY_BUSY'
  else if (statusRaw === 'ON_BREAK') status = 'ON_BREAK'

  const roleRaw = String(raw.role || 'FLOOR_ASSOCIATE').toUpperCase()
  let role: StaffMember['role'] = 'FLOOR_ASSOCIATE'
  if (roleRaw.includes('CASHIER') || roleRaw.includes('BILLING')) role = 'CASHIER'
  else if (roleRaw.includes('INVENTORY') || roleRaw.includes('REPLENISH')) role = 'INVENTORY_RESTOCKER'
  else if (roleRaw.includes('SECURITY')) role = 'SECURITY'
  else if (roleRaw.includes('SUPERVISOR') || roleRaw.includes('LEAD')) role = 'SUPERVISOR'
  else if (roleRaw.includes('CUSTOMER') || roleRaw.includes('SUPPORT') || roleRaw.includes('GUIDANCE')) role = 'CUSTOMER_SERVICE'

  const shift = String(raw.shift || '')
  const [shiftStart, shiftEnd] = shift.includes('-')
    ? shift.split('-').map((s: string) => s.trim())
    : [raw.shiftStartTime || '14:00', raw.shiftEndTime || '22:00']

  return {
    id: String(raw.id),
    name: String(raw.name),
    employeeId: String(raw.employeeId ?? raw.employee_id ?? ''),
    role,
    status,
    currentZoneId: raw.currentZoneId,
    currentZoneName: raw.zone ?? raw.currentZoneName,
    currentTaskDescription: raw.currentTaskDescription,
    shiftStartTime: shiftStart,
    shiftEndTime: shiftEnd,
    efficiencyScore: Number(raw.performanceScore ?? raw.efficiencyScore ?? 90),
    tasksCompletedToday: Number(raw.tasksCompletedToday ?? 0),
    contactChannel: String(raw.contactChannel ?? 'Radio'),
  }
}

const TASK_CATEGORY_MAP: Record<string, TaskCategory> = {
  RESTOCK: 'RESTOCK',
  QUEUE_SUPPORT: 'QUEUE_SUPPORT',
  SPILL_CLEANUP: 'SPILL_CLEANUP',
  SECURITY_CHECK: 'SECURITY_CHECK',
  PLANOGRAM_AUDIT: 'PLANOGRAM_AUDIT',
  CUSTOMER_ASSIST: 'CUSTOMER_ASSISTANCE',
  CUSTOMER_ASSISTANCE: 'CUSTOMER_ASSISTANCE',
  SHELF_INSPECTION: 'SHELF_INSPECTION',
  FACILITY: 'FACILITY',
  EXPIRY_CHECK: 'EXPIRY_CHECK',
  STOCK_ROTATION: 'STOCK_ROTATION',
  MARKDOWN_APPLICATION: 'MARKDOWN_APPLICATION',
  REMOVE_EXPIRED: 'REMOVE_EXPIRED',
  WASTE_RECORDING: 'WASTE_RECORDING',
}

export function mapStaffTask(raw: any): StaffTask {
  const details = raw.details || {}
  const type = String(raw.type || raw.category || 'FACILITY').toUpperCase()
  const category = TASK_CATEGORY_MAP[type] || 'FACILITY'
  const priorityRaw = String(raw.priority || 'MEDIUM').toUpperCase()
  const priority = (['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL'].includes(priorityRaw)
    ? priorityRaw
    : 'MEDIUM') as TaskPriority
  const statusRaw = String(raw.status || 'PENDING').toUpperCase()
  const normalizedStatus = statusRaw === 'ASSISTING' ? 'IN_PROGRESS' : statusRaw
  const status = (['PENDING', 'DISPATCHED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'VERIFIED', 'CANCELLED'].includes(normalizedStatus)
    ? normalizedStatus
    : 'PENDING') as TaskStatus

  const location = String(raw.targetLocation || raw.target_location || '')
  const shelfMatch = location.match(/\b([A-G]\d)\b/)
  const description = String(raw.description || '')
  const persistedSopSteps = Array.isArray(details.sop_steps) ? details.sop_steps : null

  return {
    id: String(raw.id),
    title: String(raw.title),
    category,
    priority,
    status,
    zoneId: String(details.zone_id || ''),
    zoneName: location.split('—')[0]?.trim() || location || 'Store Floor',
    shelfCode: details.shelf_code || shelfMatch?.[1],
    aisleCode: location.includes('Aisle') ? location : undefined,
    productSku: details.sku,
    productName: details.product_name,
    shelfAvailabilityPercent: details.availability,
    backroomUnits: details.backroom_units,
    expectedDepletionMinutes: details.stockout_minutes,
    reason: description,
    assignedStaffId: raw.assignedStaffId || raw.assigned_staff_id,
    assignedStaffName: raw.assignedStaffName || raw.assigned_staff_name,
    sourceIncidentId: details.source_incident_id,
    createdAt: formatRelativeTime(raw.createdAt || raw.created_at),
    etaMinutes: Number(details.eta_minutes ?? 5),
    sopSteps: persistedSopSteps
      ? persistedSopSteps.map((step: any, index: number) => ({
          id: String(step.id || `${raw.id}-s${index + 1}`),
          text: String(step.text || 'Complete operational step'),
          completed: Boolean(step.completed),
        }))
      : [
          { id: `${raw.id}-s1`, text: 'Confirm task location on floor map', completed: status === 'COMPLETED' },
          { id: `${raw.id}-s2`, text: description || 'Complete assigned operational steps', completed: status === 'COMPLETED' },
          { id: `${raw.id}-s3`, text: 'Verify completion and update status', completed: status === 'COMPLETED' },
        ],
    blockerReason: details.blocker_reason,
    blockerNote: details.blocker_note,
    beforePhoto: details.blocker_photo,
    assistanceRequested: Boolean(details.assistance_requested),
    assistanceReason: details.assistance_reason,
    batchId: details.batch_id,
    batchNumber: details.batch_number,
    wasteQuantity: details.quantity,
    verificationType: details.verification,
  }
}

function formatRelativeTime(value?: string | null): string {
  if (!value) return 'Just now'
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return String(value)
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.round(mins / 60)
  return `${hrs} hr${hrs === 1 ? '' : 's'} ago`
}

export function mapCustomerAssistTask(raw: any): CustomerHelpRequest | null {
  const type = String(raw.type || '').toUpperCase()
  if (type !== 'CUSTOMER_ASSIST' && type !== 'CUSTOMER_ASSISTANCE') return null
  const data = raw.customerRequestData || raw.customer_request_data || {}
  const statusRaw = String(raw.status || 'PENDING').toUpperCase()
  const assignedId = raw.assignedStaffId || raw.assigned_staff_id
  const assignedName = raw.assignedStaffName || raw.assigned_staff_name

  let status: CustomerHelpRequest['status'] = 'REQUESTED'
  if (statusRaw === 'PENDING' && !assignedId) status = 'REQUESTED'
  else if (statusRaw === 'PENDING' && assignedId) status = 'ASSIGNED'
  else if (statusRaw === 'ASSISTING') status = 'ASSISTING'
  else if (statusRaw === 'IN_PROGRESS' || statusRaw === 'ASSIGNED') status = assignedId ? 'ACCEPTED' : 'ASSIGNED'
  else if (statusRaw === 'COMPLETED') status = 'COMPLETED'
  else if (statusRaw === 'CANCELLED') status = 'CANCELLED'
  else if (statusRaw === 'BLOCKED') status = 'UNAVAILABLE'

  return {
    id: String(raw.id),
    requestType: (data.request_type || 'GENERAL_ASSISTANCE').toUpperCase().replace(/ /g, '_') as CustomerHelpRequest['requestType'],
    typeLabel: String(raw.title || 'Customer Assist'),
    productName: data.product_name,
    shelfCode: data.shelf_code,
    // No fabricated zone fallback — 'zone-1' is the real entrance zone, and
    // defaulting to it would falsely pin every unlocated request there on the
    // digital twin. An unrecognized id resolves to "no position" instead.
    zoneId: data.location_zone || 'zone-unknown',
    zoneName: data.location_zone || String(raw.targetLocation || 'Store Floor'),
    message: String(raw.description || data.customer_notes || ''),
    receivedAt: formatRelativeTime(raw.createdAt || raw.created_at),
    status,
    assignedStaffId: assignedId,
    assignedStaffName: assignedName,
    isBackroomFlow: String(data.request_type || '').toUpperCase() === 'BACKROOM_REQUEST',
    backroomBay: data.backroom_bay,
    backroomItemFound:
      typeof data.backroom_item_found === 'boolean' ? data.backroom_item_found : undefined,
    messages: (Array.isArray(data.messages) ? data.messages : []).map((message: any, index: number) => ({
      id: String(message.id || `message-${raw.id}-${index}`),
      sender:
        String(message.sender || '').toUpperCase() === 'ASSOCIATE'
          ? ('ASSOCIATE' as const)
          : ('CUSTOMER' as const),
      text: String(message.text || ''),
      timestamp: formatMessageTimestamp(message.timestamp),
    })),
    timeline: [
      {
        status: 'REQUESTED',
        title: 'Request received',
        timestamp: formatRelativeTime(raw.createdAt || raw.created_at),
      },
    ],
  }
}

function formatMessageTimestamp(value?: string | null): string {
  if (!value) return 'Just now'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function mapInventoryBatch(raw: any): InventoryBatch {
  return {
    id: String(raw.id),
    storeId: String(raw.storeId || 'store-01'),
    productId: String(raw.productId || ''),
    productSku: String(raw.productSku || ''),
    productName: String(raw.productName || ''),
    category: String(raw.category || ''),
    batchNumber: String(raw.batchNumber || ''),
    quantity: Number(raw.quantity ?? 0),
    shelfQuantity: Number(raw.shelfQuantity ?? 0),
    backroomQuantity: Number(raw.backroomQuantity ?? 0),
    receivedAt: String(raw.receivedAt || new Date().toISOString()),
    expiresAt: String(raw.expiresAt || new Date().toISOString()),
    storageLocationId: String(raw.storageLocationId || raw.shelfCode || 'loc-unknown'),
    shelfId: raw.shelfId,
    shelfCode: raw.shelfCode,
    unitCost: Number(raw.unitCost ?? 0),
    unitPrice: Number(raw.unitPrice ?? 0),
    status: (raw.status || 'ACTIVE') as InventoryBatch['status'],
    source: (raw.source || 'ERP') as InventoryBatch['source'],
    updatedAt: new Date().toISOString(),
  }
}

export function mapMarkdownCandidate(raw: any): MarkdownCandidate {
  const expiresAt = String(raw.expiresAt || '')
  const hoursRemaining = expiresAt
    ? Math.max(0, Math.round((Date.parse(expiresAt) - Date.now()) / 3600000))
    : Number(raw.hoursRemaining ?? 0)
  return {
    id: String(raw.id),
    batchId: String(raw.batchId || ''),
    productId: String(raw.productId || ''),
    productSku: String(raw.productSku || ''),
    productName: String(raw.productName || ''),
    category: String(raw.category || ''),
    shelfCode: String(raw.shelfCode || ''),
    currentPrice: Number(raw.currentPrice ?? 0),
    suggestedDiscountPercent: Number(raw.suggestedDiscountPercent ?? 0),
    suggestedNewPrice: Number(raw.suggestedNewPrice ?? 0),
    remainingQuantity: Number(raw.remainingQuantity ?? 0),
    atRiskQuantity: Number(raw.atRiskQuantity ?? 0),
    expiresAt,
    hoursRemaining,
    reason: String(raw.reason || ''),
    status: (raw.status || 'RECOMMENDED') as MarkdownCandidate['status'],
  }
}

export function mapWasteRecord(raw: any): WasteRecord {
  return {
    id: String(raw.id),
    storeId: String(raw.storeId || 'store-01'),
    productId: String(raw.productId || ''),
    productSku: String(raw.productSku || ''),
    productName: String(raw.productName || ''),
    batchId: raw.batchId,
    batchNumber: raw.batchNumber,
    quantity: Number(raw.quantity ?? 0),
    reason: (raw.reason || 'EXPIRED') as WasteRecord['reason'],
    recordedByStaffId: String(raw.recordedByStaffId || ''),
    recordedByStaffName: String(raw.recordedByStaffName || ''),
    locationId: String(raw.locationId || raw.locationName || 'unknown'),
    locationName: String(raw.locationName || ''),
    recordedAt: String(raw.recordedAt || new Date().toISOString()),
    unitCost: Number(raw.unitCost ?? 0),
    totalLossCost: Number(raw.totalLossCost ?? 0),
    notes: raw.notes,
  }
}

/** Normalize customer catalog products from /customer/catalog */
export function mapCustomerProduct(raw: any): {
  id: string
  name: string
  brand: string
  category: string
  price: string
  priceNum: number
  aisle: string
  shelf: string
  stockCount: number
  isAvailable: boolean
  isLowStock?: boolean
  backroomStock?: number
  mapCoord: { x: number; y: number }
  alternatives?: { id: string; name: string; shelf: string; price: string; isAvailable: boolean }[]
} {
  const alts = Array.isArray(raw.alternatives) ? raw.alternatives : []
  return {
    id: String(raw.id),
    name: String(raw.name),
    brand: String(raw.brand || ''),
    category: String(raw.category || ''),
    price: typeof raw.price === 'string' ? raw.price : `₹${raw.priceNum ?? raw.price ?? 0}`,
    priceNum: Number(raw.priceNum ?? raw.price ?? 0),
    aisle: String(raw.aisle || ''),
    shelf: String(raw.shelf || ''),
    stockCount: Number(raw.stockCount ?? 0),
    isAvailable: Boolean(raw.isAvailable ?? (raw.stockCount ?? 0) > 0),
    isLowStock: Boolean(raw.isLowStock),
    backroomStock: raw.backroomStock,
    mapCoord: {
      x: Number(raw.mapCoord?.x ?? raw.map_x ?? 0),
      y: Number(raw.mapCoord?.y ?? raw.map_y ?? 0),
    },
    alternatives: alts.map((a: any) => ({
      id: String(a.id ?? a.productId ?? ''),
      name: String(a.name ?? ''),
      shelf: String(a.shelf ?? ''),
      price: typeof a.price === 'string' ? a.price : `₹${a.price ?? 0}`,
      isAvailable: a.isAvailable !== false,
    })),
  }
}
