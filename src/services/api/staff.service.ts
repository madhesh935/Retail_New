import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, StaffOperationsPayload, StaffMember, StaffTask } from '@/types'

export const staffService = {
  async getStaff(storeId?: string): Promise<ApiResponse<StaffOperationsPayload>> {
    return apiClient.get<StaffOperationsPayload>(API_ENDPOINTS.STAFF, storeId ? { storeId } : undefined)
  },

  async reallocateStaff(staffId: string, targetZoneId: string, reason?: string): Promise<ApiResponse<StaffMember>> {
    return apiClient.post<StaffMember>(`${API_ENDPOINTS.STAFF}/${staffId}/reallocate`, {
      targetZoneId,
      reason,
    })
  },

  async createTask(task: Partial<StaffTask>): Promise<ApiResponse<StaffTask>> {
    return apiClient.post<StaffTask>(`${API_ENDPOINTS.STAFF}/tasks`, task)
  },
}
