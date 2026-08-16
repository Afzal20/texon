import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getPerformanceRecords = (params?: Record<string, unknown>) => gqlList("performance", "PerformanceRecord", params)
export const getPerformanceRecord = (id: number) => gqlGet("performance", "PerformanceRecord", id)
export const createPerformanceRecord = (data: Record<string, unknown>) => gqlCreate("performance", "PerformanceRecord", data)
export const updatePerformanceRecord = (id: number, data: Record<string, unknown>) => gqlUpdate("performance", "PerformanceRecord", id, data)
export const patchPerformanceRecord = (id: number, data: Record<string, unknown>) => gqlUpdate("performance", "PerformanceRecord", id, data)
export const deletePerformanceRecord = (id: number) => gqlDelete("performance", "PerformanceRecord", id)
