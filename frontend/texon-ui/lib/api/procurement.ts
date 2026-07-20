import apiClient from './client'

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export const getPurchaseOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/purchase-orders/', { params })

export const getPurchaseOrder = (id: number) =>
  apiClient.get(`/api/v1/purchase-orders/${id}/`)

export const createPurchaseOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/purchase-orders/', data)

export const updatePurchaseOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/purchase-orders/${id}/`, data)

export const patchPurchaseOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/purchase-orders/${id}/`, data)

export const deletePurchaseOrder = (id: number) =>
  apiClient.delete(`/api/v1/purchase-orders/${id}/`)

// ─── Quotation Analyses ──────────────────────────────────────────────────────

export const getQuotationAnalyses = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/quotation-analyses/', { params })

export const getQuotationAnalysis = (id: number) =>
  apiClient.get(`/api/v1/quotation-analyses/${id}/`)

export const createQuotationAnalysis = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/quotation-analyses/', data)

export const updateQuotationAnalysis = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/quotation-analyses/${id}/`, data)

export const patchQuotationAnalysis = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/quotation-analyses/${id}/`, data)

export const deleteQuotationAnalysis = (id: number) =>
  apiClient.delete(`/api/v1/quotation-analyses/${id}/`)

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const getSuppliers = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/suppliers/', { params })

export const getSupplier = (id: number) =>
  apiClient.get(`/api/v1/suppliers/${id}/`)

export const createSupplier = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/suppliers/', data)

export const updateSupplier = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/suppliers/${id}/`, data)

export const patchSupplier = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/suppliers/${id}/`, data)

export const deleteSupplier = (id: number) =>
  apiClient.delete(`/api/v1/suppliers/${id}/`)
