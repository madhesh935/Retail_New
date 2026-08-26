import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, PredictionsPayload } from '@/types'

export const predictionsService = {
  async getPredictions(storeId?: string): Promise<ApiResponse<PredictionsPayload>> {
    return apiClient.get<PredictionsPayload>(API_ENDPOINTS.PREDICTIONS, storeId ? { storeId } : undefined)
  },
}
