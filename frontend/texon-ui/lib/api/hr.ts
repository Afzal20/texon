import apiClient from './client'

// ─── Attendance ──────────────────────────────────────────────────────────────

export const getAttendance = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/attendance/', { params })

export const getAttendanceRecord = (id: number) =>
  apiClient.get(`/api/v1/attendance/${id}/`)

export const createAttendance = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/attendance/', data)

export const updateAttendance = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/attendance/${id}/`, data)

export const patchAttendance = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/attendance/${id}/`, data)

export const deleteAttendance = (id: number) =>
  apiClient.delete(`/api/v1/attendance/${id}/`)

// ─── Bonuses ─────────────────────────────────────────────────────────────────

export const getBonuses = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/bonuses/', { params })

export const getBonus = (id: number) =>
  apiClient.get(`/api/v1/bonuses/${id}/`)

export const createBonus = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/bonuses/', data)

export const updateBonus = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/bonuses/${id}/`, data)

export const patchBonus = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/bonuses/${id}/`, data)

export const deleteBonus = (id: number) =>
  apiClient.delete(`/api/v1/bonuses/${id}/`)

// ─── Departments ─────────────────────────────────────────────────────────────

export const getDepartments = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/departments/', { params })

export const getDepartment = (id: number) =>
  apiClient.get(`/api/v1/departments/${id}/`)

export const createDepartment = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/departments/', data)

export const updateDepartment = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/departments/${id}/`, data)

export const patchDepartment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/departments/${id}/`, data)

export const deleteDepartment = (id: number) =>
  apiClient.delete(`/api/v1/departments/${id}/`)

// ─── Designations ────────────────────────────────────────────────────────────

export const getDesignations = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/designations/', { params })

export const getDesignation = (id: number) =>
  apiClient.get(`/api/v1/designations/${id}/`)

export const createDesignation = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/designations/', data)

export const updateDesignation = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/designations/${id}/`, data)

export const patchDesignation = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/designations/${id}/`, data)

export const deleteDesignation = (id: number) =>
  apiClient.delete(`/api/v1/designations/${id}/`)

// ─── Employees ───────────────────────────────────────────────────────────────

export const getEmployees = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/employees/', { params })

export const getEmployee = (id: number) =>
  apiClient.get(`/api/v1/employees/${id}/`)

export const createEmployee = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/employees/', data)

export const updateEmployee = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/employees/${id}/`, data)

export const patchEmployee = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/employees/${id}/`, data)

export const deleteEmployee = (id: number) =>
  apiClient.delete(`/api/v1/employees/${id}/`)

// ─── Leaves ──────────────────────────────────────────────────────────────────

export const getLeaves = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/leaves/', { params })

export const getLeave = (id: number) =>
  apiClient.get(`/api/v1/leaves/${id}/`)

export const createLeave = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/leaves/', data)

export const updateLeave = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/leaves/${id}/`, data)

export const patchLeave = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/leaves/${id}/`, data)

export const deleteLeave = (id: number) =>
  apiClient.delete(`/api/v1/leaves/${id}/`)

// ─── Overtime ────────────────────────────────────────────────────────────────

export const getOvertime = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/overtime/', { params })

export const getOvertimeRecord = (id: number) =>
  apiClient.get(`/api/v1/overtime/${id}/`)

export const createOvertime = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/overtime/', data)

export const updateOvertime = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/overtime/${id}/`, data)

export const patchOvertime = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/overtime/${id}/`, data)

export const deleteOvertime = (id: number) =>
  apiClient.delete(`/api/v1/overtime/${id}/`)

// ─── Performance Records ─────────────────────────────────────────────────────

export const getPerformanceRecords = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/performance-records/', { params })

export const getPerformanceRecord = (id: number) =>
  apiClient.get(`/api/v1/performance-records/${id}/`)

export const createPerformanceRecord = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/performance-records/', data)

export const updatePerformanceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/performance-records/${id}/`, data)

export const patchPerformanceRecord = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/performance-records/${id}/`, data)

export const deletePerformanceRecord = (id: number) =>
  apiClient.delete(`/api/v1/performance-records/${id}/`)

// ─── Salary Sheets ───────────────────────────────────────────────────────────

export const getSalarySheets = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/salary-sheets/', { params })

export const getSalarySheet = (id: number) =>
  apiClient.get(`/api/v1/salary-sheets/${id}/`)

export const createSalarySheet = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/salary-sheets/', data)

export const updateSalarySheet = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/salary-sheets/${id}/`, data)

export const patchSalarySheet = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/salary-sheets/${id}/`, data)

export const deleteSalarySheet = (id: number) =>
  apiClient.delete(`/api/v1/salary-sheets/${id}/`)
