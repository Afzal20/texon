import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getSubcontractOrders = (params?: Record<string, unknown>) => restList("subcontract", "SubcontractOrder", params)
export const getSubcontractOrder = (id: number) => restGet("subcontract", "SubcontractOrder", id)
export const createSubcontractOrder = (data: Record<string, unknown>) => restCreate("subcontract", "SubcontractOrder", data)
export const updateSubcontractOrder = (id: number, data: Record<string, unknown>) => restUpdate("subcontract", "SubcontractOrder", id, data)
export const patchSubcontractOrder = (id: number, data: Record<string, unknown>) => restUpdate("subcontract", "SubcontractOrder", id, data)
export const deleteSubcontractOrder = (id: number) => restDelete("subcontract", "SubcontractOrder", id)
export const getSubcontractTracking = (params?: Record<string, unknown>) => restList("subcontract", "SubcontractTracking", params)
export const getSubcontractTrackingRecord = (id: number) => restGet("subcontract", "SubcontractTracking", id)
export const createSubcontractTracking = (data: Record<string, unknown>) => restCreate("subcontract", "SubcontractTracking", data)
export const updateSubcontractTracking = (id: number, data: Record<string, unknown>) => restUpdate("subcontract", "SubcontractTracking", id, data)
export const patchSubcontractTracking = (id: number, data: Record<string, unknown>) => restUpdate("subcontract", "SubcontractTracking", id, data)
export const deleteSubcontractTracking = (id: number) => restDelete("subcontract", "SubcontractTracking", id)
