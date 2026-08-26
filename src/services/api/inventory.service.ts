import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, ShelfItem, ShelfSection, InventoryAnalytics } from '@/types'

export const inventoryService = {
  async getInventory(storeId?: string): Promise<ApiResponse<InventoryAnalytics>> {
    return apiClient.get<InventoryAnalytics>(API_ENDPOINTS.INVENTORY, storeId ? { storeId } : undefined)
  },

  async getShelves(storeId?: string, zoneId?: string): Promise<ApiResponse<ShelfSection[]>> {
    return apiClient.get<ShelfSection[]>(API_ENDPOINTS.SHELVES, {
      ...(storeId ? { storeId } : {}),
      ...(zoneId ? { zoneId } : {}),
    })
  },

  async getShelfItems(storeId?: string, statusFilter?: string): Promise<ApiResponse<ShelfItem[]>> {
    return apiClient.get<ShelfItem[]>(`${API_ENDPOINTS.SHELVES}/items`, {
      ...(storeId ? { storeId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    })
  },

  async triggerRestockRequest(sku: string, units: number): Promise<ApiResponse<{ taskId: string; dispatched: boolean }>> {
    return apiClient.post<{ taskId: string; dispatched: boolean }>(`${API_ENDPOINTS.INVENTORY}/restock`, {
      sku,
      units,
    })
  },
}
