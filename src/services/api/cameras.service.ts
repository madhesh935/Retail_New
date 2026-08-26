import { apiClient } from './client'
import { API_ENDPOINTS } from '@/lib/constants'
import { ApiResponse, CameraFeed } from '@/types'

export const camerasService = {
  async getCameras(storeId?: string): Promise<ApiResponse<CameraFeed[]>> {
    return apiClient.get<CameraFeed[]>(API_ENDPOINTS.CAMERAS, storeId ? { storeId } : undefined)
  },

  async getCameraById(cameraId: string): Promise<ApiResponse<CameraFeed>> {
    return apiClient.get<CameraFeed>(`${API_ENDPOINTS.CAMERAS}/${cameraId}`)
  },

  async restartCameraStream(cameraId: string): Promise<ApiResponse<{ restarted: boolean; message: string }>> {
    return apiClient.post<{ restarted: boolean; message: string }>(`${API_ENDPOINTS.CAMERAS}/${cameraId}/restart`)
  },
}
