import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getReports = (params?: Record<string, unknown>) => restList("reporting", "Report", params)
export const getReport = (id: number) => restGet("reporting", "Report", id)
export const createReport = (data: Record<string, unknown>) => restCreate("reporting", "Report", data)
export const updateReport = (id: number, data: Record<string, unknown>) => restUpdate("reporting", "Report", id, data)
export const patchReport = (id: number, data: Record<string, unknown>) => restUpdate("reporting", "Report", id, data)
export const deleteReport = (id: number) => restDelete("reporting", "Report", id)
