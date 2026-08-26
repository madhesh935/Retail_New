import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, QueueAnalyticsPayload, CheckoutQueue } from '@/types'

export const queuesService = {
  async getQueues(storeId?: string): Promise<ApiResponse<QueueAnalyticsPayload>> {
    return apiClient.get<QueueAnalyticsPayload>(API_ENDPOINTS.QUEUES, storeId ? { storeId } : undefined)
  },

  async updateLaneStatus(laneId: string, status: CheckoutQueue['status']): Promise<ApiResponse<CheckoutQueue>> {
    return apiClient.put<CheckoutQueue>(`${API_ENDPOINTS.QUEUES}/lanes/${laneId}`, { status })
  },
}
