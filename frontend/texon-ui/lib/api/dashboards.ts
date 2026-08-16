import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getDashboards = (params?: Record<string, unknown>) => gqlList("reporting", "Dashboard", params)
export const getDashboard = (id: number) => gqlGet("reporting", "Dashboard", id)
export const createDashboard = (data: Record<string, unknown>) => gqlCreate("reporting", "Dashboard", data)
export const updateDashboard = (id: number, data: Record<string, unknown>) => gqlUpdate("reporting", "Dashboard", id, data)
export const patchDashboard = (id: number, data: Record<string, unknown>) => gqlUpdate("reporting", "Dashboard", id, data)
export const deleteDashboard = (id: number) => gqlDelete("reporting", "Dashboard", id)
