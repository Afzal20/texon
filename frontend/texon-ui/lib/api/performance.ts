import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getPerformanceRecords = (params?: Record<string, unknown>) => restList("performance", "PerformanceRecord", params)
export const getPerformanceRecord = (id: number) => restGet("performance", "PerformanceRecord", id)
export const createPerformanceRecord = (data: Record<string, unknown>) => restCreate("performance", "PerformanceRecord", data)
export const updatePerformanceRecord = (id: number, data: Record<string, unknown>) => restUpdate("performance", "PerformanceRecord", id, data)
export const patchPerformanceRecord = (id: number, data: Record<string, unknown>) => restUpdate("performance", "PerformanceRecord", id, data)
export const deletePerformanceRecord = (id: number) => restDelete("performance", "PerformanceRecord", id)
