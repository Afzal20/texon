"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "task-job-order-management-monitoring"
  | "task-scheduling-front-back-calculation"
  | "sms-email-auto-alarm-notification"
  | "export-import-data-in-csv-excel"
  | "graphic-view-of-task-job-order-status"
  | "critical-path-analysis"
  | "task-splitting-at-any-level"
  | "task-dependency-specification"

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
  "task-job-order-management-monitoring": {
    title: "Task/Job/Order Management & Monitoring",
    eyebrow: "Task management",
    description: "Manage and monitor all tasks, jobs, and orders with real-time status tracking.",
    action: "Create task",
    tableTitle: "Task register",
    tableDescription: "Active tasks and orders.",
    columns: ["Task #", "Order", "Task", "Owner", "Due", "Status"],
    statusIndex: 5,
    sideTitle: "Task pipeline",
    sideDescription: "Tasks by status.",
  },
  "task-scheduling-front-back-calculation": {
    title: "Task Scheduling (Front/Back Calculation)",
    eyebrow: "Schedule planning",
    description: "Schedule tasks with forward and backward date calculations for optimal timeline planning.",
    action: "Create schedule",
    tableTitle: "Schedule register",
    tableDescription: "Order schedules with front/back calculations.",
    columns: ["Order", "Start date", "End date", "Lead time", "Progress", "Status"],
    statusIndex: 5,
    sideTitle: "Schedule accuracy",
    sideDescription: "Monthly schedule adherence.",
  },
  "sms-email-auto-alarm-notification": {
    title: "SMS, Email, Auto-Alarm Notification",
    eyebrow: "Notifications",
    description: "Configure and send SMS, email, and auto-alarm notifications for task deadlines and milestones.",
    action: "Send notification",
    tableTitle: "Notification log",
    tableDescription: "Recent notifications sent.",
    columns: ["Ref", "Type", "Recipient", "Subject", "Sent", "Status"],
    statusIndex: 5,
    sideTitle: "Notification type",
    sideDescription: "Monthly notification breakdown.",
  },
  "export-import-data-in-csv-excel": {
    title: "Export/Import Data in CSV/Excel",
    eyebrow: "Data import/export",
    description: "Import and export task data in CSV and Excel formats for reporting and integration.",
    action: "Import data",
    tableTitle: "Import/export log",
    tableDescription: "Recent data import/export operations.",
    columns: ["Ref", "Type", "Format", "Records", "User", "Status"],
    statusIndex: 5,
    sideTitle: "Operation type",
    sideDescription: "Monthly import/export breakdown.",
  },
  "graphic-view-of-task-job-order-status": {
    title: "Graphic View of Task/Job/Order Status",
    eyebrow: "Visual status",
    description: "Visual dashboard showing task, job, and order status with Gantt charts and progress indicators.",
    action: "Refresh view",
    tableTitle: "Status overview",
    tableDescription: "Visual status by order.",
    columns: ["Order", "Total tasks", "Completed", "In progress", "At risk", "Health"],
    statusIndex: 5,
    sideTitle: "Order health",
    sideDescription: "Orders by health status.",
  },
  "critical-path-analysis": {
    title: "Critical Path Analysis",
    eyebrow: "CPM tracking",
    description: "Identify and track critical path tasks that directly impact order delivery timelines.",
    action: "Run analysis",
    tableTitle: "Critical path register",
    tableDescription: "Critical path tasks and status.",
    columns: ["Task", "Order", "Duration", "Float", "Owner", "Status"],
    statusIndex: 5,
    sideTitle: "Path adherence",
    sideDescription: "Critical path status.",
  },
  "task-splitting-at-any-level": {
    title: "Task Splitting at Any Level",
    eyebrow: "Task decomposition",
    description: "Split tasks into sub-tasks at any level for granular tracking and management.",
    action: "Split task",
    tableTitle: "Task split register",
    tableDescription: "Tasks split into sub-tasks.",
    columns: ["Parent", "Sub-task", "Level", "Owner", "Progress", "Status"],
    statusIndex: 5,
    sideTitle: "Split depth",
    sideDescription: "Tasks by split level.",
  },
  "task-dependency-specification": {
    title: "Task Dependency Specification",
    eyebrow: "Dependencies",
    description: "Define and manage task dependencies including finish-to-start, start-to-start, and lag times.",
    action: "Add dependency",
    tableTitle: "Dependency register",
    tableDescription: "Task dependencies and status.",
    columns: ["From task", "To task", "Type", "Lag", "Order", "Status"],
    statusIndex: 5,
    sideTitle: "Dependency type",
    sideDescription: "Dependencies by type.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function TnAWorkspace({ module, metrics, rows, rawItems }: { module: ModuleKey; metrics?: Metric[]; rows?: string[][]; rawItems?: Record<string, unknown>[] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? []
  const resolvedRows = rows ?? []

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/tna" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> TnA (Time & Action)
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Clock className="size-4 text-muted-foreground" />}
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
                    {resolvedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t transition-colors hover:bg-muted/30">
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
                <CardTitle className="flex items-center gap-2 text-base"><Clock className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> TnA attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening TnA task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">TnA hub</p><p className="text-xs text-muted-foreground">All task data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
