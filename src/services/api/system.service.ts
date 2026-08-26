import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, SystemHealthPayload } from '@/types'

export const systemService = {
  async getHealth(storeId?: string): Promise<ApiResponse<SystemHealthPayload>> {
    return apiClient.get<SystemHealthPayload>(API_ENDPOINTS.SYSTEM_HEALTH, storeId ? { storeId } : undefined)
  },

  async triggerEdgeRestart(deviceId: string): Promise<ApiResponse<{ initiated: boolean; message: string }>> {
    return apiClient.post<{ initiated: boolean; message: string }>(`${API_ENDPOINTS.SYSTEM_HEALTH}/restart`, {
      deviceId,
    })
  },
}
