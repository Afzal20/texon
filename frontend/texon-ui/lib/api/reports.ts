import apiClient from './client'

export const getReports = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/reports/', { params })

export const getReport = (id: number) =>
  apiClient.get(`/api/v1/reports/${id}/`)

export const createReport = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/reports/', data)

export const updateReport = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/reports/${id}/`, data)

export const patchReport = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/reports/${id}/`, data)

export const deleteReport = (id: number) =>
  apiClient.delete(`/api/v1/reports/${id}/`)
