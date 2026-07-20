import apiClient from './client'

export const getPerformanceRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/performance-records/', { params })

export const getPerformanceRecord = (id: number) =>
  apiClient.get(`/api/v1/performance-records/${id}/`)

export const createPerformanceRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/performance-records/', data)

export const updatePerformanceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/performance-records/${id}/`, data)

export const patchPerformanceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/performance-records/${id}/`, data)

export const deletePerformanceRecord = (id: number) =>
  apiClient.delete(`/api/v1/performance-records/${id}/`)
