import { StateCreator } from 'zustand'
import { ShelfItem, ShelfSection, InventoryAnalytics } from '@/types'

const EMPTY_INVENTORY_ANALYTICS: InventoryAnalytics = {
  totalSkusMonitored: 0,
  totalShelfSections: 0,
  overallPlanogramCompliance: 0,
  activeStockoutsCount: 0,
  criticalLowStockCount: 0,
  misplacedItemsCount: 0,
  estimatedStockoutRevenueLoss: 0,
  topVulnerableSkus: [],
}

export interface InventorySlice {
  shelfItems: ShelfItem[]
  shelfSections: ShelfSection[]
  inventoryAnalytics: InventoryAnalytics
  selectedCategoryFilter: string
  selectedStatusFilter: string
  isLoadingInventory: boolean

  setShelfItems: (items: ShelfItem[]) => void
  setShelfSections: (sections: ShelfSection[]) => void
  setInventoryAnalytics: (analytics: InventoryAnalytics) => void
  updateShelfItemCount: (itemId: string, count: number) => void
  setSelectedCategoryFilter: (category: string) => void
  setSelectedStatusFilter: (status: string) => void
  setLoadingInventory: (loading: boolean) => void
}

export const createInventorySlice: StateCreator<InventorySlice, [], [], InventorySlice> = (set) => ({
  shelfItems: [],
  shelfSections: [],
  inventoryAnalytics: EMPTY_INVENTORY_ANALYTICS,
  selectedCategoryFilter: 'ALL',
  selectedStatusFilter: 'ALL',
  isLoadingInventory: false,

  setShelfItems: (shelfItems) => set({ shelfItems }),
  setShelfSections: (shelfSections) => set({ shelfSections }),
  setInventoryAnalytics: (inventoryAnalytics) => set({ inventoryAnalytics }),
  updateShelfItemCount: (itemId, count) =>
    set((state) => ({
      shelfItems: state.shelfItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentCount: count,
              status: count === 0 ? 'OUT_OF_STOCK' : count < 5 ? 'CRITICAL' : count < 10 ? 'LOW' : 'OPTIMAL',
            }
          : item
      ),
    })),
  setSelectedCategoryFilter: (selectedCategoryFilter) => set({ selectedCategoryFilter }),
  setSelectedStatusFilter: (selectedStatusFilter) => set({ selectedStatusFilter }),
  setLoadingInventory: (isLoadingInventory) => set({ isLoadingInventory }),
})
