export type IncidentSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export type IncidentCategory =
  | 'STOCKOUT_CRITICAL'
  | 'QUEUE_CONGESTION'
  | 'SPILL_HAZARD'
  | 'UNATTENDED_ITEM'
  | 'OCCUPANCY_LIMIT'
  | 'PLANOGRAM_VIOLATION'
  | 'CAMERA_OFFLINE'
  | 'SECURITY_ANOMALY'

export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'DISPATCHED' | 'RESOLVED' | 'DISMISSED'

export interface AiRecommendation {
  id: string
  actionTitle: string
  actionDescription: string
  confidenceScore: number // 0-1
  impactEstimate: string
  recommendedTarget: string
  recommendedStaffRole?: string
  priority: 'URGENT' | 'RECOMMENDED' | 'OPTIONAL'
  state: 'SUGGESTED' | 'EXECUTING' | 'APPLIED' | 'REJECTED'
}

export interface RetailIncident {
  id: string
  title: string
  description: string
  category: IncidentCategory
  severity: IncidentSeverity
  status: IncidentStatus
  zoneId: string
  zoneName: string
  cameraSourceId?: string
  cameraCode?: string
  timestamp: string
  assignedToStaffName?: string
  resolvedAt?: string
  aiRecommendation?: AiRecommendation
  boundingBox?: { x: number; y: number; width: number; height: number }
  snapshotUrl?: string
}

export interface IncidentsAnalyticsPayload {
  activeCount: number
  criticalCount: number
  highCount: number
  avgResolutionMinutes: number
  incidentsTodayTotal: number
  incidents: RetailIncident[]
  recentAiRecommendations: AiRecommendation[]
}
