import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorBody } from '@/types/api'
import { tokenStorage } from '@/utils/storage'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<{ access_token: string; refresh_token?: string }>(
      `${API_URL}/auth/refresh`,
      { refresh_token: refreshToken },
    )
    tokenStorage.setAccessToken(data.access_token)
    if (data.refresh_token) {
      tokenStorage.setRefreshToken(data.refresh_token)
    }
    return data.access_token
  } catch {
    tokenStorage.clear()
    return null
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config
    if (!original || error.response?.status !== 401 || original.url?.includes('/auth/')) {
      return Promise.reject(parseApiError(error))
    }

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise
    if (!newToken) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(parseApiError(error))
    }

    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)

export function parseApiError(error: AxiosError<ApiErrorBody>) {
  const detail = error.response?.data?.detail
  if (typeof detail === 'string') {
    return new Error(detail)
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return new Error(detail.map((item) => item.msg).join(', '))
  }
  return new Error(error.response?.data?.message ?? error.message ?? 'Something went wrong')
}

export function buildParams(params?: Record<string, unknown> | object) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ''),
  )
}
