import apiClient from './client'

// ─── Schedules ───────────────────────────────────────────────────────────────

export const getSchedules = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/schedules/', { params })

export const getSchedule = (id: number) =>
  apiClient.get(`/api/v1/schedules/${id}/`)

export const createSchedule = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/schedules/', data)

export const updateSchedule = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/schedules/${id}/`, data)

export const patchSchedule = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/schedules/${id}/`, data)

export const deleteSchedule = (id: number) =>
  apiClient.delete(`/api/v1/schedules/${id}/`)

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const getTasks = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/tasks/', { params })

export const getTask = (id: number) =>
  apiClient.get(`/api/v1/tasks/${id}/`)

export const createTask = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/tasks/', data)

export const updateTask = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/tasks/${id}/`, data)

export const patchTask = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/tasks/${id}/`, data)

export const deleteTask = (id: number) =>
  apiClient.delete(`/api/v1/tasks/${id}/`)

// ─── Timelines ───────────────────────────────────────────────────────────────

export const getTimelines = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/timelines/', { params })

export const getTimeline = (id: number) =>
  apiClient.get(`/api/v1/timelines/${id}/`)

export const createTimeline = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/timelines/', data)

export const updateTimeline = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/timelines/${id}/`, data)

export const patchTimeline = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/timelines/${id}/`, data)

export const deleteTimeline = (id: number) =>
  apiClient.delete(`/api/v1/timelines/${id}/`)
