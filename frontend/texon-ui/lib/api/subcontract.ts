import apiClient from './client'

// ─── Subcontract Orders ──────────────────────────────────────────────────────

export const getSubcontractOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/subcontract-orders/', { params })

export const getSubcontractOrder = (id: number) =>
  apiClient.get(`/api/v1/subcontract-orders/${id}/`)

export const createSubcontractOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/subcontract-orders/', data)

export const updateSubcontractOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/subcontract-orders/${id}/`, data)

export const patchSubcontractOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/subcontract-orders/${id}/`, data)

export const deleteSubcontractOrder = (id: number) =>
  apiClient.delete(`/api/v1/subcontract-orders/${id}/`)

// ─── Subcontract Tracking ────────────────────────────────────────────────────

export const getSubcontractTracking = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/subcontract-tracking/', { params })

export const getSubcontractTrackingRecord = (id: number) =>
  apiClient.get(`/api/v1/subcontract-tracking/${id}/`)

export const createSubcontractTracking = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/subcontract-tracking/', data)

export const updateSubcontractTracking = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/subcontract-tracking/${id}/`, data)

export const patchSubcontractTracking = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/subcontract-tracking/${id}/`, data)

export const deleteSubcontractTracking = (id: number) =>
  apiClient.delete(`/api/v1/subcontract-tracking/${id}/`)
