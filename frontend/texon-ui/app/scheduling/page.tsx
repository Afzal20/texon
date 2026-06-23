"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Users, AlertTriangle, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type ShiftCell = {
  shift: string
  staff: string
  max: number
  current: number
  alert?: boolean
}

type ScheduleRow = {
  dept: string
  cells: ShiftCell[][]  // [dayIndex][shiftIndex]
}

const days = ["Mon 16", "Tue 17", "Wed 18", "Thu 19 (Current)", "Fri 20"]

const schedule: ScheduleRow[] = [
  {
    dept: "Sewing Line 1",
    cells: [
      [{ shift: "Day (08-17)", staff: "120/120", max: 120, current: 120 }],
      [{ shift: "Day (08-17)", staff: "120/120", max: 120, current: 120 }],
      [{ shift: "Day (08-17)", staff: "118/120", max: 120, current: 118 }],
      [{ shift: "Day (08-17)", staff: "105/120", max: 120, current: 105, alert: true }],
      [{ shift: "Day (08-17)", staff: "120/120", max: 120, current: 120 }],
    ],
  },
  {
    dept: "Sewing Line 2",
    cells: [
      [{ shift: "Night (20-05)", staff: "100/100", max: 100, current: 100 }],
      [{ shift: "Night (20-05)", staff: "100/100", max: 100, current: 100 }],
      [{ shift: "Night (20-05)", staff: "100/100", max: 100, current: 100 }],
      [{ shift: "Night (20-05)", staff: "98/100",  max: 100, current: 98 }],
      [{ shift: "Night (20-05)", staff: "100/100", max: 100, current: 100 }],
    ],
  },
  {
    dept: "Finishing",
    cells: [
      [{ shift: "General (09-18)", staff: "45/45", max: 45, current: 45 }],
      [{ shift: "General (09-18)", staff: "45/45", max: 45, current: 45 }],
      [{ shift: "General (09-18)", staff: "45/45", max: 45, current: 45 }],
      [{ shift: "General (09-18)", staff: "45/45", max: 45, current: 45 }],
      [{ shift: "General (09-18)", staff: "45/45", max: 45, current: 45 }],
    ],
  },
  {
    dept: "Quality Control",
    cells: [
      [{ shift: "Day (08-17)",    staff: "15/15", max: 15, current: 15 }, { shift: "Night (20-05)", staff: "10/10", max: 10, current: 10 }],
      [{ shift: "Day (08-17)",    staff: "15/15", max: 15, current: 15 }, { shift: "Night (20-05)", staff: "10/10", max: 10, current: 10 }],
      [{ shift: "Day (08-17)",    staff: "15/15", max: 15, current: 15 }, { shift: "Night (20-05)", staff: "10/10", max: 10, current: 10 }],
      [{ shift: "Day (08-17)",    staff: "15/15", max: 15, current: 15 }, { shift: "Night (20-05)", staff: "8/10",  max: 10, current: 8, alert: true }],
      [{ shift: "Day (08-17)",    staff: "15/15", max: 15, current: 15 }, { shift: "Night (20-05)", staff: "10/10", max: 10, current: 10 }],
    ],
  },
]

const available = [
  { name: "Rahim Uddin",  role: "Sewing Operator",  id: "EMP-8821", grade: "A-Grade", gradeColor: "bg-emerald-100 text-emerald-700" },
  { name: "Salma Begum",  role: "Quality Checker",   id: "EMP-9012", grade: "B-Grade", gradeColor: "bg-blue-100 text-blue-700" },
  { name: "Abdul Karim",  role: "Line Supervisor",   id: "EMP-4521", grade: "A-Grade", gradeColor: "bg-emerald-100 text-emerald-700" },
]

export default function Scheduling() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shift Scheduling & Rotation</h2>
            <p className="text-muted-foreground mt-1 text-sm">Week 42: Oct 16 – Oct 22, 2023</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Create Manual Shift</Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Sparkles className="h-4 w-4" /> Generate Auto-Schedule
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Workers Scheduled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">2,450</div>
              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-2">↑ +4%</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Night Shift Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">35%</div>
                <div className="text-xs text-muted-foreground">Target: &lt; 40%</div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "35%" }} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-red-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unassigned Staff</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">12</div>
              <p className="text-xs text-red-600 font-semibold mt-2">Needs action</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Schedule Table */}
          <Card className="lg:col-span-2 bg-white border-border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="text-base font-semibold">Department Schedule</CardTitle>
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/30 inline-block border border-primary/40"/>Day</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted inline-block border border-border"/>Night</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted/60 inline-block border border-border"/>General</span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">Line / Dept</th>
                    {days.map((d, i) => (
                      <th key={d} className={cn("px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap text-center", i === 3 ? "bg-primary/5 text-primary" : "")}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.dept} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap align-top">{row.dept}</td>
                      {row.cells.map((dayShifts, dayIdx) => (
                        <td key={dayIdx} className={cn("px-2 py-2 align-top", dayIdx === 3 ? "bg-primary/5" : "")}>
                          {dayShifts.map((cell, si) => (
                            <div
                              key={si}
                              className={cn(
                                "mb-1 last:mb-0 rounded px-2 py-1.5",
                                cell.alert ? "bg-red-50 border border-red-200" : "bg-muted/40"
                              )}
                            >
                              <div className="font-medium text-[10px] text-muted-foreground">{cell.shift}</div>
                              <div className={cn("font-bold text-xs mt-0.5", cell.alert ? "text-red-600" : "text-foreground")}>
                                {cell.alert && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                                {cell.staff} staff
                              </div>
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Available for Assignment */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Available for Assignment</CardTitle>
                <span className="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">12</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Filter staff..." className="pl-8 h-8 text-xs" />
              </div>
              {available.map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{staff.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{staff.role}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">ID: {staff.id}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${staff.gradeColor}`}>{staff.grade}</span>
                </div>
              ))}
              <button className="w-full text-xs text-primary font-semibold py-2 border border-dashed border-primary/30 rounded-lg hover:bg-accent/50 transition-colors">
                + 9 more unassigned
              </button>
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
