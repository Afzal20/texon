import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getDashboards = (params?: Record<string, unknown>) => restList("reporting", "Dashboard", params)
export const getDashboard = (id: number) => restGet("reporting", "Dashboard", id)
export const createDashboard = (data: Record<string, unknown>) => restCreate("reporting", "Dashboard", data)
export const updateDashboard = (id: number, data: Record<string, unknown>) => restUpdate("reporting", "Dashboard", id, data)
export const patchDashboard = (id: number, data: Record<string, unknown>) => restUpdate("reporting", "Dashboard", id, data)
export const deleteDashboard = (id: number) => restDelete("reporting", "Dashboard", id)
