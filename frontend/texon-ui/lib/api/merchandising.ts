import apiClient from './client'

// ─── Buyers ──────────────────────────────────────────────────────────────────

export const getBuyers = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyers/', { params })

export const getBuyer = (id: number) =>
  apiClient.get(`/api/v1/buyers/${id}/`)

export const createBuyer = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyers/', data)

export const updateBuyer = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/buyers/${id}/`, data)

export const patchBuyer = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/buyers/${id}/`, data)

export const deleteBuyer = (id: number) =>
  apiClient.delete(`/api/v1/buyers/${id}/`)

// ─── Buyer Enquiries ─────────────────────────────────────────────────────────

export const getBuyerEnquiries = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/buyer-enquiries/', { params })

export const getBuyerEnquiry = (id: number) =>
  apiClient.get(`/api/v1/buyer-enquiries/${id}/`)

export const createBuyerEnquiry = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/buyer-enquiries/', data)

export const updateBuyerEnquiry = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/buyer-enquiries/${id}/`, data)

export const patchBuyerEnquiry = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/buyer-enquiries/${id}/`, data)

export const deleteBuyerEnquiry = (id: number) =>
  apiClient.delete(`/api/v1/buyer-enquiries/${id}/`)

// ─── Styles ──────────────────────────────────────────────────────────────────

export const getStyles = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/styles/', { params })

export const getStyle = (id: number) =>
  apiClient.get(`/api/v1/styles/${id}/`)

export const createStyle = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/styles/', data)

export const updateStyle = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/styles/${id}/`, data)

export const patchStyle = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/styles/${id}/`, data)

export const deleteStyle = (id: number) =>
  apiClient.delete(`/api/v1/styles/${id}/`)

// ─── SMV Records ────────────────────────────────────────────────────────────

export const getSMVRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/smv-records/', { params })

export const getSMVRecord = (id: number) =>
  apiClient.get(`/api/v1/smv-records/${id}/`)

export const createSMVRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/smv-records/', data)

export const updateSMVRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/smv-records/${id}/`, data)

export const patchSMVRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/smv-records/${id}/`, data)

export const deleteSMVRecord = (id: number) =>
  apiClient.delete(`/api/v1/smv-records/${id}/`)

// ─── Budget Demand Assessments ─────────────────────────────────────────────────
export const getBudgetDemandAssessments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/budget-demand-assessments/', { params })

export const getBudgetDemandAssessment = (id: number) =>
  apiClient.get(`/api/v1/budget-demand-assessments/${id}/`)

export const createBudgetDemandAssessment = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/budget-demand-assessments/', data)

export const updateBudgetDemandAssessment = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/budget-demand-assessments/${id}/`, data)

export const patchBudgetDemandAssessment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/budget-demand-assessments/${id}/`, data)

export const deleteBudgetDemandAssessment = (id: number) =>
  apiClient.delete(`/api/v1/budget-demand-assessments/${id}/`)

// ─── IE Suggestions ────────────────────────────────────────────────────────────
export const getIeSuggestions = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/ie-suggestions/', { params })

export const getIeSuggestion = (id: number) =>
  apiClient.get(`/api/v1/ie-suggestions/${id}/`)

export const createIeSuggestion = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/ie-suggestions/', data)

export const updateIeSuggestion = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/ie-suggestions/${id}/`, data)

export const patchIeSuggestion = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/ie-suggestions/${id}/`, data)

export const deleteIeSuggestion = (id: number) =>
  apiClient.delete(`/api/v1/ie-suggestions/${id}/`)

// ─── Skill Inventories ─────────────────────────────────────────────────────────
export const getSkillInventories = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/skill-inventories/', { params })

export const getSkillInventory = (id: number) =>
  apiClient.get(`/api/v1/skill-inventories/${id}/`)

export const createSkillInventory = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/skill-inventories/', data)

export const updateSkillInventory = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/skill-inventories/${id}/`, data)

export const patchSkillInventory = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/skill-inventories/${id}/`, data)

export const deleteSkillInventory = (id: number) =>
  apiClient.delete(`/api/v1/skill-inventories/${id}/`)

// ─── Production Downtimes ──────────────────────────────────────────────────────
export const getProductionDowntimes = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/production-downtimes/', { params })

export const getProductionDowntime = (id: number) =>
  apiClient.get(`/api/v1/production-downtimes/${id}/`)

export const createProductionDowntime = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/production-downtimes/', data)

export const updateProductionDowntime = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/production-downtimes/${id}/`, data)

export const patchProductionDowntime = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/production-downtimes/${id}/`, data)

export const deleteProductionDowntime = (id: number) =>
  apiClient.delete(`/api/v1/production-downtimes/${id}/`)

// ─── Process Wise Targets ──────────────────────────────────────────────────────
export const getProcessWiseTargets = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/process-wise-targets/', { params })

export const getProcessWiseTarget = (id: number) =>
  apiClient.get(`/api/v1/process-wise-targets/${id}/`)

export const createProcessWiseTarget = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/process-wise-targets/', data)

export const updateProcessWiseTarget = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/process-wise-targets/${id}/`, data)

export const patchProcessWiseTarget = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/process-wise-targets/${id}/`, data)

export const deleteProcessWiseTarget = (id: number) =>
  apiClient.delete(`/api/v1/process-wise-targets/${id}/`)
