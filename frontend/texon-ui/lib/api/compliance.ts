import apiClient from './client'

// ─── Compliance Records ──────────────────────────────────────────────────────

export const getComplianceRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/compliance-records/', { params })

export const getComplianceRecord = (id: number) =>
  apiClient.get(`/api/v1/compliance-records/${id}/`)

export const createComplianceRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/compliance-records/', data)

export const updateComplianceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/compliance-records/${id}/`, data)

export const patchComplianceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/compliance-records/${id}/`, data)

export const deleteComplianceRecord = (id: number) =>
  apiClient.delete(`/api/v1/compliance-records/${id}/`)

// ─── Risk Assessments ────────────────────────────────────────────────────────

export const getRiskAssessments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/risk-assessments/', { params })

export const getRiskAssessment = (id: number) =>
  apiClient.get(`/api/v1/risk-assessments/${id}/`)

export const createRiskAssessment = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/risk-assessments/', data)

export const updateRiskAssessment = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/risk-assessments/${id}/`, data)

export const patchRiskAssessment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/risk-assessments/${id}/`, data)

export const deleteRiskAssessment = (id: number) =>
  apiClient.delete(`/api/v1/risk-assessments/${id}/`)
