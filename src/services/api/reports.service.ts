import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse } from '@/types'

export interface OperationalReportSummary {
  reportPeriod: string
  totalFootfall: number
  peakHour: string
  averageWaitTimeSec: number
  planogramComplianceAvg: number
  totalIncidentsCount: number
  avgIncidentResolutionSec: number
  energyConsumptionKwh: number
  topPerformingZone: string
  bottleneckZone: string
}

export const reportsService = {
  async getReportSummary(storeId?: string, range: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse<OperationalReportSummary>> {
    return apiClient.get<OperationalReportSummary>(API_ENDPOINTS.REPORTS, {
      ...(storeId ? { storeId } : {}),
      range,
    })
  },
}
