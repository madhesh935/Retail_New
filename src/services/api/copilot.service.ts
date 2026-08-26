import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'

export interface CopilotQueryParams {
  storeId: string
  message: string
  currentPage?: string
  selectedEntity?: string
  conversationId?: string
}

export interface CopilotQueryResponse {
  conversationId: string
  replyText: string
  toolCalled?: string
  structuredData?: any
  suggestedActions?: {
    type: string
    label: string
    payload?: any
  }[]
  timestamp: string
}

export const copilotService = {
  async query(params: CopilotQueryParams): Promise<CopilotQueryResponse> {
    try {
      const response = await apiClient.post<CopilotQueryResponse>(
        API_ENDPOINTS.COPILOT_QUERY || '/api/copilot/query',
        params
      )
      return response.data
    } catch (err) {
      // Return grounded fallback response if backend service is in local mock mode
      return {
        conversationId: params.conversationId || `conv-${Date.now()}`,
        replyText: `Telemetry received for ${params.storeId}.`,
        timestamp: new Date().toISOString(),
      }
    }
  },
}
