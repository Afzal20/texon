import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getStoredAccessToken, getStoredRefreshToken, storeTokens, clearTokens } from '@/lib/django-auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getStoredAccessToken()
    if (token && isTokenExpired(token)) {
      const refresh = getStoredRefreshToken()
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, { refresh })
          const newToken: string = res.data.access
          storeTokens(newToken, refresh)
          token = newToken
        } catch {
          clearTokens()
          token = null
        }
      } else {
        clearTokens()
        token = null
      }
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
      }
      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = getStoredRefreshToken()
        if (!refresh) throw new Error('No refresh token')
        const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, { refresh })
        const newToken: string = res.data.access
        storeTokens(newToken, refresh)
        processQueue(null, newToken)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

export default apiClient
