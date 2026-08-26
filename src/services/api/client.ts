import { ApiResponse, ApiError } from '@/types'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = DEFAULT_API_BASE) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string | null) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Platform': 'RetailEdgeOS-Web',
      'X-Client-Version': '2.4.0',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      if (!response.ok) {
        let errorData: Partial<ApiError> = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: response.statusText }
        }

        const error: ApiError = {
          code: `HTTP_${response.status}`,
          message: errorData.message || `API request failed with status ${response.status}`,
          details: errorData.details,
          timestamp: new Date().toISOString(),
        }
        throw error
      }

      const json: ApiResponse<T> = await response.json()
      return json
    } catch (err: unknown) {
      if ((err as ApiError).code) {
        throw err as ApiError
      }

      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unable to connect to Retail Edge AI server',
        timestamp: new Date().toISOString(),
      }
      throw networkError
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
