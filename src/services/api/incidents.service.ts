import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, IncidentsAnalyticsPayload, RetailIncident, AiRecommendation } from '@/types'

export const incidentsService = {
  async getIncidents(storeId?: string, status?: string): Promise<ApiResponse<IncidentsAnalyticsPayload>> {
    return apiClient.get<IncidentsAnalyticsPayload>(API_ENDPOINTS.INCIDENTS, {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
    })
  },

  async updateIncidentStatus(incidentId: string, status: RetailIncident['status']): Promise<ApiResponse<RetailIncident>> {
    return apiClient.put<RetailIncident>(`${API_ENDPOINTS.INCIDENTS}/${incidentId}`, { status })
  },

  async executeAiRecommendation(recommendationId: string): Promise<ApiResponse<{ executed: boolean; recommendation: AiRecommendation }>> {
    return apiClient.post<{ executed: boolean; recommendation: AiRecommendation }>(
      `${API_ENDPOINTS.INCIDENTS}/recommendations/${recommendationId}/execute`
    )
  },
}
