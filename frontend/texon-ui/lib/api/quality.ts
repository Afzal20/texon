import apiClient from './client'

// ─── Defect Categories ───────────────────────────────────────────────────────

export const getDefectCategories = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/defect-categories/', { params })

export const getDefectCategory = (id: number) =>
  apiClient.get(`/api/v1/defect-categories/${id}/`)

export const createDefectCategory = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/defect-categories/', data)

export const updateDefectCategory = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/defect-categories/${id}/`, data)

export const patchDefectCategory = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/defect-categories/${id}/`, data)

export const deleteDefectCategory = (id: number) =>
  apiClient.delete(`/api/v1/defect-categories/${id}/`)

// ─── Endline QC ──────────────────────────────────────────────────────────────

export const getEndlineQc = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/endline-qc/', { params })

export const getEndlineQcRecord = (id: number) =>
  apiClient.get(`/api/v1/endline-qc/${id}/`)

export const createEndlineQc = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/endline-qc/', data)

export const updateEndlineQc = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/endline-qc/${id}/`, data)

export const patchEndlineQc = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/endline-qc/${id}/`, data)

export const deleteEndlineQc = (id: number) =>
  apiClient.delete(`/api/v1/endline-qc/${id}/`)

// ─── Final Inspections ───────────────────────────────────────────────────────

export const getFinalInspections = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/final-inspections/', { params })

export const getFinalInspection = (id: number) =>
  apiClient.get(`/api/v1/final-inspections/${id}/`)

export const createFinalInspection = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/final-inspections/', data)

export const updateFinalInspection = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/final-inspections/${id}/`, data)

export const patchFinalInspection = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/final-inspections/${id}/`, data)

export const deleteFinalInspection = (id: number) =>
  apiClient.delete(`/api/v1/final-inspections/${id}/`)

// ─── Inline QC ───────────────────────────────────────────────────────────────

export const getInlineQc = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/inline-qc/', { params })

export const getInlineQcRecord = (id: number) =>
  apiClient.get(`/api/v1/inline-qc/${id}/`)

export const createInlineQc = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/inline-qc/', data)

export const updateInlineQc = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/inline-qc/${id}/`, data)

export const patchInlineQc = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/inline-qc/${id}/`, data)

export const deleteInlineQc = (id: number) =>
  apiClient.delete(`/api/v1/inline-qc/${id}/`)

// ─── Inspection Packing ──────────────────────────────────────────────────────

export const getInspectionPacking = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/inspection-packing/', { params })

export const getInspectionPackingRecord = (id: number) =>
  apiClient.get(`/api/v1/inspection-packing/${id}/`)

export const createInspectionPacking = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/inspection-packing/', data)

export const updateInspectionPacking = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/inspection-packing/${id}/`, data)

export const patchInspectionPacking = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/inspection-packing/${id}/`, data)

export const deleteInspectionPacking = (id: number) =>
  apiClient.delete(`/api/v1/inspection-packing/${id}/`)

// ─── Rejection Reports ───────────────────────────────────────────────────────

export const getRejectionReports = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/rejection-reports/', { params })

export const getRejectionReport = (id: number) =>
  apiClient.get(`/api/v1/rejection-reports/${id}/`)

export const createRejectionReport = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/rejection-reports/', data)

export const updateRejectionReport = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/rejection-reports/${id}/`, data)

export const patchRejectionReport = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/rejection-reports/${id}/`, data)

export const deleteRejectionReport = (id: number) =>
  apiClient.delete(`/api/v1/rejection-reports/${id}/`)
