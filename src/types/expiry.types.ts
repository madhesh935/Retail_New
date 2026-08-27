export type BatchStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'MARKDOWN'
  | 'EXPIRED'
  | 'WASTE_RECORDED'
  | 'DEPLETED'

export type BatchSource = 'ERP' | 'GOODS_RECEIVING' | 'GS1_SCAN' | 'MANUAL_ENTRY'

export interface InventoryBatch {
  id: string
  storeId: string
  productId: string
  productSku: string
  productName: string
  category: string
  batchNumber: string
  quantity: number
  shelfQuantity: number
  backroomQuantity: number
  receivedAt: string
  manufacturedAt?: string
  bestBeforeAt?: string
  expiresAt: string
  storageLocationId: string
  shelfId?: string
  shelfCode?: string
  unitCost: number
  unitPrice: number
  status: BatchStatus
  source: BatchSource
  updatedAt: string
}

export type ExpiryRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPIRED'

export type ExpiryRecommendedAction =
  | 'ROTATE_STOCK'
  | 'CONSIDER_MARKDOWN'
  | 'REMOVE_EXPIRED'
  | 'MONITOR'

export interface ExpiryRiskAssessment {
  batchId: string
  productId: string
  productSku: string
  productName: string
  category: string
  shelfCode?: string
  remainingQuantity: number
  shelfQuantity: number
  backroomQuantity: number
  expiresAt: string
  hoursRemaining: number
  salesVelocityPerHour: number
  expectedSalesBeforeExpiry: number
  atRiskQuantity: number
  riskLevel: ExpiryRiskLevel
  recommendedAction: ExpiryRecommendedAction
  actionReason: string
  hasOlderBatchBehind?: boolean
  newerBatchNumber?: string
}

export interface MarkdownRule {
  id: string
  category: string
  hoursThreshold: number
  maxDiscountPercent: number
  autoApprove: boolean
}

export type MarkdownStatus = 'RECOMMENDED' | 'APPROVED' | 'REJECTED' | 'APPLIED'

export interface MarkdownCandidate {
  id: string
  batchId: string
  productId: string
  productSku: string
  productName: string
  category: string
  shelfCode: string
  currentPrice: number
  suggestedDiscountPercent: number
  suggestedNewPrice: number
  remainingQuantity: number
  atRiskQuantity: number
  expiresAt: string
  hoursRemaining: number
  reason: string
  status: MarkdownStatus
  approvedAt?: string
  appliedAt?: string
  approvedBy?: string
}

export type WasteReason =
  | 'EXPIRED'
  | 'DAMAGED'
  | 'SPOILED'
  | 'QUALITY_FAILURE'
  | 'TEMPERATURE_DAMAGE'
  | 'OTHER'

export interface WasteRecord {
  id: string
  storeId: string
  productId: string
  productSku?: string
  productName: string
  batchId?: string
  batchNumber?: string
  quantity: number
  reason: WasteReason
  recordedByStaffId: string
  recordedByStaffName: string
  locationId: string
  locationName: string
  recordedAt: string
  unitCost?: number
  totalLossCost?: number
  evidencePhoto?: string
  notes?: string
}

export interface ExpiryAnalyticsSummary {
  expiringSoonSkusCount: number
  atRiskUnitsTotal: number
  markdownCandidatesCount: number
  wasteTodayUnits: number
  wasteAvoidedUnits: number
  timeline: {
    label: string
    count: number
    hoursRange: string
    batches: InventoryBatch[]
  }[]
  categoryRisk: {
    category: string
    atRiskUnits: number
    totalExpiringBatches: number
  }[]
  wasteByCategory: {
    category: string
    units: number
    loss: number
  }[]
  topWasteProducts: {
    productName: string
    units: number
    loss: number
    reason: string
  }[]
}
