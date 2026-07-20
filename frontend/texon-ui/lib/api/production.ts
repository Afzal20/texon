import apiClient from './client'

// ─── Capacity Bookings ───────────────────────────────────────────────────────

export const getCapacityBookings = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/capacity-bookings/', { params })

export const getCapacityBooking = (id: number) =>
  apiClient.get(`/api/v1/capacity-bookings/${id}/`)

export const createCapacityBooking = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/capacity-bookings/', data)

export const updateCapacityBooking = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/capacity-bookings/${id}/`, data)

export const patchCapacityBooking = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/capacity-bookings/${id}/`, data)

export const deleteCapacityBooking = (id: number) =>
  apiClient.delete(`/api/v1/capacity-bookings/${id}/`)

// ─── Cutting Records ─────────────────────────────────────────────────────────

export const getCuttingRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/cutting-records/', { params })

export const getCuttingRecord = (id: number) =>
  apiClient.get(`/api/v1/cutting-records/${id}/`)

export const createCuttingRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/cutting-records/', data)

export const updateCuttingRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/cutting-records/${id}/`, data)

export const patchCuttingRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/cutting-records/${id}/`, data)

export const deleteCuttingRecord = (id: number) =>
  apiClient.delete(`/api/v1/cutting-records/${id}/`)

// ─── Job Orders ──────────────────────────────────────────────────────────────

export const getJobOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/job-orders/', { params })

export const getJobOrder = (id: number) =>
  apiClient.get(`/api/v1/job-orders/${id}/`)

export const createJobOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/job-orders/', data)

export const updateJobOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/job-orders/${id}/`, data)

export const patchJobOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/job-orders/${id}/`, data)

export const deleteJobOrder = (id: number) =>
  apiClient.delete(`/api/v1/job-orders/${id}/`)

// ─── Line Plans ──────────────────────────────────────────────────────────────

export const getLinePlans = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/line-plans/', { params })

export const getLinePlan = (id: number) =>
  apiClient.get(`/api/v1/line-plans/${id}/`)

export const createLinePlan = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/line-plans/', data)

export const updateLinePlan = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/line-plans/${id}/`, data)

export const patchLinePlan = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/line-plans/${id}/`, data)

export const deleteLinePlan = (id: number) =>
  apiClient.delete(`/api/v1/line-plans/${id}/`)

// ─── Production Lines ────────────────────────────────────────────────────────

export const getProductionLines = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/production-lines/', { params })

export const getProductionLine = (id: number) =>
  apiClient.get(`/api/v1/production-lines/${id}/`)

export const createProductionLine = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/production-lines/', data)

export const updateProductionLine = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/production-lines/${id}/`, data)

export const patchProductionLine = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/production-lines/${id}/`, data)

export const deleteProductionLine = (id: number) =>
  apiClient.delete(`/api/v1/production-lines/${id}/`)

// ─── Production Orders ───────────────────────────────────────────────────────

export const getProductionOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/production-orders/', { params })

export const getProductionOrder = (id: number) =>
  apiClient.get(`/api/v1/production-orders/${id}/`)

export const createProductionOrder = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/production-orders/', data)

export const updateProductionOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/production-orders/${id}/`, data)

export const patchProductionOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/production-orders/${id}/`, data)

export const deleteProductionOrder = (id: number) =>
  apiClient.delete(`/api/v1/production-orders/${id}/`)

// ─── Production Plans ────────────────────────────────────────────────────────

export const getProductionPlans = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/production-plans/', { params })

export const getProductionPlan = (id: number) =>
  apiClient.get(`/api/v1/production-plans/${id}/`)

export const createProductionPlan = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/production-plans/', data)

export const updateProductionPlan = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/production-plans/${id}/`, data)

export const patchProductionPlan = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/production-plans/${id}/`, data)

export const deleteProductionPlan = (id: number) =>
  apiClient.delete(`/api/v1/production-plans/${id}/`)

// ─── Sewing Records ──────────────────────────────────────────────────────────

export const getSewingRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/sewing-records/', { params })

export const getSewingRecord = (id: number) =>
  apiClient.get(`/api/v1/sewing-records/${id}/`)

export const createSewingRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/sewing-records/', data)

export const updateSewingRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/sewing-records/${id}/`, data)

export const patchSewingRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/sewing-records/${id}/`, data)

export const deleteSewingRecord = (id: number) =>
  apiClient.delete(`/api/v1/sewing-records/${id}/`)

// ─── Development Monitoring ──────────────────────────────────────────────────

export const getDevelopmentMonitoring = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/development-monitoring/', { params })

export const getDevelopmentMonitor = (id: number) =>
  apiClient.get(`/api/v1/development-monitoring/${id}/`)

export const createDevelopmentMonitor = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/development-monitoring/', data)

export const updateDevelopmentMonitor = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/development-monitoring/${id}/`, data)

export const patchDevelopmentMonitor = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/development-monitoring/${id}/`, data)

export const deleteDevelopmentMonitor = (id: number) =>
  apiClient.delete(`/api/v1/development-monitoring/${id}/`)

// ─── Plans ───────────────────────────────────────────────────────────────────

export const getPlans = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/plans/', { params })

export const getPlan = (id: number) =>
  apiClient.get(`/api/v1/plans/${id}/`)

export const createPlan = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/plans/', data)

export const updatePlan = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/plans/${id}/`, data)

export const patchPlan = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/plans/${id}/`, data)

export const deletePlan = (id: number) =>
  apiClient.delete(`/api/v1/plans/${id}/`)
