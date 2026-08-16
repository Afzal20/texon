import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getReports = (params?: Record<string, unknown>) => gqlList("reporting", "Report", params)
export const getReport = (id: number) => gqlGet("reporting", "Report", id)
export const createReport = (data: Record<string, unknown>) => gqlCreate("reporting", "Report", data)
export const updateReport = (id: number, data: Record<string, unknown>) => gqlUpdate("reporting", "Report", id, data)
export const patchReport = (id: number, data: Record<string, unknown>) => gqlUpdate("reporting", "Report", id, data)
export const deleteReport = (id: number) => gqlDelete("reporting", "Report", id)
