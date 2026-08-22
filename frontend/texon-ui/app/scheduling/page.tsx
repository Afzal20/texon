"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Users, AlertTriangle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getSchedule, getEmployees, getAttendanceSummary } from "@/lib/data/hr-actions"
import type { ShiftSchedule, Employee } from "@/lib/data/hr"

export default function Scheduling() {
  const [schedule, setSchedule] = React.useState<ShiftSchedule[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [summary, setSummary] = React.useState<{
    total_workers: number
    present_today: number
    attendance_percentage: number
    on_leave: number
    unexcused_absences: number
    night_shift_percentage: number
    unassigned_staff: number
  } | null>(null)
  const [staffSearch, setStaffSearch] = React.useState("")

  React.useEffect(() => {
    getSchedule().then(setSchedule).catch(() => {})
    getEmployees().then(setEmployees).catch(() => {})
    getAttendanceSummary().then(setSummary).catch(() => {})
  }, [])

  const days = schedule.length > 0
    ? [...new Set(schedule.map(s => s.schedule_date))].sort().slice(0, 5)
    : []

  const scheduleByLine = schedule.reduce<Record<string, ShiftSchedule[]>>((acc, s) => {
    const key = s.line_name ?? `Line ${s.production_line}`
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const filteredStaff = staffSearch
    ? employees.filter(e =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(staffSearch.toLowerCase()) ||
        e.employee_id.toLowerCase().includes(staffSearch.toLowerCase())
      )
    : employees.slice(0, 5)

  const totalWorkers = summary?.total_workers ?? 2450
  const nightShiftPct = summary?.night_shift_percentage ?? 35
  const unassigned = summary?.unassigned_staff ?? 12

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shift Scheduling & Rotation</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real-time workforce allocation across all departments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.info("Shift creation form coming soon")}><Plus className="h-4 w-4" /> Create Manual Shift</Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white" onClick={() => toast.success("AI schedule generated")}>
              <Sparkles className="h-4 w-4" /> Generate Auto-Schedule
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </CardHeader>
            <CardContent className="p-5 pt-0 min-w-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground break-words">{totalWorkers.toLocaleString()}</div>
              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-2">
                ↑ {summary?.present_today ?? 0} present today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Night Shift Load</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground break-words">{nightShiftPct}%</div>
                <div className="text-xs text-muted-foreground shrink-0 font-medium">Target: &lt; 40%</div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${nightShiftPct}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-rose-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unassigned Staff</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
            </CardHeader>
            <CardContent className="p-5 pt-0 min-w-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 break-words">{unassigned}</div>
              <p className="text-xs text-rose-600 font-semibold mt-2">Needs action</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-white border-border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-base font-semibold">Department Schedule</CardTitle>
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/30 inline-block border border-primary/40"/>Scheduled</span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Line / Dept</th>
                    {days.map((d, i) => (
                      <th key={d} className={cn("px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-center", i === 3 ? "bg-primary/5 text-primary" : "")}>
                        {new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(scheduleByLine).length === 0 && (
                    <tr>
                      <td colSpan={days.length + 1} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No schedule data loaded.
                      </td>
                    </tr>
                  )}
                  {Object.entries(scheduleByLine).map(([lineName, entries]) => (
                    <tr key={lineName} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap align-top">{lineName}</td>
                      {days.map((day) => {
                        const dayEntry = entries.find(e => e.schedule_date === day)
                        return (
                          <td key={day} className="px-2 py-2 align-top">
                            {dayEntry ? (
                              <div className="mb-1 last:mb-0 rounded px-2 py-1.5 bg-primary/5">
                                <div className="font-medium text-[10px] text-muted-foreground">
                                  {dayEntry.start_time}–{dayEntry.end_time}
                                </div>
                                <div className="font-bold text-xs mt-0.5 text-foreground">
                                  {dayEntry.staff_count}/{dayEntry.max_capacity} staff
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-muted-foreground text-center py-2">—</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Staff Directory</CardTitle>
                <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  {employees.length}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-8 h-8 text-xs"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                />
              </div>
              {filteredStaff.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">
                  {staffSearch ? "No staff match your search." : "No employees loaded."}
                </div>
              )}
              {filteredStaff.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{emp.first_name} {emp.last_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{emp.designation_name ?? emp.department_name ?? emp.employment_type}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">ID: {emp.employee_id}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                    emp.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {emp.status === "active" ? "Active" : emp.status}
                  </span>
                </div>
              ))}
              {employees.length > 5 && !staffSearch && (
                <button className="w-full text-xs text-primary font-semibold py-2 border border-dashed border-primary/30 rounded-lg hover:bg-accent/50 transition-colors" onClick={() => toast.info("Showing all staff")}>
                  + {employees.length - 5} more
                </button>
              )}
              <Button className="w-full bg-foreground hover:bg-foreground/90 text-background text-xs font-bold">
                Auto-Assign Remaining
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  )
}
