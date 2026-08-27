import {
  InventoryBatch,
  ExpiryRiskAssessment,
  MarkdownRule,
  MarkdownCandidate,
  WasteRecord,
  ExpiryAnalyticsSummary,
  ExpiryRiskLevel,
  ExpiryRecommendedAction,
} from '@/types/expiry.types'

export const DEFAULT_MARKDOWN_RULES: MarkdownRule[] = [
  { id: 'rule-dairy-1', category: 'Dairy', hoursThreshold: 24, maxDiscountPercent: 15, autoApprove: false },
  { id: 'rule-dairy-2', category: 'Dairy', hoursThreshold: 12, maxDiscountPercent: 25, autoApprove: false },
  { id: 'rule-bakery-1', category: 'Bakery', hoursThreshold: 12, maxDiscountPercent: 20, autoApprove: false },
  { id: 'rule-bakery-2', category: 'Bakery', hoursThreshold: 6, maxDiscountPercent: 40, autoApprove: false },
  { id: 'rule-produce-1', category: 'Fresh Produce', hoursThreshold: 24, maxDiscountPercent: 20, autoApprove: false },
  { id: 'rule-produce-2', category: 'Fresh Produce', hoursThreshold: 10, maxDiscountPercent: 35, autoApprove: false },
  { id: 'rule-rte-1', category: 'Ready-to-Eat', hoursThreshold: 8, maxDiscountPercent: 25, autoApprove: false },
  { id: 'rule-rte-2', category: 'Ready-to-Eat', hoursThreshold: 4, maxDiscountPercent: 50, autoApprove: false },
  { id: 'rule-meat-1', category: 'Meat & Chilled', hoursThreshold: 24, maxDiscountPercent: 15, autoApprove: false },
  { id: 'rule-meat-2', category: 'Meat & Chilled', hoursThreshold: 12, maxDiscountPercent: 30, autoApprove: false },
]

export const INITIAL_INVENTORY_BATCHES: InventoryBatch[] = [
  {
    id: 'batch-milk-0827',
    storeId: 'STORE-01',
    productId: 'prod-milk-1l',
    productSku: 'SKU-DAIRY-101',
    productName: 'Fresh Whole Milk 1L',
    category: 'Dairy',
    batchNumber: 'MILK-0827',
    quantity: 18,
    shelfQuantity: 10,
    backroomQuantity: 8,
    receivedAt: '2026-08-25T06:00:00.000Z',
    bestBeforeAt: '2026-08-28T12:00:00.000Z',
    expiresAt: '2026-08-28T12:00:00.000Z', // ~20h remaining
    storageLocationId: 'loc-cooler-c2',
    shelfId: 'shelf-c2',
    shelfCode: 'C2',
    unitCost: 42,
    unitPrice: 64,
    status: 'EXPIRING_SOON',
    source: 'ERP',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-milk-0902',
    storeId: 'STORE-01',
    productId: 'prod-milk-1l',
    productSku: 'SKU-DAIRY-101',
    productName: 'Fresh Whole Milk 1L',
    category: 'Dairy',
    batchNumber: 'MILK-0902',
    quantity: 24,
    shelfQuantity: 4,
    backroomQuantity: 20,
    receivedAt: '2026-08-27T05:30:00.000Z',
    bestBeforeAt: '2026-09-02T12:00:00.000Z',
    expiresAt: '2026-09-02T12:00:00.000Z',
    storageLocationId: 'loc-cooler-c2',
    shelfId: 'shelf-c2',
    shelfCode: 'C2',
    unitCost: 42,
    unitPrice: 64,
    status: 'ACTIVE',
    source: 'GOODS_RECEIVING',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-yogurt-451',
    storeId: 'STORE-01',
    productId: 'prod-yogurt-500g',
    productSku: 'SKU-DAIRY-204',
    productName: 'Greek Style Yogurt 500g',
    category: 'Dairy',
    batchNumber: 'Y-451',
    quantity: 12,
    shelfQuantity: 12,
    backroomQuantity: 0,
    receivedAt: '2026-08-20T08:00:00.000Z',
    expiresAt: '2026-08-28T20:00:00.000Z', // ~28h
    storageLocationId: 'loc-cooler-c4',
    shelfId: 'shelf-c4',
    shelfCode: 'C4',
    unitCost: 50,
    unitPrice: 80,
    status: 'EXPIRING_SOON',
    source: 'ERP',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-bread-230',
    storeId: 'STORE-01',
    productId: 'prod-bread-wholewheat',
    productSku: 'SKU-BAK-301',
    productName: 'Whole Wheat Farm Bread 400g',
    category: 'Bakery',
    batchNumber: 'BR-230',
    quantity: 6,
    shelfQuantity: 6,
    backroomQuantity: 0,
    receivedAt: '2026-08-26T04:00:00.000Z',
    expiresAt: '2026-08-27T23:59:00.000Z', // ~8h
    storageLocationId: 'loc-bakery-b2',
    shelfId: 'shelf-b2',
    shelfCode: 'B2',
    unitCost: 24,
    unitPrice: 45,
    status: 'EXPIRING_SOON',
    source: 'MANUAL_ENTRY',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-strawberries-502',
    storeId: 'STORE-01',
    productId: 'prod-berry-250g',
    productSku: 'SKU-PROD-502',
    productName: 'Fresh Hydroponic Strawberries 250g',
    category: 'Fresh Produce',
    batchNumber: 'BERRY-0826',
    quantity: 5,
    shelfQuantity: 5,
    backroomQuantity: 0,
    receivedAt: '2026-08-25T07:00:00.000Z',
    expiresAt: '2026-08-27T22:00:00.000Z', // ~6h
    storageLocationId: 'loc-produce-a2',
    shelfId: 'shelf-a2',
    shelfCode: 'A2',
    unitCost: 65,
    unitPrice: 120,
    status: 'EXPIRING_SOON',
    source: 'GOODS_RECEIVING',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-paneer-305',
    storeId: 'STORE-01',
    productId: 'prod-paneer-200g',
    productSku: 'SKU-DAIRY-305',
    productName: 'Organic Malai Paneer 200g',
    category: 'Dairy',
    batchNumber: 'PAN-0828',
    quantity: 15,
    shelfQuantity: 10,
    backroomQuantity: 5,
    receivedAt: '2026-08-26T09:00:00.000Z',
    expiresAt: '2026-08-29T18:00:00.000Z', // ~50h
    storageLocationId: 'loc-cooler-c3',
    shelfId: 'shelf-c3',
    shelfCode: 'C3',
    unitCost: 65,
    unitPrice: 95,
    status: 'ACTIVE',
    source: 'ERP',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-salad-401',
    storeId: 'STORE-01',
    productId: 'prod-salad-caesar',
    productSku: 'SKU-RTE-401',
    productName: 'Crisp Chicken Caesar Salad 320g',
    category: 'Ready-to-Eat',
    batchNumber: 'RTE-0827',
    quantity: 8,
    shelfQuantity: 8,
    backroomQuantity: 0,
    receivedAt: '2026-08-27T05:00:00.000Z',
    expiresAt: '2026-08-27T21:00:00.000Z', // ~5h
    storageLocationId: 'loc-chilled-d1',
    shelfId: 'shelf-d1',
    shelfCode: 'D1',
    unitCost: 88,
    unitPrice: 155,
    status: 'EXPIRING_SOON',
    source: 'GS1_SCAN',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-eggs-0825',
    storeId: 'STORE-01',
    productId: 'prod-eggs-6pk',
    productSku: 'SKU-DAIRY-401',
    productName: 'Farm Fresh Organic Eggs 6-Pack',
    category: 'Dairy',
    batchNumber: 'EGG-0825',
    quantity: 2,
    shelfQuantity: 2,
    backroomQuantity: 0,
    receivedAt: '2026-08-15T08:00:00.000Z',
    expiresAt: '2026-08-27T14:00:00.000Z', // EXPIRED 2h ago
    storageLocationId: 'loc-cooler-c1',
    shelfId: 'shelf-c1',
    shelfCode: 'C1',
    unitCost: 40,
    unitPrice: 65,
    status: 'EXPIRED',
    source: 'ERP',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'batch-ham-0829',
    storeId: 'STORE-01',
    productId: 'prod-ham-200g',
    productSku: 'SKU-MEAT-601',
    productName: 'Smoked Honey Ham Slices 200g',
    category: 'Meat & Chilled',
    batchNumber: 'HAM-0829',
    quantity: 14,
    shelfQuantity: 8,
    backroomQuantity: 6,
    receivedAt: '2026-08-24T10:00:00.000Z',
    expiresAt: '2026-08-30T16:00:00.000Z', // ~72h
    storageLocationId: 'loc-chilled-c5',
    shelfId: 'shelf-c5',
    shelfCode: 'C5',
    unitCost: 110,
    unitPrice: 175,
    status: 'ACTIVE',
    source: 'ERP',
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_WASTE_RECORDS: WasteRecord[] = [
  {
    id: 'waste-rec-1',
    storeId: 'STORE-01',
    productId: 'prod-bread-wholewheat',
    productSku: 'SKU-BAK-301',
    productName: 'Whole Wheat Farm Bread 400g',
    batchId: 'batch-bread-228',
    batchNumber: 'BR-228',
    quantity: 3,
    reason: 'EXPIRED',
    recordedByStaffId: 'STAFF-03',
    recordedByStaffName: 'Liam',
    locationId: 'shelf-b2',
    locationName: 'Bakery B2',
    recordedAt: '11:30',
    unitCost: 24,
    totalLossCost: 72,
    notes: 'Past sell-by date at morning audit.',
  },
  {
    id: 'waste-rec-2',
    storeId: 'STORE-01',
    productId: 'prod-berry-250g',
    productSku: 'SKU-PROD-502',
    productName: 'Fresh Hydroponic Strawberries 250g',
    batchId: 'batch-berry-0824',
    batchNumber: 'BERRY-0824',
    quantity: 2,
    reason: 'SPOILED',
    recordedByStaffId: 'STAFF-01',
    recordedByStaffName: 'Elena',
    locationId: 'shelf-a2',
    locationName: 'Produce A2',
    recordedAt: '12:15',
    unitCost: 65,
    totalLossCost: 130,
    notes: 'Soft berries noticed during shelf facing.',
  },
  {
    id: 'waste-rec-3',
    storeId: 'STORE-01',
    productId: 'prod-milk-1l',
    productSku: 'SKU-DAIRY-101',
    productName: 'Fresh Whole Milk 1L',
    batchId: 'batch-milk-0824',
    batchNumber: 'MILK-0824',
    quantity: 2,
    reason: 'DAMAGED',
    recordedByStaffId: 'STAFF-02',
    recordedByStaffName: 'Marcus',
    locationId: 'shelf-c2',
    locationName: 'Dairy C2',
    recordedAt: '13:40',
    unitCost: 42,
    totalLossCost: 84,
    notes: 'Carton pierced during pallet unpack.',
  },
]

/**
 * Deterministic calculation of hours remaining until expiry date
 */
export function calculateHoursRemaining(expiresAt: string, baseTime: Date = new Date()): number {
  const expiryDate = new Date(expiresAt)
  const diffMs = expiryDate.getTime() - baseTime.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10
}

/**
 * Format human-readable relative expiry string
 */
export function formatExpiryTime(hoursRemaining: number): string {
  if (hoursRemaining <= 0) {
    const hoursAgo = Math.abs(Math.round(hoursRemaining))
    return hoursAgo === 0 ? 'Expired just now' : `Expired ${hoursAgo}h ago`
  }
  if (hoursRemaining < 24) {
    return `${Math.round(hoursRemaining)}h`
  }
  if (hoursRemaining < 48) {
    return 'Tomorrow'
  }
  const days = Math.round(hoursRemaining / 24)
  return `${days} days`
}

/**
 * Assesses expiry risk for a single batch based on sales velocity and FEFO priority
 */
export function assessBatchRisk(
  batch: InventoryBatch,
  allBatches: InventoryBatch[],
  salesVelocityPerHour: number,
  baseTime: Date = new Date()
): ExpiryRiskAssessment {
  const hoursRemaining = calculateHoursRemaining(batch.expiresAt, baseTime)
  const remainingQuantity = batch.quantity

  // If already expired
  if (hoursRemaining <= 0) {
    return {
      batchId: batch.id,
      productId: batch.productId,
      productSku: batch.productSku,
      productName: batch.productName,
      category: batch.category,
      shelfCode: batch.shelfCode,
      remainingQuantity,
      shelfQuantity: batch.shelfQuantity,
      backroomQuantity: batch.backroomQuantity,
      expiresAt: batch.expiresAt,
      hoursRemaining,
      salesVelocityPerHour,
      expectedSalesBeforeExpiry: 0,
      atRiskQuantity: remainingQuantity,
      riskLevel: 'EXPIRED',
      recommendedAction: 'REMOVE_EXPIRED',
      actionReason: 'Product reached expiry threshold. Remove from floor immediately to prevent sale.',
    }
  }

  // Expected demand before expiration
  const expectedSalesBeforeExpiry = Math.min(
    remainingQuantity,
    Math.round(salesVelocityPerHour * Math.max(0, hoursRemaining))
  )
  const atRiskQuantity = Math.max(0, remainingQuantity - expectedSalesBeforeExpiry)

  // Check FEFO (First Expire First Out) anomalies for the same product
  const siblingBatches = allBatches.filter(
    (b) => b.productId === batch.productId && b.id !== batch.id && b.status !== 'EXPIRED' && b.status !== 'DEPLETED'
  )

  let hasOlderBatchBehind = false
  let newerBatchNumber: string | undefined

  for (const sibling of siblingBatches) {
    const siblingExpiry = new Date(sibling.expiresAt).getTime()
    const thisExpiry = new Date(batch.expiresAt).getTime()

    // If this batch expires sooner than sibling, but sibling has units displayed on shelf
    if (thisExpiry < siblingExpiry && sibling.shelfQuantity > 0 && batch.backroomQuantity > 0) {
      hasOlderBatchBehind = true
      newerBatchNumber = sibling.batchNumber
      break
    }
  }

  // Determine Risk Level & Action
  let riskLevel: ExpiryRiskLevel = 'LOW'
  let recommendedAction: ExpiryRecommendedAction = 'MONITOR'
  let actionReason = 'Inventory expected to sell out normally before expiration.'

  if (hasOlderBatchBehind) {
    riskLevel = 'HIGH'
    recommendedAction = 'ROTATE_STOCK'
    actionReason = `Move earlier-expiry batch ${batch.batchNumber} to front. Newer batch ${newerBatchNumber || ''} is currently on shelf.`
  } else if (atRiskQuantity > 0) {
    if (hoursRemaining <= 24) {
      riskLevel = 'HIGH'
      recommendedAction = 'CONSIDER_MARKDOWN'
      actionReason = `${atRiskQuantity} units at risk of expiration in <24h based on current sales velocity (${salesVelocityPerHour} units/hr).`
    } else if (hoursRemaining <= 48) {
      riskLevel = 'MEDIUM'
      recommendedAction = 'CONSIDER_MARKDOWN'
      actionReason = `${atRiskQuantity} units projected to remain past expiration in ~${Math.round(hoursRemaining)}h.`
    } else {
      riskLevel = 'LOW'
      recommendedAction = 'MONITOR'
      actionReason = 'Monitor daily sell-through velocity.'
    }
  } else if (hoursRemaining <= 24) {
    riskLevel = 'MEDIUM'
    recommendedAction = 'MONITOR'
    actionReason = 'Expiring within 24h, but current velocity is sufficient to deplete inventory.'
  }

  return {
    batchId: batch.id,
    productId: batch.productId,
    productSku: batch.productSku,
    productName: batch.productName,
    category: batch.category,
    shelfCode: batch.shelfCode,
    remainingQuantity,
    shelfQuantity: batch.shelfQuantity,
    backroomQuantity: batch.backroomQuantity,
    expiresAt: batch.expiresAt,
    hoursRemaining,
    salesVelocityPerHour,
    expectedSalesBeforeExpiry,
    atRiskQuantity,
    riskLevel,
    recommendedAction,
    actionReason,
    hasOlderBatchBehind,
    newerBatchNumber,
  }
}

/**
 * Evaluates candidate markdowns according to configurable category rules
 */
export function generateMarkdownCandidates(
  assessments: ExpiryRiskAssessment[],
  rules: MarkdownRule[],
  existingCandidates: MarkdownCandidate[] = []
): MarkdownCandidate[] {
  const candidates: MarkdownCandidate[] = []

  for (const assessment of assessments) {
    if (
      assessment.riskLevel === 'EXPIRED' ||
      assessment.atRiskQuantity <= 0 ||
      assessment.recommendedAction !== 'CONSIDER_MARKDOWN'
    ) {
      continue
    }

    // Find applicable rule for category and time window
    const categoryRules = rules
      .filter((r) => r.category.toLowerCase() === assessment.category.toLowerCase())
      .sort((a, b) => a.hoursThreshold - b.hoursThreshold)

    const matchedRule = categoryRules.find((r) => assessment.hoursRemaining <= r.hoursThreshold)
    if (!matchedRule) continue

    const existing = existingCandidates.find((c) => c.batchId === assessment.batchId)
    const discountPercent = matchedRule.maxDiscountPercent

    // Compute pricing from standard price table or estimate
    const currentPrice = assessment.category === 'Fresh Produce' ? 120 : assessment.category === 'Dairy' ? 80 : 45
    const suggestedNewPrice = Math.round(currentPrice * (1 - discountPercent / 100))

    if (existing) {
      candidates.push({
        ...existing,
        remainingQuantity: assessment.remainingQuantity,
        atRiskQuantity: assessment.atRiskQuantity,
        hoursRemaining: assessment.hoursRemaining,
      })
    } else {
      candidates.push({
        id: `md-${assessment.batchId}`,
        batchId: assessment.batchId,
        productId: assessment.productId,
        productSku: assessment.productSku,
        productName: assessment.productName,
        category: assessment.category,
        shelfCode: assessment.shelfCode || 'C2',
        currentPrice,
        suggestedDiscountPercent: discountPercent,
        suggestedNewPrice,
        remainingQuantity: assessment.remainingQuantity,
        atRiskQuantity: assessment.atRiskQuantity,
        expiresAt: assessment.expiresAt,
        hoursRemaining: assessment.hoursRemaining,
        reason: `Expected demand (${assessment.expectedSalesBeforeExpiry}) below remaining inventory (${assessment.remainingQuantity}) within ${Math.round(assessment.hoursRemaining)}h`,
        status: matchedRule.autoApprove ? 'APPROVED' : 'RECOMMENDED',
      })
    }
  }

  return candidates
}

/**
 * Calculates high-level summary KPIs and visual breakdown models
 */
export function calculateExpiryAnalyticsSummary(
  batches: InventoryBatch[],
  assessments: ExpiryRiskAssessment[],
  candidates: MarkdownCandidate[],
  wasteRecords: WasteRecord[]
): ExpiryAnalyticsSummary {
  const expiringSoonSkus = new Set(
    assessments.filter((a) => a.riskLevel === 'HIGH' || a.riskLevel === 'MEDIUM').map((a) => a.productSku)
  )

  const atRiskUnitsTotal = assessments.reduce((sum, a) => sum + (a.riskLevel !== 'EXPIRED' ? a.atRiskQuantity : 0), 0)
  const pendingMarkdownCount = candidates.filter((c) => c.status === 'RECOMMENDED').length
  const wasteTodayUnits = wasteRecords.reduce((sum, w) => sum + w.quantity, 0)

  // Waste avoided: estimated units sold after intervention
  const wasteAvoidedUnits = assessments.reduce((sum, a) => {
    if (a.expectedSalesBeforeExpiry > 0 && (a.riskLevel === 'HIGH' || a.riskLevel === 'MEDIUM')) {
      return sum + Math.min(a.expectedSalesBeforeExpiry, a.remainingQuantity)
    }
    return sum
  }, 0)

  // Timeline buckets: Today (<24h), Tomorrow (24-48h), 2–3 Days (48-72h), 4–7 Days (>72h)
  const todayBatches = batches.filter((b) => {
    const hrs = calculateHoursRemaining(b.expiresAt)
    return hrs > 0 && hrs <= 24
  })
  const tomorrowBatches = batches.filter((b) => {
    const hrs = calculateHoursRemaining(b.expiresAt)
    return hrs > 24 && hrs <= 48
  })
  const twoToThreeDaysBatches = batches.filter((b) => {
    const hrs = calculateHoursRemaining(b.expiresAt)
    return hrs > 48 && hrs <= 72
  })
  const fourToSevenDaysBatches = batches.filter((b) => {
    const hrs = calculateHoursRemaining(b.expiresAt)
    return hrs > 72 && hrs <= 168
  })

  const timeline = [
    { label: 'Today', count: todayBatches.length, hoursRange: '<24h', batches: todayBatches },
    { label: 'Tomorrow', count: tomorrowBatches.length, hoursRange: '24–48h', batches: tomorrowBatches },
    { label: '2–3 Days', count: twoToThreeDaysBatches.length, hoursRange: '48–72h', batches: twoToThreeDaysBatches },
    { label: '4–7 Days', count: fourToSevenDaysBatches.length, hoursRange: '4–7d', batches: fourToSevenDaysBatches },
  ]

  // Category Risk Breakdown
  const catMap = new Map<string, { atRiskUnits: number; totalExpiringBatches: number }>()
  for (const a of assessments) {
    const existing = catMap.get(a.category) || { atRiskUnits: 0, totalExpiringBatches: 0 }
    existing.atRiskUnits += a.atRiskQuantity
    if (a.hoursRemaining <= 72 && a.hoursRemaining > 0) {
      existing.totalExpiringBatches += 1
    }
    catMap.set(a.category, existing)
  }

  const categoryRisk = Array.from(catMap.entries()).map(([category, stats]) => ({
    category,
    atRiskUnits: stats.atRiskUnits,
    totalExpiringBatches: stats.totalExpiringBatches,
  })).sort((a, b) => b.atRiskUnits - a.atRiskUnits)

  // Waste by Category
  const wasteCatMap = new Map<string, { units: number; loss: number }>()
  for (const w of wasteRecords) {
    const batch = batches.find((b) => b.id === w.batchId)
    const category = batch?.category || 'General'
    const loss = w.totalLossCost || (w.unitCost || 40) * w.quantity
    const existing = wasteCatMap.get(category) || { units: 0, loss: 0 }
    existing.units += w.quantity
    existing.loss += loss
    wasteCatMap.set(category, existing)
  }

  const wasteByCategory = Array.from(wasteCatMap.entries()).map(([category, stats]) => ({
    category,
    units: stats.units,
    loss: stats.loss,
  }))

  // Top waste products
  const topWasteProducts = wasteRecords.map((w) => ({
    productName: w.productName,
    units: w.quantity,
    loss: w.totalLossCost || (w.unitCost || 40) * w.quantity,
    reason: w.reason.replace(/_/g, ' '),
  }))

  return {
    expiringSoonSkusCount: expiringSoonSkus.size,
    atRiskUnitsTotal,
    markdownCandidatesCount: pendingMarkdownCount,
    wasteTodayUnits,
    wasteAvoidedUnits,
    timeline,
    categoryRisk,
    wasteByCategory,
    topWasteProducts,
  }
}
