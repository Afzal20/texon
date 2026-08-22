"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "employee-profile"
  | "worker-id"
  | "department-designation"
  | "shift-schedule"
  | "attendance"
  | "overtime"
  | "leave"
  | "salary-sheet"
  | "bonus"
  | "payroll-approval"
  | "compliance-reports"

type WorkspaceConfig = {
  title: string
  eyebrow: string
  description: string
  action: string
  tableTitle: string
  tableDescription: string
  columns: string[]
  statusIndex?: number
  sideTitle: string
  sideDescription: string
}

const configs: Record<ModuleKey, WorkspaceConfig> = {
  "employee-profile": {
    title: "Employee Profile",
    eyebrow: "Employee management",
    description: "Manage employee profiles with personal details, employment history, and document attachments.",
    action: "Add employee",
    tableTitle: "Employee register",
    tableDescription: "Active employee profiles.",
    columns: ["ID", "Name", "Department", "Designation", "Join date", "Status"],
    statusIndex: 5,
    sideTitle: "Department split",
    sideDescription: "Employees by department.",
  },
  "worker-id": {
    title: "Worker ID",
    eyebrow: "ID management",
    description: "Issue and manage worker identification cards with biometric and access data.",
    action: "Issue ID",
    tableTitle: "Worker ID register",
    tableDescription: "Worker ID status and issuance.",
    columns: ["Worker ID", "Name", "Department", "Issued", "Expiry", "Status"],
    statusIndex: 5,
    sideTitle: "ID status",
    sideDescription: "Current ID status.",
  },
  "department-designation": {
    title: "Department & Designation",
    eyebrow: "Org structure",
    description: "Manage organizational departments, designations, and reporting hierarchies.",
    action: "Add department",
    tableTitle: "Department register",
    tableDescription: "Organizational departments and headcount.",
    columns: ["Department", "Head", "Headcount", "Budget", "Vacancies", "Status"],
    statusIndex: 5,
    sideTitle: "Headcount distribution",
    sideDescription: "Employees by department tier.",
  },
  "shift-schedule": {
    title: "Shift Schedule",
    eyebrow: "Shift management",
    description: "Manage employee shift schedules, rotations, and shift-based attendance patterns.",
    action: "Create schedule",
    tableTitle: "Shift schedule register",
    tableDescription: "Today's shift assignments.",
    columns: ["Shift", "Time", "Lines", "Workers", "Supervisor", "Status"],
    statusIndex: 5,
    sideTitle: "Shift coverage",
    sideDescription: "Workers by shift.",
  },
  "attendance": {
    title: "Attendance",
    eyebrow: "Attendance tracking",
    description: "Track daily attendance with biometric verification, late arrivals, and absent management.",
    action: "Log attendance",
    tableTitle: "Attendance register",
    tableDescription: "Today's attendance summary.",
    columns: ["Department", "Total", "Present", "Absent", "Late", "Rate"],
    statusIndex: 5,
    sideTitle: "Attendance trend",
    sideDescription: "Weekly attendance rate.",
  },
  "overtime": {
    title: "Overtime",
    eyebrow: "OT management",
    description: "Track and manage overtime requests, approvals, and overtime pay calculations.",
    action: "Request overtime",
    tableTitle: "Overtime register",
    tableDescription: "Overtime requests and approvals.",
    columns: ["OT #", "Worker", "Line", "Hours", "Reason", "Status"],
    statusIndex: 5,
    sideTitle: "OT by line",
    sideDescription: "Overtime hours by line.",
  },
  "leave": {
    title: "Leave",
    eyebrow: "Leave management",
    description: "Manage employee leave requests, balances, and leave policy compliance.",
    action: "Request leave",
    tableTitle: "Leave register",
    tableDescription: "Leave requests and status.",
    columns: ["Leave #", "Employee", "Type", "Days", "Period", "Status"],
    statusIndex: 5,
    sideTitle: "Leave type",
    sideDescription: "Monthly leave breakdown.",
  },
  "salary-sheet": {
    title: "Salary Sheet",
    eyebrow: "Payroll",
    description: "Generate and manage monthly salary sheets with basic pay, allowances, and deductions.",
    action: "Generate sheet",
    tableTitle: "Salary sheet register",
    tableDescription: "Monthly salary summary by department.",
    columns: ["Department", "Workers", "Basic", "Allowances", "Deductions", "Net"],
    statusIndex: 5,
    sideTitle: "Pay structure",
    sideDescription: "Salary composition.",
  },
  "bonus": {
    title: "Bonus",
    eyebrow: "Bonus management",
    description: "Manage festival bonuses, performance bonuses, and incentive calculations.",
    action: "Calculate bonus",
    tableTitle: "Bonus register",
    tableDescription: "Bonus calculations and disbursement.",
    columns: ["Period", "Type", "Eligible", "Pool", "Avg.", "Status"],
    statusIndex: 5,
    sideTitle: "Bonus type",
    sideDescription: "Quarterly bonus breakdown.",
  },
  "payroll-approval": {
    title: "Payroll Approval",
    eyebrow: "Payroll workflow",
    description: "Review and approve payroll runs with multi-level approval workflow.",
    action: "Review payroll",
    tableTitle: "Payroll approval register",
    tableDescription: "Payroll runs and approval status.",
    columns: ["Period", "Gross", "Deductions", "Net", "Submitted", "Status"],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Monthly payroll status.",
  },
  "compliance-reports": {
    title: "Compliance Reports",
    eyebrow: "HR compliance",
    description: "Generate and track HR compliance reports including labor law and buyer audit requirements.",
    action: "Generate report",
    tableTitle: "Compliance report register",
    tableDescription: "HR compliance reports and audit status.",
    columns: ["Report", "Type", "Period", "Generated", "Auditor", "Status"],
    statusIndex: 5,
    sideTitle: "Report type",
    sideDescription: "Monthly compliance reports.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function HRWorkspace({ module, metrics, rows, rawItems }: { module: ModuleKey; metrics?: Metric[]; rows?: string[][]; rawItems?: Record<string, unknown>[] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? []
  const resolvedRows = rows ?? []

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/hr" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> HR, Attendance & Payroll
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{config.eyebrow}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.success(`${config.title} exported`)}><Download className="size-4" /> Export</Button>
            <Button className="gap-2" onClick={() => toast.info(`${config.action} form opened`)}><Plus className="size-4" /> {config.action}</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resolvedMetrics.map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Users className="size-4 text-muted-foreground" />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="gap-0 py-0 xl:col-span-2">
            <CardHeader className="border-b px-5 py-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <CardTitle>{config.tableTitle}</CardTitle>
                  <CardDescription>{config.tableDescription}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Advanced filters are ready to configure")}><Filter className="size-3.5" /> Filter</Button>
              </div>
              <div className="relative mt-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-9 text-sm" placeholder={`Search ${config.tableTitle.toLowerCase()}...`} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full text-xs sm:text-[13px]">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-3 py-2.5 font-semibold whitespace-nowrap">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resolvedRows !== undefined && resolvedRows.length === 0 && (
                      <tr><td colSpan={config.columns.length} className="px-3 py-8 text-center text-xs text-muted-foreground">No records yet.</td></tr>
                    )}
                    {resolvedRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 whitespace-nowrap ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${noticeClass(cell as "amber" | "rose" | "emerald")}`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>{(resolvedRows ?? []).length} record(s)</span>
                <button className="flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => toast.info("Opening full register")}>View all <ArrowUpRight className="size-3" /></button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
                <CardDescription>{config.sideDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                {(() => {
                  const items = rawItems ?? []
                  const field = items.some((i) => "status_display" in i) ? "status_display" : "status"
                  const dist = tallyBy(items, field).slice(0, 3)
                  const total = items.length || 1
                  if (dist.length === 0) return <p className="text-xs text-muted-foreground">No data yet.</p>
                  return dist.map((item) => (
                    <div key={item.value}>
                      <div className="mb-1.5 flex items-center justify-between text-xs"><span className="capitalize text-muted-foreground">{item.value.replace(/_/g, " ")}</span><span className="font-medium text-foreground">{item.count} · {Math.round((item.count / total) * 100)}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / total) * 100}%` }} /></div>
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> HR attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {(() => {
                  const items = rawItems ?? []
                  const out: { title: string; detail: string; tone: "amber" | "rose" | "emerald" }[] = []
                  const rejectedCount = items.filter((i) => String(i.status ?? "") === "rejected").length
                  const pendingCount = items.filter((i) => PENDING_STATUSES.has(String(i.status ?? ""))).length
                  if (rejectedCount > 0) out.push({ title: `${rejectedCount} record(s) rejected`, detail: `Follow up on rejected entries in ${config.tableTitle.toLowerCase()}.`, tone: "rose" })
                  if (pendingCount > 0) out.push({ title: `${pendingCount} record(s) pending`, detail: `Review open items in ${config.tableTitle.toLowerCase()}.`, tone: "amber" })
                  if (out.length === 0) out.push({ title: "Nothing needs attention", detail: `No open items found in ${config.tableTitle.toLowerCase()}.`, tone: "emerald" })
                  return out.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)
                })()}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening HR task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">HR hub</p><p className="text-xs text-muted-foreground">All employee data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
