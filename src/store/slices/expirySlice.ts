import { StateCreator } from 'zustand'
import {
  InventoryBatch,
  ExpiryRiskAssessment,
  MarkdownRule,
  MarkdownCandidate,
  WasteRecord,
  ExpiryAnalyticsSummary,
} from '@/types/expiry.types'
import { StaffTask } from '@/types/staff.types'
import {
  DEFAULT_MARKDOWN_RULES,
  INITIAL_INVENTORY_BATCHES,
  INITIAL_WASTE_RECORDS,
  assessBatchRisk,
  generateMarkdownCandidates,
  calculateExpiryAnalyticsSummary,
} from '@/services/expiry/expiryRiskEngine'

export interface ExpirySlice {
  inventoryBatches: InventoryBatch[]
  expiryRiskAssessments: ExpiryRiskAssessment[]
  markdownCandidates: MarkdownCandidate[]
  markdownRules: MarkdownRule[]
  wasteRecords: WasteRecord[]
  expiryAnalyticsSummary: ExpiryAnalyticsSummary

  // UI state for Expiry & Waste view
  selectedExpiryBatch: InventoryBatch | null
  isExpiryDetailOpen: boolean
  expiryTimelineFilter: string | null
  expiryQuickFilter: 'ALL' | '<24H' | '1-3DAYS' | 'HIGH_RISK' | 'MARKDOWN' | 'EXPIRED'
  expiryCategoryFilter: string

  // Actions
  recalculateExpiryRisks: () => void
  setSelectedExpiryBatch: (batch: InventoryBatch | null) => void
  setIsExpiryDetailOpen: (open: boolean) => void
  setExpiryTimelineFilter: (filter: string | null) => void
  setExpiryQuickFilter: (filter: 'ALL' | '<24H' | '1-3DAYS' | 'HIGH_RISK' | 'MARKDOWN' | 'EXPIRED') => void
  setExpiryCategoryFilter: (category: string) => void

  // Operational Actions
  createRotationTask: (batchId: string, instructions?: string) => void
  createExpiryCheckTask: (batchId: string) => void
  approveMarkdownCandidate: (candidateId: string, approvedBy?: string) => void
  rejectMarkdownCandidate: (candidateId: string) => void
  applyMarkdownCandidate: (candidateId: string) => void
  recordWasteEvent: (record: Omit<WasteRecord, 'id' | 'recordedAt'>) => void
  correctBatchExpiryAudit: (batchId: string, newExpiryDate: string, reason: string, staffId: string) => void
  removeExpiredBatch: (batchId: string) => void
}

// Initial calculation of risks and candidates
const initialAssessments = INITIAL_INVENTORY_BATCHES.map((b) =>
  assessBatchRisk(b, INITIAL_INVENTORY_BATCHES, b.category === 'Dairy' ? 0.45 : 0.3)
)
const initialCandidates = generateMarkdownCandidates(initialAssessments, DEFAULT_MARKDOWN_RULES)
const initialSummary = calculateExpiryAnalyticsSummary(
  INITIAL_INVENTORY_BATCHES,
  initialAssessments,
  initialCandidates,
  INITIAL_WASTE_RECORDS
)

export const createExpirySlice: StateCreator<
  ExpirySlice & { pendingTasks?: StaffTask[]; addStaffTask?: (t: StaffTask) => void; updateShelfItemCount?: (id: string, count: number) => void; shelfItems?: any[] },
  [],
  [],
  ExpirySlice
> = (set, get) => ({
  inventoryBatches: INITIAL_INVENTORY_BATCHES,
  expiryRiskAssessments: initialAssessments,
  markdownCandidates: initialCandidates,
  markdownRules: DEFAULT_MARKDOWN_RULES,
  wasteRecords: INITIAL_WASTE_RECORDS,
  expiryAnalyticsSummary: initialSummary,

  selectedExpiryBatch: null,
  isExpiryDetailOpen: false,
  expiryTimelineFilter: null,
  expiryQuickFilter: 'ALL',
  expiryCategoryFilter: 'ALL',

  recalculateExpiryRisks: () => {
    const batches = get().inventoryBatches
    const rules = get().markdownRules
    const waste = get().wasteRecords
    const existingCandidates = get().markdownCandidates

    const assessments = batches.map((b) =>
      assessBatchRisk(b, batches, b.category === 'Dairy' ? 0.45 : 0.3)
    )
    const candidates = generateMarkdownCandidates(assessments, rules, existingCandidates)
    const summary = calculateExpiryAnalyticsSummary(batches, assessments, candidates, waste)

    set({
      expiryRiskAssessments: assessments,
      markdownCandidates: candidates,
      expiryAnalyticsSummary: summary,
    })
  },

  setSelectedExpiryBatch: (selectedExpiryBatch) => set({ selectedExpiryBatch }),
  setIsExpiryDetailOpen: (isExpiryDetailOpen) => set({ isExpiryDetailOpen }),
  setExpiryTimelineFilter: (expiryTimelineFilter) => set({ expiryTimelineFilter }),
  setExpiryQuickFilter: (expiryQuickFilter) => set({ expiryQuickFilter }),
  setExpiryCategoryFilter: (expiryCategoryFilter) => set({ expiryCategoryFilter }),

  createRotationTask: (batchId: string, customInstructions?: string) => {
    const state = get()
    const batch = state.inventoryBatches.find((b) => b.id === batchId)
    if (!batch) return

    const assessment = state.expiryRiskAssessments.find((a) => a.batchId === batchId)

    const newTask: StaffTask = {
      id: `task-rot-${Date.now()}`,
      title: `Rotate Stock: ${batch.productName} (${batch.shelfCode || 'Floor'})`,
      category: 'STOCK_ROTATION',
      priority: assessment?.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      status: 'ASSIGNED',
      zoneId: batch.storageLocationId || 'zone-4',
      zoneName: `${batch.category} (${batch.shelfCode || 'Aisle'})`,
      shelfCode: batch.shelfCode,
      productSku: batch.productSku,
      productName: batch.productName,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiresAt,
      reason:
        assessment?.actionReason ||
        `FEFO Stock Rotation: Pull earliest-expiry batch ${batch.batchNumber} to front.`,
      createdAt: 'Just now',
      etaMinutes: 6,
      sopSteps: [
        {
          id: 'rot-1',
          text: `Identify shelf display at ${batch.shelfCode || 'shelf'} and locate Batch ${batch.batchNumber}`,
          completed: false,
        },
        {
          id: 'rot-2',
          text: 'Move earlier-expiring units to the front facing row',
          completed: false,
        },
        {
          id: 'rot-3',
          text: 'Ensure newer stock is positioned behind front facings',
          completed: false,
        },
        {
          id: 'rot-4',
          text: 'Verify shelf price tag alignment and confirm completion',
          completed: false,
        },
      ],
    }

    if (state.addStaffTask) {
      state.addStaffTask(newTask)
    }

    get().recalculateExpiryRisks()
  },

  createExpiryCheckTask: (batchId: string) => {
    const state = get()
    const batch = state.inventoryBatches.find((b) => b.id === batchId)
    if (!batch) return

    const newTask: StaffTask = {
      id: `task-chk-${Date.now()}`,
      title: `Expiry Audit: ${batch.productName} (${batch.batchNumber})`,
      category: 'EXPIRY_CHECK',
      priority: 'MEDIUM',
      status: 'ASSIGNED',
      zoneId: batch.storageLocationId || 'zone-4',
      zoneName: `${batch.category} (${batch.shelfCode || 'Aisle'})`,
      shelfCode: batch.shelfCode,
      productSku: batch.productSku,
      productName: batch.productName,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiresAt,
      reason: `Verify physical packaging date against system record (${batch.batchNumber})`,
      createdAt: 'Just now',
      etaMinutes: 5,
      sopSteps: [
        { id: 'ec-1', text: `Scan SKU ${batch.productSku} or Batch ${batch.batchNumber}`, completed: false },
        { id: 'ec-2', text: 'Confirm printed expiry matches shelf date', completed: false },
        { id: 'ec-3', text: 'Inspect packaging for seal or temperature integrity', completed: false },
      ],
    }

    if (state.addStaffTask) {
      state.addStaffTask(newTask)
    }
  },

  approveMarkdownCandidate: (candidateId: string, approvedBy = 'Store Manager') => {
    const state = get()
    const candidate = state.markdownCandidates.find((c) => c.id === candidateId)
    if (!candidate) return

    // 1. Update candidate status to APPROVED
    const updatedCandidates = state.markdownCandidates.map((c) =>
      c.id === candidateId
        ? {
            ...c,
            status: 'APPROVED' as const,
            approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            approvedBy,
          }
        : c
    )

    // 2. Update batch status to MARKDOWN
    const updatedBatches = state.inventoryBatches.map((b) =>
      b.id === candidate.batchId ? { ...b, status: 'MARKDOWN' as const } : b
    )

    // 3. Dispatch Staff Task for physical label application
    const newTask: StaffTask = {
      id: `task-md-${Date.now()}`,
      title: `Apply Markdown: ${candidate.productName} (₹${candidate.currentPrice} → ₹${candidate.suggestedNewPrice})`,
      category: 'MARKDOWN_APPLICATION',
      priority: 'HIGH',
      status: 'ASSIGNED',
      zoneId: 'zone-4',
      zoneName: `${candidate.category} (${candidate.shelfCode})`,
      shelfCode: candidate.shelfCode,
      productSku: candidate.productSku,
      productName: candidate.productName,
      batchId: candidate.batchId,
      originalPrice: candidate.currentPrice,
      markdownPrice: candidate.suggestedNewPrice,
      discountPercent: candidate.suggestedDiscountPercent,
      reason: `Manager approved ${candidate.suggestedDiscountPercent}% markdown (${candidate.reason})`,
      createdAt: 'Just now',
      etaMinutes: 5,
      sopSteps: [
        {
          id: 'md-1',
          text: `Print discounted promo shelf label (₹${candidate.suggestedNewPrice})`,
          completed: false,
        },
        {
          id: 'md-2',
          text: `Attach markdown label to Shelf ${candidate.shelfCode} facing`,
          completed: false,
        },
        {
          id: 'md-3',
          text: 'Apply yellow Save Today clearance sticker on at-risk units',
          completed: false,
        },
      ],
    }

    if (state.addStaffTask) {
      state.addStaffTask(newTask)
    }

    set({
      markdownCandidates: updatedCandidates,
      inventoryBatches: updatedBatches,
    })

    get().recalculateExpiryRisks()
  },

  rejectMarkdownCandidate: (candidateId: string) => {
    set((state) => ({
      markdownCandidates: state.markdownCandidates.map((c) =>
        c.id === candidateId ? { ...c, status: 'REJECTED' } : c
      ),
    }))
    get().recalculateExpiryRisks()
  },

  applyMarkdownCandidate: (candidateId: string) => {
    set((state) => ({
      markdownCandidates: state.markdownCandidates.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: 'APPLIED',
              appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      ),
    }))
    get().recalculateExpiryRisks()
  },

  recordWasteEvent: (wasteInput) => {
    const state = get()
    const newRecord: WasteRecord = {
      ...wasteInput,
      id: `waste-${Date.now()}`,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalLossCost: (wasteInput.unitCost || 40) * wasteInput.quantity,
    }

    // 1. Decrement batch quantity
    const updatedBatches = state.inventoryBatches.map((b) => {
      if (b.id === wasteInput.batchId || b.productSku === wasteInput.productSku) {
        const remaining = Math.max(0, b.quantity - wasteInput.quantity)
        const newShelfQty = Math.max(0, b.shelfQuantity - wasteInput.quantity)
        return {
          ...b,
          quantity: remaining,
          shelfQuantity: newShelfQty,
          status: remaining === 0 ? ('WASTE_RECORDED' as const) : b.status,
          updatedAt: new Date().toISOString(),
        }
      }
      return b
    })

    // 2. Decrement canonical shelfItems count in inventorySlice
    if (state.shelfItems && state.updateShelfItemCount) {
      const matchingShelf = state.shelfItems.find(
        (s) => s.sku === wasteInput.productSku || s.productName === wasteInput.productName
      )
      if (matchingShelf) {
        const newCount = Math.max(0, matchingShelf.currentCount - wasteInput.quantity)
        state.updateShelfItemCount(matchingShelf.id, newCount)
      }
    }

    const updatedWasteRecords = [newRecord, ...state.wasteRecords]

    set({
      wasteRecords: updatedWasteRecords,
      inventoryBatches: updatedBatches,
    })

    get().recalculateExpiryRisks()
  },

  correctBatchExpiryAudit: (batchId, newExpiryDate, reason, staffId) => {
    set((state) => ({
      inventoryBatches: state.inventoryBatches.map((b) =>
        b.id === batchId
          ? {
              ...b,
              expiresAt: newExpiryDate,
              source: 'MANUAL_ENTRY',
              updatedAt: new Date().toISOString(),
            }
          : b
      ),
    }))
    get().recalculateExpiryRisks()
  },

  removeExpiredBatch: (batchId) => {
    const state = get()
    const batch = state.inventoryBatches.find((b) => b.id === batchId)
    if (!batch) return

    // 1. Mark batch as EXPIRED
    const updatedBatches = state.inventoryBatches.map((b) =>
      b.id === batchId ? { ...b, status: 'EXPIRED' as const } : b
    )

    // 2. Create Staff Task for floor removal
    const newTask: StaffTask = {
      id: `task-rm-${Date.now()}`,
      title: `Remove Expired Stock: ${batch.productName}`,
      category: 'REMOVE_EXPIRED',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      zoneId: batch.storageLocationId || 'zone-4',
      zoneName: `${batch.category} (${batch.shelfCode || 'Floor'})`,
      shelfCode: batch.shelfCode,
      productSku: batch.productSku,
      productName: batch.productName,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiresAt,
      wasteQuantity: batch.shelfQuantity,
      reason: `Batch ${batch.batchNumber} is expired. Remove ${batch.shelfQuantity} units from shelf ${batch.shelfCode} to disposal/waste bin.`,
      createdAt: 'Just now',
      etaMinutes: 4,
      sopSteps: [
        { id: 'rm-1', text: `Locate ${batch.shelfQuantity} expired units on Shelf ${batch.shelfCode}`, completed: false },
        { id: 'rm-2', text: 'Remove from customer shelf and transport to quarantine bay', completed: false },
        { id: 'rm-3', text: 'Open Staff Scan and log Waste Record', completed: false },
      ],
    }

    if (state.addStaffTask) {
      state.addStaffTask(newTask)
    }

    // 3. Remove shelf units from customer availability
    if (state.shelfItems && state.updateShelfItemCount) {
      const matchingShelf = state.shelfItems.find((s) => s.sku === batch.productSku)
      if (matchingShelf) {
        const newCount = Math.max(0, matchingShelf.currentCount - batch.shelfQuantity)
        state.updateShelfItemCount(matchingShelf.id, newCount)
      }
    }

    set({ inventoryBatches: updatedBatches })
    get().recalculateExpiryRisks()
  },
})
