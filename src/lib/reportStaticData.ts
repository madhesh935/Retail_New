export interface ReportOpportunityZone {
  rank: number
  zoneName: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  causes: string[]
  estimatedLossPrevented: string
  keySku: string
  availability: number
}

export interface ReportActionRecord {
  id: string
  time: string
  actionTitle: string
  targetEntity: string
  category: 'QUEUE' | 'INVENTORY' | 'STAFF' | 'SAFETY'
  summaryResult: string
  assignedStaff: string
  beforeMetricLabel: string
  beforeValue: string
  afterMetricLabel: string
  afterValue: string
  operationalGain: string
  verificationMethod: string
}

export const REPORT_OPPORTUNITY_ZONES: ReportOpportunityZone[] = [
  {
    rank: 1,
    zoneName: 'Beverages (Aisle 4)',
    riskLevel: 'HIGH',
    causes: ['High Traffic Density (382 visitors)', 'High Dwell Time (52s avg)', 'Low Shelf Availability (17%)'],
    estimatedLossPrevented: '$1,240 / day',
    keySku: 'Sparkling Cola Zero 12pk (Shelf B4)',
    availability: 17,
  },
  {
    rank: 2,
    zoneName: 'Dairy & Chilled (Cooler Wall)',
    riskLevel: 'MEDIUM',
    causes: ['Moderate Traffic Inflow (315 visitors)', 'Cold Storage Bay Restock Lag', 'Zero Whole Milk on Floor (20m)'],
    estimatedLossPrevented: '$680 / day',
    keySku: 'Horizon Organic Whole Milk 1Gal (Shelf C2)',
    availability: 72,
  },
  {
    rank: 3,
    zoneName: 'Snacks & Pantry (Aisle 3)',
    riskLevel: 'LOW',
    causes: ['Minor Facing Gap in Almonds 200g', 'Prompt Restock from Bay 2A'],
    estimatedLossPrevented: '$190 / day',
    keySku: 'Whole Roasted Almonds 200g (Shelf D2)',
    availability: 84,
  },
]

export const REPORT_ACTION_HISTORY: ReportActionRecord[] = [
  {
    id: 'act-01',
    time: '18:42',
    actionTitle: 'Deploy Support to Checkout C1 & C2 (Rush Surge)',
    targetEntity: 'Checkout Lanes (Counter C1 / C2)',
    category: 'QUEUE',
    summaryResult: 'Wait reduced -48% (5.6m -> 1.8m)',
    assignedStaff: 'EMP-405 Sarah Jenkins',
    beforeMetricLabel: 'Queue Wait / Length',
    beforeValue: '5.6 min (8 people)',
    afterMetricLabel: 'Restored Wait / Length',
    afterValue: '1.8 min (2 people)',
    operationalGain: '-48% Wait Time Reduction & SLA Protection',
    verificationMethod: 'Camera CAM-06 Checkout Vision Pipeline',
  },
  {
    id: 'act-02',
    time: '18:38',
    actionTitle: 'Urgent Restock Dispatch to Shelf A1 Produce Island',
    targetEntity: 'Fresh Produce (Shelf A1)',
    category: 'INVENTORY',
    summaryResult: 'Availability 18% -> 92% (+74%)',
    assignedStaff: "EMP-404 Liam O'Connor",
    beforeMetricLabel: 'Shelf Visible Count',
    beforeValue: '18% (4 apples visible)',
    afterMetricLabel: 'Restocked Count',
    afterValue: '92% (38 units full)',
    operationalGain: 'Protects $280/hr high-velocity produce revenue',
    verificationMethod: 'Camera CAM-01 ShelfEye Bounding Box Scan',
  },
  {
    id: 'act-03',
    time: '18:15',
    actionTitle: 'Proactive Customer Assistance in Electronics & Care',
    targetEntity: 'Electronics & Personal Care (Hub D1)',
    category: 'STAFF',
    summaryResult: 'Response reduced from 4.5m to 55s',
    assignedStaff: 'EMP-406 Tariq Al-Mansoor',
    beforeMetricLabel: 'Shopper Dwell without Assistance',
    beforeValue: '4.5 min (Unassisted)',
    afterMetricLabel: 'Response Time',
    afterValue: '55s (Senior associate engaged)',
    operationalGain: '+22% Basket Conversion on premium SKUs',
    verificationMethod: 'Spatial Floor Tracking & Assistance Completion',
  },
  {
    id: 'act-04',
    time: '17:55',
    actionTitle: 'Shelf B4 Replenished (Cola 12pk)',
    targetEntity: 'Beverage Gondola B4',
    category: 'INVENTORY',
    summaryResult: 'Availability 17% -> 79% (+62%)',
    assignedStaff: 'EMP-402 Marcus Vance',
    beforeMetricLabel: 'Shelf Visible Count',
    beforeValue: '17% (3 units visible)',
    afterMetricLabel: 'Restocked Count',
    afterValue: '79% (24 units full)',
    operationalGain: 'Prevented $240/hr out-of-stock revenue loss',
    verificationMethod: 'Camera CAM-04 ShelfEye Bounding Box Scan',
  },
  {
    id: 'act-05',
    time: '17:10',
    actionTitle: 'Liquid Spill Hazard Cleared (Aisle 2)',
    targetEntity: 'Produce Perimeter Floor',
    category: 'SAFETY',
    summaryResult: 'Slip hazard removed in 1m 40s',
    assignedStaff: 'EMP-405 Sarah Jenkins',
    beforeMetricLabel: 'Hazard Area Surface',
    beforeValue: '1.2 m² liquid area',
    afterMetricLabel: 'Post-Clean Surface',
    afterValue: '0.0 m² (dry floor)',
    operationalGain: '100% Slip Safety SLA Compliance (<2m)',
    verificationMethod: 'Camera CAM-02 FloorNet Segmentation',
  },
]
