export interface CanonicalZoneAnalytics {
  id: string
  code: string
  name: string
  aisle: string
  visitors: number
  currentOccupancy: number
  avgDwellMinutes: number
  avgDwellLabel: string
  trafficLevel: 'High' | 'Medium' | 'Low'
  engagementSignal: 'High' | 'Moderate' | 'Low' | 'Queue Wait'
  shelfAvailability: number
  opportunityRisk: 'HIGH' | 'MEDIUM' | 'NORMAL' | 'LOW'
  cameraCode: string
  isCheckout?: boolean
  description: string
  interestScore: number
}

