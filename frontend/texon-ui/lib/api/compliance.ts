import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getComplianceRecords = (params?: Record<string, unknown>) => restList("compliance", "ComplianceRecord", params)
export const getComplianceRecord = (id: number) => restGet("compliance", "ComplianceRecord", id)
export const createComplianceRecord = (data: Record<string, unknown>) => restCreate("compliance", "ComplianceRecord", data)
export const updateComplianceRecord = (id: number, data: Record<string, unknown>) => restUpdate("compliance", "ComplianceRecord", id, data)
export const patchComplianceRecord = (id: number, data: Record<string, unknown>) => restUpdate("compliance", "ComplianceRecord", id, data)
export const deleteComplianceRecord = (id: number) => restDelete("compliance", "ComplianceRecord", id)
export const getRiskAssessments = (params?: Record<string, unknown>) => restList("ie_planning", "RiskAssessment", params)
export const getRiskAssessment = (id: number) => restGet("ie_planning", "RiskAssessment", id)
export const createRiskAssessment = (data: Record<string, unknown>) => restCreate("ie_planning", "RiskAssessment", data)
export const updateRiskAssessment = (id: number, data: Record<string, unknown>) => restUpdate("ie_planning", "RiskAssessment", id, data)
export const patchRiskAssessment = (id: number, data: Record<string, unknown>) => restUpdate("ie_planning", "RiskAssessment", id, data)
export const deleteRiskAssessment = (id: number) => restDelete("ie_planning", "RiskAssessment", id)
