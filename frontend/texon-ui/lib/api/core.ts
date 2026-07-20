import apiClient from './client'

// ─── Alarm Notifications ─────────────────────────────────────────────────────

export const getAlarmNotifications = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/alarm-notifications/', { params })

export const getAlarmNotification = (id: number) =>
  apiClient.get(`/api/v1/alarm-notifications/${id}/`)

// ─── Chart of Accounts ───────────────────────────────────────────────────────

export const getChartOfAccounts = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/chart-of-accounts/', { params })

export const getChartOfAccount = (id: number) =>
  apiClient.get(`/api/v1/chart-of-accounts/${id}/`)

export const createChartOfAccount = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/chart-of-accounts/', data)

export const updateChartOfAccount = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/chart-of-accounts/${id}/`, data)

export const patchChartOfAccount = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/chart-of-accounts/${id}/`, data)

export const deleteChartOfAccount = (id: number) =>
  apiClient.delete(`/api/v1/chart-of-accounts/${id}/`)

// ─── Companies ───────────────────────────────────────────────────────────────

export const getCompanies = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/companies/', { params })

export const getCompany = (id: number) =>
  apiClient.get(`/api/v1/companies/${id}/`)

export const createCompany = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/companies/', data)

export const updateCompany = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/companies/${id}/`, data)

export const patchCompany = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/companies/${id}/`, data)

export const deleteCompany = (id: number) =>
  apiClient.delete(`/api/v1/companies/${id}/`)

// ─── Cost Centers ────────────────────────────────────────────────────────────

export const getCostCenters = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/cost-centers/', { params })

export const getCostCenter = (id: number) =>
  apiClient.get(`/api/v1/cost-centers/${id}/`)

export const createCostCenter = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/cost-centers/', data)

export const updateCostCenter = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/cost-centers/${id}/`, data)

export const patchCostCenter = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/cost-centers/${id}/`, data)

export const deleteCostCenter = (id: number) =>
  apiClient.delete(`/api/v1/cost-centers/${id}/`)

// ─── Group Companies ─────────────────────────────────────────────────────────

export const getGroupCompanies = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/group-companies/', { params })

export const getGroupCompany = (id: number) =>
  apiClient.get(`/api/v1/group-companies/${id}/`)

export const createGroupCompany = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/group-companies/', data)

export const updateGroupCompany = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/group-companies/${id}/`, data)

export const patchGroupCompany = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/group-companies/${id}/`, data)

export const deleteGroupCompany = (id: number) =>
  apiClient.delete(`/api/v1/group-companies/${id}/`)

// ─── Location Operations ─────────────────────────────────────────────────────

export const getLocationOperations = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/location-operations/', { params })

export const getLocationOperation = (id: number) =>
  apiClient.get(`/api/v1/location-operations/${id}/`)

export const createLocationOperation = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/location-operations/', data)

export const updateLocationOperation = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/location-operations/${id}/`, data)

export const patchLocationOperation = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/location-operations/${id}/`, data)

export const deleteLocationOperation = (id: number) =>
  apiClient.delete(`/api/v1/location-operations/${id}/`)
