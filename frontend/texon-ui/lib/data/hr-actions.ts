"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { Employee, Attendance, ScheduleEntry, ShiftSchedule } from "./hr"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getEmployees(search?: string): Promise<Employee[]> {
  const token = await getToken()
  const params = search ? `?search=${search}` : ""
  return apiFetch(`/api/v1/employees/${params}`, {}, token)
}

export async function getAttendance(date?: string): Promise<Attendance[]> {
  const token = await getToken()
  const params = date ? `?date=${date}` : ""
  return apiFetch(`/api/v1/attendance/${params}`, {}, token)
}

export async function getSchedule(): Promise<ShiftSchedule[]> {
  const token = await getToken()
  return apiFetch("/api/v1/schedules/", {}, token)
}

export async function getDepartments(): Promise<{ id: number; name: string }[]> {
  const token = await getToken()
  return apiFetch("/api/v1/departments/", {}, token)
}

export async function getAttendanceSummary(): Promise<{
  total_workers: number
  present_today: number
  attendance_percentage: number
  on_leave: number
  unexcused_absences: number
  night_shift_percentage: number
  unassigned_staff: number
}> {
  const token = await getToken()
  return apiFetch("/api/v1/hr/attendance-summary/", {}, token)
}
