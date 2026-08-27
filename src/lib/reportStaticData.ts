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
    actionTitle: 'Counter C3 Opened (Congestion Relief)',
    targetEntity: 'Checkout Lanes (C1 & C3)',
    category: 'QUEUE',
    summaryResult: 'Wait reduced 59% (5.6m -> 2.3m)',
    assignedStaff: 'S02 Marcus Vance',
    beforeMetricLabel: 'Queue Wait / Length',
    beforeValue: '5.6 min (8 people)',
    afterMetricLabel: 'Restored Wait / Length',
    afterValue: '2.3 min (3 people)',
    operationalGain: '-59% Wait Reduction across checkout zone',
    verificationMethod: 'Camera C06 DeepStream Video Timing',
  },
  {
    id: 'act-02',
    time: '18:38',
    actionTitle: 'Shelf B4 Replenished (Cola 12pk)',
    targetEntity: 'Beverage Gondola B4',
    category: 'INVENTORY',
    summaryResult: 'Availability 17% -> 79% (+62%)',
    assignedStaff: "S03 Liam O'Connor",
    beforeMetricLabel: 'Shelf Visible Count',
    beforeValue: '17% (3 units visible)',
    afterMetricLabel: 'Restocked Count',
    afterValue: '79% (24 units full)',
    operationalGain: 'Prevented $240/hr out-of-stock revenue loss',
    verificationMethod: 'Camera C04 ShelfEye Bounding Box Scan',
  },
  {
    id: 'act-03',
    time: '17:55',
    actionTitle: 'Staff Redeployed to Electronics Hub',
    targetEntity: 'Electronics Hub & Gadgets',
    category: 'STAFF',
    summaryResult: 'Assistance response reduced to 1.8 min',
    assignedStaff: 'S05 David Kim',
    beforeMetricLabel: 'Shopper Dwell without Assistance',
    beforeValue: '4.2 min (Unassisted)',
    afterMetricLabel: 'Response Time',
    afterValue: '1.8 min (Staff Assigned)',
    operationalGain: '+28% customer engagement & basket conversion',
    verificationMethod: 'Spatial Tracking Trajectory Match',
  },
  {
    id: 'act-04',
    time: '17:10',
    actionTitle: 'Liquid Spill Hazard Cleared (Aisle 2)',
    targetEntity: 'Produce Perimeter Floor',
    category: 'SAFETY',
    summaryResult: 'Slip hazard removed in 1m 40s',
    assignedStaff: 'S04 Sarah Jenkins',
    beforeMetricLabel: 'Hazard Area Surface',
    beforeValue: '1.2 square meters liquid area',
    afterMetricLabel: 'Post-Clean Surface',
    afterValue: '0 square meters (dry floor)',
    operationalGain: '100% Slip Safety SLA Compliance (<2m)',
    verificationMethod: 'Camera C02 FloorNet Segmentation',
  },
]
