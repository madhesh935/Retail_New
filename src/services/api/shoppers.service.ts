import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, ShopperAnalyticsPayload } from '@/types'

export const shoppersService = {
  async getAnalytics(storeId?: string, timeframe?: '1h' | '6h' | '24h' | '7d'): Promise<ApiResponse<ShopperAnalyticsPayload>> {
    return apiClient.get<ShopperAnalyticsPayload>(API_ENDPOINTS.SHOPPER_ANALYTICS, {
      ...(storeId ? { storeId } : {}),
      ...(timeframe ? { timeframe } : {}),
    })
  },
}
