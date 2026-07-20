import apiClient from './client'

// ─── Cost Sheets ─────────────────────────────────────────────────────────────

export const getCostSheets = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/cost-sheets/', { params })

export const getCostSheet = (id: number) =>
  apiClient.get(`/api/v1/cost-sheets/${id}/`)

export const createCostSheet = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/cost-sheets/', data)

export const updateCostSheet = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/cost-sheets/${id}/`, data)

export const patchCostSheet = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/cost-sheets/${id}/`, data)

export const deleteCostSheet = (id: number) =>
  apiClient.delete(`/api/v1/cost-sheets/${id}/`)

// ─── Pre-Costings ────────────────────────────────────────────────────────────

export const getPreCostings = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/pre-costings/', { params })

export const getPreCosting = (id: number) =>
  apiClient.get(`/api/v1/pre-costings/${id}/`)

export const createPreCosting = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/pre-costings/', data)

export const updatePreCosting = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/pre-costings/${id}/`, data)

export const patchPreCosting = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/pre-costings/${id}/`, data)

export const deletePreCosting = (id: number) =>
  apiClient.delete(`/api/v1/pre-costings/${id}/`)

// ─── SMV Records ─────────────────────────────────────────────────────────────

export const getSmvRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/smv-records/', { params })

export const getSmvRecord = (id: number) =>
  apiClient.get(`/api/v1/smv-records/${id}/`)

export const createSmvRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/smv-records/', data)

export const updateSmvRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/smv-records/${id}/`, data)

export const patchSmvRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/smv-records/${id}/`, data)

export const deleteSmvRecord = (id: number) =>
  apiClient.delete(`/api/v1/smv-records/${id}/`)
