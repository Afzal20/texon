import apiClient from './client'

export const login = (data: { email: string; password: string }) =>
  apiClient.post('/api/v1/auth/login/', data)

export const register = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/auth/register/', data)

export const logout = (refresh?: string) =>
  apiClient.post('/api/v1/auth/logout/', { refresh })

export const refreshToken = (refresh: string) =>
  apiClient.post('/api/v1/auth/refresh/', { refresh })

export const getMe = () =>
  apiClient.get('/api/v1/auth/me/')

export const forgotPassword = (data: { email: string }) =>
  apiClient.post('/api/v1/auth/forgot-password/', data)

export const resetPassword = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/auth/reset-password/', data)

export const updatePassword = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/auth/update-password/', data)

export const verifyOtp = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/auth/verify-otp/', data)
