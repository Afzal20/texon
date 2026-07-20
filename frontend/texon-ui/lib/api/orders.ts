import apiClient from './client'

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/orders/', { params })

export const getOrder = (id: number) =>
  apiClient.get(`/api/v1/orders/${id}/`)

export const createOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/orders/', data)

export const updateOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/orders/${id}/`, data)

export const patchOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/orders/${id}/`, data)

export const deleteOrder = (id: number) =>
  apiClient.delete(`/api/v1/orders/${id}/`)

// ─── Order Amendment Histories ───────────────────────────────────────────────

export const getOrderAmendments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/order-amendment-histories/', { params })

export const getOrderAmendment = (id: number) =>
  apiClient.get(`/api/v1/order-amendment-histories/${id}/`)

export const createOrderAmendment = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/order-amendment-histories/', data)

export const updateOrderAmendment = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/order-amendment-histories/${id}/`, data)

export const patchOrderAmendment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/order-amendment-histories/${id}/`, data)

export const deleteOrderAmendment = (id: number) =>
  apiClient.delete(`/api/v1/order-amendment-histories/${id}/`)

// ─── Sample Orders ───────────────────────────────────────────────────────────

export const getSampleOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/sample-orders/', { params })

export const getSampleOrder = (id: number) =>
  apiClient.get(`/api/v1/sample-orders/${id}/`)

export const createSampleOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/sample-orders/', data)

export const updateSampleOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/sample-orders/${id}/`, data)

export const patchSampleOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/sample-orders/${id}/`, data)

export const deleteSampleOrder = (id: number) =>
  apiClient.delete(`/api/v1/sample-orders/${id}/`)

// ─── Shipments ───────────────────────────────────────────────────────────────

export const getShipments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/shipments/', { params })

export const getShipment = (id: number) =>
  apiClient.get(`/api/v1/shipments/${id}/`)

export const createShipment = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/shipments/', data)

export const updateShipment = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/shipments/${id}/`, data)

export const patchShipment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/shipments/${id}/`, data)

export const deleteShipment = (id: number) =>
  apiClient.delete(`/api/v1/shipments/${id}/`)
