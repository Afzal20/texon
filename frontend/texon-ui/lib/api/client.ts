import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getStoredAccessToken, getStoredRefreshToken, storeTokens, clearTokens, ensureTokensAvailable } from '@/lib/django-auth'
import { isJwtExpired } from '@/lib/jwt'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getStoredAccessToken()
    if (!token || isJwtExpired(token)) {
      // localStorage may have lost its tokens while the httpOnly session
      // cookie is still valid — try rehydrating before refreshing.
      await ensureTokensAvailable()
      token = getStoredAccessToken()
      const needsRefresh = !token || isJwtExpired(token)
      const refresh = getStoredRefreshToken()
      if (needsRefresh && refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/users/api/token/refresh/`, { refresh })
          const newToken: string = res.data.access
          storeTokens(newToken, res.data.refresh ?? refresh)
          token = newToken
        } catch {
          clearTokens()
          token = null
        }
      } else if (needsRefresh) {
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
        let refresh = getStoredRefreshToken()
        if (!refresh) {
          await ensureTokensAvailable()
          refresh = getStoredRefreshToken()
        }
        if (!refresh) {
          clearTokens()
          processQueue(new Error('Session expired — please sign in again'), null)
          return Promise.reject(new Error('Session expired — please sign in again'))
        }
        const res = await axios.post(`${API_BASE_URL}/api/users/api/token/refresh/`, { refresh })
        const newToken: string = res.data.access
        storeTokens(newToken, res.data.refresh ?? refresh)
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
