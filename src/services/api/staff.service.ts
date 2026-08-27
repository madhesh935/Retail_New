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

  async loginStaff(employeeId: string, pin: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.STAFF}/auth/login`, { employeeId, pin })
  },
  async checkInShift(checkInAt: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.STAFF}/attendance/check-in`, { checkInAt })
  },
  async startBreak(breakAt: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.STAFF}/attendance/break/start`, { breakAt })
  },
  async endBreak(): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.STAFF}/attendance/break/end`)
  },
  async checkOutShift(checkOutAt: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.STAFF}/attendance/check-out`, { checkOutAt })
  },
}
