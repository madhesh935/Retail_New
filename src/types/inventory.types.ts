export type StockStatus = 'OPTIMAL' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' | 'MISPLACED'

export interface ShelfItem {
  id: string
  shelfId: string
  shelfName: string
  zoneId: string
  zoneName: string
  sku: string
  productName: string
  brand: string
  category: string
  unitPrice: number
  capacityCount: number
  currentCount: number
  facingCapacity: number
  currentFacings: number
  status: StockStatus
  planogramComplianceScore: number // 0 - 100
  isMisplaced: boolean
  lastRestocked: string
  expectedRestockTime?: string
  confidenceScore: number // Edge model confidence
  cameraSourceId: string
  backroomUnits?: number
  aisle?: string
  minutesUntilStockout?: number | null
  depletionRatePerHour?: number | null
}

export interface ShelfSection {
  id: string
  name: string
  zoneId: string
  aisleNumber: number
  tierCount: number
  overallComplianceScore: number
  outOfStockItemsCount: number
  lowStockItemsCount: number
  lastScannedTime: string
  items: ShelfItem[]
}

export interface InventoryAnalytics {
  totalSkusMonitored: number
  totalShelfSections: number
  overallPlanogramCompliance: number
  activeStockoutsCount: number
  criticalLowStockCount: number
  misplacedItemsCount: number
  estimatedStockoutRevenueLoss: number
  topVulnerableSkus: {
    sku: string
    productName: string
    currentStock: number
    depletionRatePerHour: number
    minutesUntilStockout: number
  }[]
}
