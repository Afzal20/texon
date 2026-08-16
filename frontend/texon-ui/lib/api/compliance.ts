import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getComplianceRecords = (params?: Record<string, unknown>) => gqlList("compliance", "ComplianceRecord", params)
export const getComplianceRecord = (id: number) => gqlGet("compliance", "ComplianceRecord", id)
export const createComplianceRecord = (data: Record<string, unknown>) => gqlCreate("compliance", "ComplianceRecord", data)
export const updateComplianceRecord = (id: number, data: Record<string, unknown>) => gqlUpdate("compliance", "ComplianceRecord", id, data)
export const patchComplianceRecord = (id: number, data: Record<string, unknown>) => gqlUpdate("compliance", "ComplianceRecord", id, data)
export const deleteComplianceRecord = (id: number) => gqlDelete("compliance", "ComplianceRecord", id)
export const getRiskAssessments = (params?: Record<string, unknown>) => gqlList("ie_planning", "RiskAssessment", params)
export const getRiskAssessment = (id: number) => gqlGet("ie_planning", "RiskAssessment", id)
export const createRiskAssessment = (data: Record<string, unknown>) => gqlCreate("ie_planning", "RiskAssessment", data)
export const updateRiskAssessment = (id: number, data: Record<string, unknown>) => gqlUpdate("ie_planning", "RiskAssessment", id, data)
export const patchRiskAssessment = (id: number, data: Record<string, unknown>) => gqlUpdate("ie_planning", "RiskAssessment", id, data)
export const deleteRiskAssessment = (id: number) => gqlDelete("ie_planning", "RiskAssessment", id)
