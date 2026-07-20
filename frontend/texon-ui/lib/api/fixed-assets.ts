import apiClient from './client'

// ─── Asset Categories ────────────────────────────────────────────────────────

export const getAssetCategories = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/asset-categories/', { params })

export const getAssetCategory = (id: number) =>
  apiClient.get(`/api/v1/asset-categories/${id}/`)

export const createAssetCategory = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/asset-categories/', data)

export const updateAssetCategory = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/asset-categories/${id}/`, data)

export const patchAssetCategory = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/asset-categories/${id}/`, data)

export const deleteAssetCategory = (id: number) =>
  apiClient.delete(`/api/v1/asset-categories/${id}/`)

// ─── Depreciation Schedules ──────────────────────────────────────────────────

export const getDepreciationSchedules = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/depreciation-schedules/', { params })

export const getDepreciationSchedule = (id: number) =>
  apiClient.get(`/api/v1/depreciation-schedules/${id}/`)

export const createDepreciationSchedule = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/depreciation-schedules/', data)

export const updateDepreciationSchedule = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/depreciation-schedules/${id}/`, data)

export const patchDepreciationSchedule = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/depreciation-schedules/${id}/`, data)

export const deleteDepreciationSchedule = (id: number) =>
  apiClient.delete(`/api/v1/depreciation-schedules/${id}/`)

// ─── Fixed Assets ────────────────────────────────────────────────────────────

export const getFixedAssets = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/fixed-assets/', { params })

export const getFixedAsset = (id: number) =>
  apiClient.get(`/api/v1/fixed-assets/${id}/`)

export const createFixedAsset = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/fixed-assets/', data)

export const updateFixedAsset = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/fixed-assets/${id}/`, data)

export const patchFixedAsset = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/fixed-assets/${id}/`, data)

export const deleteFixedAsset = (id: number) =>
  apiClient.delete(`/api/v1/fixed-assets/${id}/`)
