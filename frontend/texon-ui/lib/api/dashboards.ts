import apiClient from './client'

export const getDashboards = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/dashboards/', { params })

export const getDashboard = (id: number) =>
  apiClient.get(`/api/v1/dashboards/${id}/`)

export const createDashboard = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/dashboards/', data)

export const updateDashboard = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/dashboards/${id}/`, data)

export const patchDashboard = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/dashboards/${id}/`, data)

export const deleteDashboard = (id: number) =>
  apiClient.delete(`/api/v1/dashboards/${id}/`)
