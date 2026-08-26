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

export const CANONICAL_INCIDENTS: OperationalIncident[] = [
  // 1. Critical Queue Congestion at Counter C1
  {
    id: 'inc-01',
    code: 'INC-701',
    title: 'Checkout Congestion',
    category: 'QUEUE',
    severity: 'CRITICAL',
    zone: 'Checkout C1',
    zoneId: 'zone-checkout',
    detectedTime: '18:42',
    detectedTimestamp: Date.now() - 3 * 60 * 1000,
    primaryMetric: '8 customers · ~5.4 min wait',
    forecastText: 'Predicted 13 customers in ~5 min',
    recommendation: 'Open Standby Counter C3',
    suggestedStaffId: 'S02',
    suggestedStaffName: 'Marcus Vance',
    status: 'NEEDS_ACTION',
    cameraCode: 'CAM-06',
    sourcePageUrl: '/queues',
    sourcePageName: 'Queue Intelligence',
    whyData: {
      title: 'Counter C1 Congestion Prediction & Rate Breakdown',
      actionType: 'QUEUE',
      targetEntity: 'Checkout Counter C1',
      signals: [
        { label: 'Current Queue Depth', value: '8 shoppers', highlight: true },
        { label: 'Arrival Rate (λ)', value: '2.8 / min' },
        { label: 'Service Rate (μ)', value: '1.5 / min' },
        { label: 'Forecast +5 min', value: '13 shoppers', highlight: true },
      ],
      threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
      confidence: '92% telemetry confidence',
      conclusion: 'Open Standby Counter C3 and assign Marcus Vance (S02)',
      edgeModel: 'Queue Analysis Stream',
    },
  },
  // 2. Critical Queue Delay at Counter C2
  {
    id: 'inc-02',
    code: 'INC-702',
    title: 'Express Lane Queue Delay',
    category: 'QUEUE',
    severity: 'CRITICAL',
    zone: 'Checkout C2',
    zoneId: 'zone-checkout',
    detectedTime: '18:39',
    detectedTimestamp: Date.now() - 6 * 60 * 1000,
    primaryMetric: '7 customers · ~4.9 min wait',
    forecastText: 'Predicted 11 customers in ~5 min',
    recommendation: 'Deploy contactless checkout support',
    assignedStaffId: 'S09',
    assignedStaffName: 'Chen Wei',
    status: 'IN_PROGRESS',
    cameraCode: 'CAM-07',
    sourcePageUrl: '/queues',
    sourcePageName: 'Queue Intelligence',
  },
  // 3. High Shelf Depletion at Beverage B4
  {
    id: 'inc-03',
    code: 'INC-703',
    title: 'Shelf Depletion (Cola Zero)',
    category: 'INVENTORY',
    severity: 'HIGH',
    zone: 'Beverage B4',
    zoneId: 'zone-beverages',
    detectedTime: '18:38',
    detectedTimestamp: Date.now() - 7 * 60 * 1000,
    primaryMetric: '17% availability (3 units)',
    forecastText: 'Predicted empty in ~9 min',
    recommendation: 'Replenish 24 units from Backroom Bay 3B',
    assignedStaffId: 'S03',
    assignedStaffName: 'Liam O\'Connor',
    status: 'IN_PROGRESS',
    cameraCode: 'CAM-04',
    sourcePageUrl: '/inventory',
    sourcePageName: 'Inventory Intelligence',
    whyData: {
      title: 'Replenishment Priority: Beverage B4',
      actionType: 'STOCKOUT',
      targetEntity: 'Shelf B4 — Cold Beverages',
      signals: [
        { label: 'Current Visible Units', value: '3 units', highlight: true },
        { label: 'Consumption Velocity', value: '0.33 units / min' },
        { label: 'Backroom Available', value: '24 units (Bay 3B)' },
        { label: 'Predicted Stockout', value: '9 min', highlight: true },
      ],
      threshold: '< 25% Shelf Stockout Threshold',
      confidence: '94% inventory confidence',
      conclusion: 'Replenish 24 units from stockroom bay 3B to prevent peak stockout',
      edgeModel: 'Shelf Inventory Vision',
    },
  },
  // 4. High Floor Spill in Produce
  {
    id: 'inc-04',
    code: 'INC-704',
    title: 'Liquid Spill Hazard',
    category: 'SAFETY',
    severity: 'HIGH',
    zone: 'Produce Perimeter',
    zoneId: 'zone-produce',
    detectedTime: '18:40',
    detectedTimestamp: Date.now() - 5 * 60 * 1000,
    primaryMetric: 'Moisture puddle detected (1.2m area)',
    forecastText: 'Slip & fall customer safety risk',
    recommendation: 'Secure area with caution cones & dry mop',
    assignedStaffId: 'S04',
    assignedStaffName: 'Sarah Jenkins',
    status: 'IN_PROGRESS',
    cameraCode: 'CAM-02',
    sourcePageUrl: '/staff',
    sourcePageName: 'Staff Operations',
  },
  // 5. High Chiller Temp Drift
  {
    id: 'inc-05',
    code: 'INC-705',
    title: 'Chiller Temp Drift (+2.4°C)',
    category: 'INVENTORY',
    severity: 'HIGH',
    zone: 'Dairy Cooler Wall',
    zoneId: 'zone-dairy',
    detectedTime: '18:30',
    detectedTimestamp: Date.now() - 15 * 60 * 1000,
    primaryMetric: 'Temp: +6.4°C (Target: ≤ 4.0°C)',
    forecastText: 'Cold chain compliance warning',
    recommendation: 'Verify cooler door seal & temperature gauge',
    assignedStaffId: 'S08',
    assignedStaffName: 'Vikram Rao',
    status: 'ASSIGNED',
    cameraCode: 'CAM-03',
    sourcePageUrl: '/inventory',
    sourcePageName: 'Inventory Intelligence',
  },
  // 6. High Aisle Obstruction
  {
    id: 'inc-06',
    code: 'INC-706',
    title: 'Aisle Cart Obstruction',
    category: 'SAFETY',
    severity: 'HIGH',
    zone: 'Aisle 3 (Snacks)',
    zoneId: 'zone-household',
    detectedTime: '18:36',
    detectedTimestamp: Date.now() - 9 * 60 * 1000,
    primaryMetric: 'Unattended restocking cart in transit path',
    forecastText: 'Shopper bottleneck in high-traffic aisle',
    recommendation: 'Return restocking cart to bay',
    suggestedStaffId: 'S02',
    suggestedStaffName: 'Marcus Vance',
    status: 'NEEDS_ACTION',
    cameraCode: 'CAM-05',
    sourcePageUrl: '/staff',
    sourcePageName: 'Staff Operations',
  },
  // 7. Medium Camera Optical Quality Degraded
  {
    id: 'inc-07',
    code: 'INC-707',
    title: 'Camera C04 Image Quality Degraded',
    category: 'CAMERA_SYSTEM',
    severity: 'MEDIUM',
    zone: 'Overhead Cam C04',
    zoneId: 'zone-beverages',
    detectedTime: '18:25',
    detectedTimestamp: Date.now() - 20 * 60 * 1000,
    primaryMetric: 'Optical blur / possible lens dust',
    forecastText: 'Shelf analytics confidence may decrease',
    recommendation: 'Inspect and wipe camera C04 lens dome',
    suggestedStaffId: 'S06',
    suggestedStaffName: 'Priya Sharma',
    status: 'NEEDS_ACTION',
    cameraCode: 'CAM-04',
  },
]

export const CANONICAL_RESOLUTIONS: ResolvedIncident[] = [
  {
    id: 'res-01',
    code: 'INC-700',
    title: 'B4 Shelf Replenishment',
    zone: 'Beverage Gondola B4',
    owner: 'S03 Liam O\'Connor',
    duration: '3m 42s',
    beforeValue: '17%',
    afterValue: '79%',
    description: '24 units replenished from Stockroom Bay 3B',
    verificationType: 'Camera Confirmed',
    resolvedAt: '18:15',
  },
  {
    id: 'res-02',
    code: 'INC-699',
    title: 'C3 Queue Support Open',
    zone: 'Checkout Register C3',
    owner: 'S02 Marcus Vance',
    duration: '4m 10s',
    beforeValue: '5.4 min',
    afterValue: '2.1 min',
    description: 'Express lane opened during rush hour surge',
    verificationType: 'Staff Confirmed',
    resolvedAt: '17:58',
  },
  {
    id: 'res-03',
    code: 'INC-698',
    title: 'Produce Tier A4 Planogram',
    zone: 'Produce Tier A4',
    owner: 'S04 Sarah Jenkins',
    duration: '2m 15s',
    beforeValue: 'Misplaced',
    afterValue: 'Aligned',
    description: 'Honeycrisp Apples facing aligned to planogram',
    verificationType: 'Staff Confirmed',
    resolvedAt: '17:42',
  },
]
