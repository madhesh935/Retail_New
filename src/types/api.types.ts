export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
  meta?: {
    storeId: string
    edgeDeviceId?: string
    latencyMs?: number
    isSimulated?: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED' | 'ERROR'
