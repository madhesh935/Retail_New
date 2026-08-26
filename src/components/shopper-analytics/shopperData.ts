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

export const CANONICAL_ZONE_ANALYTICS: CanonicalZoneAnalytics[] = [
  {
    id: 'zone-produce',
    code: 'ZONE-02',
    name: 'Fresh Produce',
    aisle: 'Aisle A',
    visitors: 410,
    currentOccupancy: 28,
    avgDwellMinutes: 3.5,
    avgDwellLabel: '3.5 min',
    trafficLevel: 'High',
    engagementSignal: 'High',
    shelfAvailability: 88,
    opportunityRisk: 'NORMAL',
    cameraCode: 'CAM-02',
    description: 'High footfall with healthy produce shelf availability',
    interestScore: 78,
  },
  {
    id: 'zone-beverages',
    code: 'ZONE-04',
    name: 'Cold Beverages',
    aisle: 'Aisle B',
    visitors: 382,
    currentOccupancy: 14,
    avgDwellMinutes: 0.9,
    avgDwellLabel: '52 sec',
    trafficLevel: 'High',
    engagementSignal: 'High',
    shelfAvailability: 61,
    opportunityRisk: 'HIGH',
    cameraCode: 'CAM-04',
    description: 'High shopper activity combined with limited shelf availability',
    interestScore: 82,
  },
  {
    id: 'zone-dairy',
    code: 'ZONE-03',
    name: 'Dairy & Chilled',
    aisle: 'Aisle C',
    visitors: 315,
    currentOccupancy: 18,
    avgDwellMinutes: 2.8,
    avgDwellLabel: '2.8 min',
    trafficLevel: 'Medium',
    engagementSignal: 'High',
    shelfAvailability: 72,
    opportunityRisk: 'MEDIUM',
    cameraCode: 'CAM-03',
    description: 'Steady replenishment required at milk cooler wall',
    interestScore: 74,
  },
  {
    id: 'zone-electronics',
    code: 'ZONE-06',
    name: 'Electronics',
    aisle: 'Aisle E',
    visitors: 244,
    currentOccupancy: 8,
    avgDwellMinutes: 4.2,
    avgDwellLabel: '4.2 min',
    trafficLevel: 'Medium',
    engagementSignal: 'High',
    shelfAvailability: 89,
    opportunityRisk: 'NORMAL',
    cameraCode: 'CAM-05',
    description: 'Extended browsing and comparison dwell',
    interestScore: 88,
  },
  {
    id: 'zone-household',
    code: 'ZONE-05',
    name: 'Household',
    aisle: 'Aisle D',
    visitors: 180,
    currentOccupancy: 6,
    avgDwellMinutes: 1.9,
    avgDwellLabel: '1.9 min',
    trafficLevel: 'Low',
    engagementSignal: 'Moderate',
    shelfAvailability: 82,
    opportunityRisk: 'LOW',
    cameraCode: 'CAM-06',
    description: 'Targeted pantry restocking loop',
    interestScore: 45,
  },
  {
    id: 'zone-checkout',
    code: 'ZONE-07',
    name: 'Checkout Plaza',
    aisle: 'Front Plaza',
    visitors: 620,
    currentOccupancy: 22,
    avgDwellMinutes: 4.8,
    avgDwellLabel: '4.8 min',
    trafficLevel: 'High',
    engagementSignal: 'Queue Wait',
    shelfAvailability: 100,
    opportunityRisk: 'NORMAL',
    cameraCode: 'CAM-07',
    isCheckout: true,
    description: 'Front checkout registers C1-C4 throughput',
    interestScore: 92,
  },
]

// Top shopping zones (excluding checkout)
export const SHOPPING_ZONES = CANONICAL_ZONE_ANALYTICS.filter((z) => !z.isCheckout)
export const CHECKOUT_ZONE = CANONICAL_ZONE_ANALYTICS.find((z) => z.isCheckout)!
