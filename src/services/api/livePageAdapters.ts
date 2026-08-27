import type { StaffMember as StoreStaff, StaffTask, StoreZone, ShelfItem } from '@/types'
import type { StaffMember, OperationalTask, StaffRecommendation } from '@/components/staff-operations/staffData'
import type { OperationalIncident, ResolvedIncident, IncidentCategory, IncidentLifecycleStatus } from '@/components/incidents-actions/incidentData'
import type { CanonicalZoneAnalytics } from '@/components/shopper-analytics/shopperData'

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
  return tasks
    .filter((t) => t.status === 'TO_DO' || (t.status === 'ASSIGNED' && !t.assignedStaffId))
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
        currentStaffZone: pick?.currentZone || 'Floor',
        distanceMeters: 25 + idx * 12,
        estimatedWalkingSeconds: 40 + idx * 15,
        reasons: ['Nearest available associate', `Matches ${task.source} workload`],
        operationalImpact: `Clear ${task.priority.toLowerCase()} task in ${task.zone}`,
      }
    })
    .filter((r) => r.recommendedStaffId)
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
    forecastText: rec?.action || rec?.actionDescription || 'Monitor and assign floor response',
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
