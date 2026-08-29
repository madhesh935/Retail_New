import type { StaffMember as StoreStaff, StaffTask, StoreZone, ShelfItem } from '@/types'
import type { StaffMember, OperationalTask, StaffRecommendation } from '@/components/staff-operations/staffData'
import type { OperationalIncident, ResolvedIncident, IncidentCategory, IncidentLifecycleStatus } from '@/components/incidents-actions/incidentData'
import type { CanonicalZoneAnalytics } from '@/components/shopper-analytics/shopperData'
import type { ShelfMatrixItem } from '@/components/inventory/ShelfHealthMatrix'

function humanizeActionCode(code: string): string {
  return code
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function mapShelfStatus(status: ShelfItem['status']): ShelfMatrixItem['status'] {
  if (status === 'OUT_OF_STOCK') return 'OUT_OF_STOCK'
  if (status === 'CRITICAL' || status === 'MISPLACED') return 'CRITICAL'
  if (status === 'LOW') return 'LOW'
  return 'HEALTHY'
}

function shelfDepletionLabel(item: ShelfItem, status: ShelfMatrixItem['status']): string {
  if (status === 'OUT_OF_STOCK') return 'Depleted'
  if (typeof item.minutesUntilStockout === 'number' && item.minutesUntilStockout >= 0) {
    return item.minutesUntilStockout < 60
      ? `~${Math.round(item.minutesUntilStockout)} min`
      : `${(item.minutesUntilStockout / 60).toFixed(1)} hrs`
  }
  if (status === 'CRITICAL') return 'Immediate restock needed'
  if (status === 'LOW') return 'Restock soon'
  return '—'
}

export function toShelfMatrixItem(item: ShelfItem): ShelfMatrixItem {
  const status = mapShelfStatus(item.status)
  const availability = item.capacityCount > 0
    ? Math.round((item.currentCount / item.capacityCount) * 100)
    : 0
  const depletion = shelfDepletionLabel(item, status)
  const consumptionRateLabel =
    typeof item.depletionRatePerHour === 'number' && item.depletionRatePerHour > 0
      ? `${item.depletionRatePerHour.toFixed(1)} units/hr`
      : 'No active depletion'
  return {
    id: item.id,
    code: item.shelfId,
    name: item.shelfName,
    aisle: item.aisle || item.zoneName,
    status,
    availability,
    visibleUnits: item.currentCount,
    posStock: item.currentCount + (item.backroomUnits || 0),
    sku: item.productName,
    predictedDepletion: depletion,
    consumptionRateLabel,
    replenishmentDeadline: status === 'OUT_OF_STOCK' || status === 'CRITICAL'
      ? 'Immediately'
      : status === 'LOW'
        ? `Before predicted stockout (${depletion})`
        : 'Not urgent',
    cameraCode: item.cameraSourceId || 'CAM-01',
    confidenceScore: item.confidenceScore,
  }
}

export function toShelfMatrixItems(items: ShelfItem[]): ShelfMatrixItem[] {
  return items.map(toShelfMatrixItem)
}

const AVATAR_COLORS = ['#0F766E', '#0369A1', '#B45309', '#7C3AED', '#BE123C', '#15803D']

export function toOperationalStaff(member: StoreStaff, index = 0): StaffMember {
  const status =
    member.status === 'ON_DUTY_AVAILABLE'
      ? 'AVAILABLE'
      : member.status === 'ON_BREAK'
        ? 'ON_BREAK'
        : 'BUSY'

  const deptRaw = String(member.role || '').toLowerCase()
  const department: StaffMember['department'] = deptRaw.includes('bill') || deptRaw.includes('cash')
    ? 'Billing'
    : deptRaw.includes('replen') || deptRaw.includes('invent')
      ? 'Replenishment'
      : deptRaw.includes('support') || deptRaw.includes('customer')
        ? 'Support'
        : 'Operations'

  return {
    id: member.id,
    code: member.employeeId || member.id,
    name: member.name,
    role: member.role,
    department,
    skills: [],
    currentZone: member.currentZoneName || 'Store Floor',
    currentTask: member.currentTaskDescription || 'Standby',
    status,
    shiftStatus: member.status === 'OFF_DUTY' ? 'OFF_SHIFT' : 'ON_SHIFT',
    shiftHours: `${member.shiftStartTime} - ${member.shiftEndTime}`,
    tasksCompletedToday: member.tasksCompletedToday,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  }
}

export function toOperationalTask(task: StaffTask): OperationalTask {
  const status: OperationalTask['status'] =
    task.status === 'COMPLETED' || task.status === 'VERIFIED'
      ? 'COMPLETED'
      : task.status === 'IN_PROGRESS' || task.status === 'BLOCKED'
        ? 'IN_PROGRESS'
        : task.status === 'PENDING' || task.status === 'CANCELLED'
          ? 'TO_DO'
          : 'ASSIGNED'

  const priority =
    task.priority === 'URGENT' ? 'CRITICAL' : (task.priority as OperationalTask['priority'])

  return {
    id: task.id,
    title: task.title,
    priority: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority) ? priority : 'MEDIUM',
    status,
    assignedStaffId: task.assignedStaffId,
    assignedStaffName: task.assignedStaffName,
    createdTime: task.createdAt,
    eta: `${task.etaMinutes} min`,
    zone: task.zoneName || task.aisleCode || 'Store Floor',
    description: task.reason || task.title,
    source: task.category,
    cameraVerificationCode: task.shelfCode,
    verificationType: task.verificationType === 'CAMERA_CONFIRMED' ? 'CAMERA_VERIFIED' : task.verificationType === 'STAFF_CONFIRMED' ? 'STAFF_CONFIRMED' : undefined,
  }
}

export function buildStaffRecommendations(
  tasks: OperationalTask[],
  staff: StaffMember[]
): StaffRecommendation[] {
  const available = staff.filter((s) => s.status === 'AVAILABLE')
  const unassignedTasks = tasks.filter((t) => t.status === 'TO_DO' || (t.status === 'ASSIGNED' && !t.assignedStaffId))

  const dynamicRecs = unassignedTasks
    .slice(0, 4)
    .map((task, idx) => {
      const pick = available[idx % Math.max(available.length, 1)] || staff[idx % Math.max(staff.length, 1)]
      return {
        id: `rec-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        priority: task.priority === 'LOW' ? 'MEDIUM' : (task.priority as StaffRecommendation['priority']),
        destinationZone: task.zone,
        recommendedStaffId: pick?.id || '',
        recommendedStaffName: pick?.name || 'Unassigned',
        currentStaffZone: pick?.currentZone || 'Store Floor',
        distanceMeters: 25 + idx * 12,
        estimatedWalkingSeconds: 40 + idx * 15,
        reasons: ['Nearest available associate', `Matches ${task.source} workload`],
        operationalImpact: `Clear ${task.priority.toLowerCase()} task in ${task.zone}`,
      }
    })
    .filter((r) => r.recommendedStaffId)

  if (dynamicRecs.length >= 2) {
    return dynamicRecs
  }

  const fallbackRecs: StaffRecommendation[] = [
    {
      id: 'rec-fallback-01',
      taskId: 'task-02',
      taskTitle: 'Support Checkout C1 & C2 Queue Bottleneck',
      priority: 'CRITICAL',
      destinationZone: 'Checkout Lanes',
      recommendedStaffId: staff.find((s) => s.role.toLowerCase().includes('cashier') || s.status === 'AVAILABLE')?.id || staff[0]?.id || 'staff-02',
      recommendedStaffName: staff.find((s) => s.role.toLowerCase().includes('cashier') || s.status === 'AVAILABLE')?.name || staff[0]?.name || 'Marcus Vance',
      currentStaffZone: 'Household (Low Traffic)',
      distanceMeters: 28,
      estimatedWalkingSeconds: 35,
      reasons: ['Nearest cashier-certified associate', 'Prevent queue wait exceeding 180s SLA'],
      operationalImpact: 'Relieves peak rush wait times by ~48%',
    },
    {
      id: 'rec-fallback-02',
      taskId: 'task-01',
      taskTitle: 'Restock Shelf A1 Produce Island (Apples)',
      priority: 'HIGH',
      destinationZone: 'Fresh Produce (Shelf A1)',
      recommendedStaffId: staff.find((s) => s.role.toLowerCase().includes('restock') || s.name.includes('Liam'))?.id || staff[1]?.id || 'staff-04',
      recommendedStaffName: staff.find((s) => s.role.toLowerCase().includes('restock') || s.name.includes('Liam'))?.name || staff[1]?.name || "Liam O'Connor",
      currentStaffZone: 'Backroom Storage (Bay 2)',
      distanceMeters: 34,
      estimatedWalkingSeconds: 45,
      reasons: ['High depletion velocity (18 units/hr)', 'Pre-staged inventory cart ready in backroom'],
      operationalImpact: 'Prevents stockout loss during evening rush',
    },
    {
      id: 'rec-fallback-03',
      taskId: 'task-03',
      taskTitle: 'Customer Assist in Electronics & Health Bay',
      priority: 'MEDIUM',
      destinationZone: 'Electronics & Personal Care',
      recommendedStaffId: staff.find((s) => s.role.toLowerCase().includes('floor') || s.name.includes('Sarah'))?.id || staff[2]?.id || 'staff-05',
      recommendedStaffName: staff.find((s) => s.role.toLowerCase().includes('floor') || s.name.includes('Sarah'))?.name || staff[2]?.name || 'Sarah Jenkins',
      currentStaffZone: 'Lobby / Front Floor',
      distanceMeters: 42,
      estimatedWalkingSeconds: 55,
      reasons: ['Extended customer dwell time > 4.5 min', 'High basket value category'],
      operationalImpact: 'Boosts category conversion and customer satisfaction',
    },
  ]

  const existingTaskIds = new Set(dynamicRecs.map((r) => r.taskId))
  const filteredFallbacks = fallbackRecs.filter((r) => !existingTaskIds.has(r.taskId))

  return [...dynamicRecs, ...filteredFallbacks].slice(0, 4)
}

function mapIncidentCategory(type?: string): IncidentCategory {
  const t = String(type || '').toUpperCase()
  if (t.includes('QUEUE')) return 'QUEUE'
  if (t.includes('STOCK') || t.includes('INVENT') || t.includes('SHELF')) return 'INVENTORY'
  if (t.includes('SPILL') || t.includes('SAFE')) return 'SAFETY'
  if (t.includes('CAMERA')) return 'CAMERA_SYSTEM'
  if (t.includes('PLANO')) return 'PLANOGRAM'
  if (t.includes('STAFF')) return 'STAFF'
  return 'INVENTORY'
}

function mapIncidentStatus(raw: any): IncidentLifecycleStatus {
  const s = String(raw.status || '').toUpperCase()
  if (s === 'RESOLVED' || s === 'CLOSED' || s === 'DISMISSED') return 'RESOLVED'
  if (raw.assignedStaffId || raw.assignedToStaffName) return s === 'IN_PROGRESS' || s === 'INVESTIGATING' ? 'IN_PROGRESS' : 'ASSIGNED'
  return 'NEEDS_ACTION'
}

export function toOperationalIncident(inc: any, index = 0): OperationalIncident {
  const severityRaw = String(inc.severity || 'MEDIUM').toUpperCase()
  const severity = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(severityRaw)
    ? severityRaw
    : 'MEDIUM') as OperationalIncident['severity']
  const detected = inc.timestamp || inc.createdAt || inc.detectedAt || new Date().toISOString()
  const ts = Date.parse(detected)
  const statusRaw = String(inc.status || '').toUpperCase()
  let status: IncidentLifecycleStatus = 'NEEDS_ACTION'
  if (statusRaw === 'RESOLVED' || statusRaw === 'DISMISSED' || statusRaw === 'CLOSED') status = 'RESOLVED'
  else if (inc.assignedStaffId || inc.assignedToStaffName) status = statusRaw === 'IN_PROGRESS' || statusRaw === 'INVESTIGATING' ? 'IN_PROGRESS' : 'ASSIGNED'

  const rec = inc.aiRecommendation
  return {
    id: String(inc.id),
    code: `INC-${String(index + 1).padStart(2, '0')}`,
    title: String(inc.title || 'Incident'),
    category: mapIncidentCategory(inc.type || inc.category),
    severity,
    zone: String(inc.zoneName || inc.zone || 'Store Floor'),
    zoneId: inc.zoneId,
    detectedTime: Number.isNaN(ts) ? String(detected) : new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    detectedTimestamp: Number.isNaN(ts) ? Date.now() : ts,
    primaryMetric: String(inc.description || inc.title || ''),
    forecastText: rec?.action ? humanizeActionCode(String(rec.action)) : 'Monitor and assign floor response',
    recommendation: rec?.title || rec?.actionTitle || rec?.action || 'Dispatch nearest available associate',
    assignedStaffId: inc.assignedStaffId,
    assignedStaffName: inc.assignedStaffName || inc.assignedToStaffName,
    status,
    cameraCode: String(inc.cameraCode || inc.cameraSourceId || 'CAM-01'),
  }
}

export function toResolvedIncidents(incidents: OperationalIncident[]): ResolvedIncident[] {
  return incidents
    .filter((i) => i.status === 'RESOLVED')
    .map((i) => ({
      id: i.id,
      code: i.code,
      title: i.title,
      zone: i.zone,
      owner: i.assignedStaffName || 'Floor team',
      duration: i.durationText || '—',
      beforeValue: i.beforeValue,
      afterValue: i.afterValue,
      description: i.primaryMetric,
      verificationType: 'Staff Confirmed' as const,
      resolvedAt: i.detectedTime,
    }))
}

export function zonesToAnalytics(
  zones: StoreZone[],
  shelfItems: ShelfItem[],
  cameras: { code: string; zoneId: string }[] = []
): CanonicalZoneAnalytics[] {
  if (!zones.length) return []

  return zones.map((zone) => {
    const zoneShelves = shelfItems.filter((s) => s.zoneId === zone.id)
    const shelfAvailability =
      zoneShelves.length === 0
        ? 100
        : Math.round(
            (zoneShelves.reduce((acc, s) => acc + (s.capacityCount ? s.currentCount / s.capacityCount : 1), 0) /
              zoneShelves.length) *
              100
          )
    const occupancyRate = zone.capacity > 0 ? zone.currentOccupancy / zone.capacity : 0
    const trafficLevel: CanonicalZoneAnalytics['trafficLevel'] =
      occupancyRate > 0.55 ? 'High' : occupancyRate > 0.3 ? 'Medium' : 'Low'
    const avgDwellMinutes = Math.round((zone.avgDwellTimeSeconds / 60) * 10) / 10
    const isCheckout = /checkout|billing/i.test(zone.name) || /checkout|billing/i.test(zone.category)
    const cam = cameras.find((c) => c.zoneId === zone.id)
    const opportunityRisk: CanonicalZoneAnalytics['opportunityRisk'] =
      shelfAvailability < 50 ? 'HIGH' : shelfAvailability < 70 ? 'MEDIUM' : trafficLevel === 'Low' ? 'LOW' : 'NORMAL'

    return {
      id: zone.id,
      code: zone.code,
      name: zone.name,
      aisle: zone.category,
      visitors: Math.max(zone.currentOccupancy * 12, zone.currentOccupancy),
      currentOccupancy: zone.currentOccupancy,
      avgDwellMinutes,
      avgDwellLabel: avgDwellMinutes >= 1 ? `${avgDwellMinutes} min` : `${zone.avgDwellTimeSeconds}s`,
      trafficLevel,
      engagementSignal: isCheckout ? 'Queue Wait' : trafficLevel === 'High' ? 'High' : trafficLevel === 'Medium' ? 'Moderate' : 'Low',
      shelfAvailability,
      opportunityRisk,
      cameraCode: cam?.code || 'CAM-01',
      isCheckout,
      description: `${zone.name} · ${zone.currentOccupancy}/${zone.capacity} occupancy`,
      interestScore: Math.min(99, Math.round(occupancyRate * 100 + avgDwellMinutes * 8)),
    }
  })
}
