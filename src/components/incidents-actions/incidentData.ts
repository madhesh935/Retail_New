import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type IncidentCategory = 'QUEUE' | 'INVENTORY' | 'SAFETY' | 'CAMERA_SYSTEM' | 'PLANOGRAM' | 'STAFF'
export type IncidentLifecycleStatus = 'NEEDS_ACTION' | 'ASSIGNED' | 'IN_PROGRESS' | 'MONITORING' | 'RESOLVED'

export interface OperationalIncident {
  id: string
  code: string
  title: string
  category: IncidentCategory
  severity: IncidentSeverity
  zone: string
  zoneId?: string
  detectedTime: string
  detectedTimestamp: number
  primaryMetric: string
  forecastText: string
  recommendation: string
  assignedStaffId?: string
  assignedStaffName?: string
  suggestedStaffId?: string
  suggestedStaffName?: string
  status: IncidentLifecycleStatus
  cameraCode: string
  sourcePageUrl?: string
  sourcePageName?: string
  beforeValue?: string
  afterValue?: string
  durationText?: string
  verificationType?: 'CAMERA_CONFIRMED' | 'STAFF_CONFIRMED' | 'MANAGER_CONFIRMED'
  whyData?: WhyDialogData
}

export interface ResolvedIncident {
  id: string
  code: string
  title: string
  zone: string
  owner: string
  duration: string
  beforeValue?: string
  afterValue?: string
  description: string
  verificationType: 'Camera Confirmed' | 'Staff Confirmed' | 'System Confirmed'
  resolvedAt: string
}
