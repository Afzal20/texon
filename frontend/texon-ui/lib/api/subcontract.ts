import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getSubcontractOrders = (params?: Record<string, unknown>) => gqlList("subcontract", "SubcontractOrder", params)
export const getSubcontractOrder = (id: number) => gqlGet("subcontract", "SubcontractOrder", id)
export const createSubcontractOrder = (data: Record<string, unknown>) => gqlCreate("subcontract", "SubcontractOrder", data)
export const updateSubcontractOrder = (id: number, data: Record<string, unknown>) => gqlUpdate("subcontract", "SubcontractOrder", id, data)
export const patchSubcontractOrder = (id: number, data: Record<string, unknown>) => gqlUpdate("subcontract", "SubcontractOrder", id, data)
export const deleteSubcontractOrder = (id: number) => gqlDelete("subcontract", "SubcontractOrder", id)
export const getSubcontractTracking = (params?: Record<string, unknown>) => gqlList("subcontract", "SubcontractTracking", params)
export const getSubcontractTrackingRecord = (id: number) => gqlGet("subcontract", "SubcontractTracking", id)
export const createSubcontractTracking = (data: Record<string, unknown>) => gqlCreate("subcontract", "SubcontractTracking", data)
export const updateSubcontractTracking = (id: number, data: Record<string, unknown>) => gqlUpdate("subcontract", "SubcontractTracking", id, data)
export const patchSubcontractTracking = (id: number, data: Record<string, unknown>) => gqlUpdate("subcontract", "SubcontractTracking", id, data)
export const deleteSubcontractTracking = (id: number) => gqlDelete("subcontract", "SubcontractTracking", id)
