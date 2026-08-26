import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, StoreStatus, StoreState } from '@/types'

export const storeService = {
  async getStatus(storeId?: string): Promise<ApiResponse<StoreStatus>> {
    return apiClient.get<StoreStatus>(API_ENDPOINTS.STORE_STATUS, storeId ? { storeId } : undefined)
  },

  async getState(storeId?: string): Promise<ApiResponse<StoreState>> {
    return apiClient.get<StoreState>(API_ENDPOINTS.STORE_STATE, storeId ? { storeId } : undefined)
  },
}
