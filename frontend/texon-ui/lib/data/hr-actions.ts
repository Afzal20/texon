"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { gqlList } from "@/lib/api/graphql"
import type { Employee, Attendance, ShiftSchedule } from "./hr"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getEmployees(search?: string): Promise<Employee[]> {
  const token = await getToken()
  const rows = (await gqlList("hr", "Employee", undefined, token)).data as unknown as Employee[]
  return search
    ? rows.filter((row) =>
        `${row.first_name} ${row.last_name} ${row.employee_id}`.toLowerCase().includes(search.toLowerCase()),
      )
    : rows
}

export async function getAttendance(date?: string): Promise<Attendance[]> {
  const token = await getToken()
  const rows = (await gqlList("hr", "Attendance", undefined, token)).data as unknown as Attendance[]
  return date ? rows.filter((row) => String(row.date).startsWith(date)) : rows
}

export async function getSchedule(): Promise<ShiftSchedule[]> {
  const token = await getToken()
  const rows = await gqlList("scheduling", "Schedule", undefined, token)
  return rows.data.map((row) => ({
    id: Number(row.id) || 0,
    production_line: 0,
    line_name: "",
    schedule_date: String(row.scheduled_date ?? row.schedule_date ?? ""),
    start_time: String(row.start_time ?? ""),
    end_time: String(row.end_time ?? ""),
    staff_count: Number(row.target_quantity ?? 0),
    max_capacity: Number(row.target_quantity ?? 0),
  }))
}

export async function getDepartments(): Promise<{ id: number; name: string }[]> {
  const token = await getToken()
  const rows = await gqlList("hr", "Department", undefined, token)
  return rows.data.map((row) => ({
    id: Number(row.id) || 0,
    name: String(row.name ?? ""),
  }))
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
  const [{ data: employees }, { data: attendance }] = await Promise.all([
    gqlList("hr", "Employee", undefined, token),
    gqlList("hr", "Attendance", undefined, token),
  ])
  const totalWorkers = employees.filter((row) => String(row.status ?? "") !== "inactive").length
  let present = 0
  let onLeave = 0
  let absent = 0
  for (const row of attendance) {
    const status = String(row.status ?? "").toLowerCase()
    if (status.includes("present")) present += 1
    else if (status.includes("leave")) onLeave += 1
    else if (status.includes("absent")) absent += 1
  }
  return {
    total_workers: totalWorkers || attendance.length,
    present_today: present,
    attendance_percentage:
      (totalWorkers || attendance.length) > 0
        ? Math.round((present / (totalWorkers || attendance.length)) * 100)
        : 0,
    on_leave: onLeave,
    unexcused_absences: absent,
    night_shift_percentage: 0,
    unassigned_staff: 0,
  }
}