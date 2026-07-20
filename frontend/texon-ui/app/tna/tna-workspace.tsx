"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"

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
  metrics: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]
  tableTitle: string
  tableDescription: string
  columns: string[]
  rows: string[][]
  statusIndex?: number
  sideTitle: string
  sideDescription: string
  progress: { label: string; value: string; percent: number; tone: string }[]
  notices: { title: string; detail: string; tone: "amber" | "rose" | "emerald" }[]
}

const configs: Record<ModuleKey, WorkspaceConfig> = {
  "task-job-order-management-monitoring": {
    title: "Task/Job/Order Management & Monitoring",
    eyebrow: "Task management",
    description: "Manage and monitor all tasks, jobs, and orders with real-time status tracking.",
    action: "Create task",
    metrics: [
      { label: "Active tasks", value: "48", note: "Across all orders", trend: "neutral" },
      { label: "Completed today", value: "12", note: "32% completion rate", trend: "up" },
      { label: "Overdue tasks", value: "4", note: "Past deadline", trend: "down" },
      { label: "Avg. completion", value: "2.4 days", note: "Task turnaround", trend: "up" },
    ],
    tableTitle: "Task register",
    tableDescription: "Active tasks and orders.",
    columns: ["Task #", "Order", "Task", "Owner", "Due", "Status"],
    rows: [
      ["TK-2418", "PO-84920", "Fabric sourcing", "M. Rahman", "16 Oct", "In progress"],
      ["TK-2415", "PO-85107", "Pattern making", "S. Ahmed", "14 Oct", "Overdue"],
      ["TK-2412", "PO-85241", "Sample approval", "F. Islam", "18 Oct", "Pending"],
      ["TK-2408", "PO-85322", "Bulk cutting", "T. Hasan", "20 Oct", "Scheduled"],
    ],
    statusIndex: 5,
    sideTitle: "Task pipeline",
    sideDescription: "Tasks by status.",
    progress: [
      { label: "In progress", value: "24 tasks", percent: 50, tone: "bg-primary" },
      { label: "Completed", value: "16 tasks", percent: 33, tone: "bg-emerald-500" },
      { label: "Overdue", value: "4 tasks", percent: 8, tone: "bg-rose-500" },
      { label: "Pending", value: "4 tasks", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "4 tasks overdue", detail: "TK-2415 pattern making was due Oct 14 — escalate with team.", tone: "rose" }],
  },
  "task-scheduling-front-back-calculation": {
    title: "Task Scheduling (Front/Back Calculation)",
    eyebrow: "Schedule planning",
    description: "Schedule tasks with forward and backward date calculations for optimal timeline planning.",
    action: "Create schedule",
    metrics: [
      { label: "Schedules active", value: "14", note: "Order schedules", trend: "neutral" },
      { label: "On schedule", value: "86%", note: "12 of 14", trend: "up" },
      { label: "Behind schedule", value: "2", note: "Need attention", trend: "down" },
      { label: "Lead time avg.", value: "42 days", note: "Order to shipment", trend: "neutral" },
    ],
    tableTitle: "Schedule register",
    tableDescription: "Order schedules with front/back calculations.",
    columns: ["Order", "Start date", "End date", "Lead time", "Progress", "Status"],
    rows: [
      ["PO-84920", "01 Oct", "15 Nov", "45 days", "68%", "On track"],
      ["PO-85107", "05 Oct", "22 Nov", "48 days", "42%", "Behind"],
      ["PO-85241", "08 Oct", "08 Nov", "31 days", "84%", "On track"],
      ["PO-85322", "12 Oct", "01 Nov", "20 days", "56%", "On track"],
    ],
    statusIndex: 5,
    sideTitle: "Schedule accuracy",
    sideDescription: "Monthly schedule adherence.",
    progress: [
      { label: "On track", value: "12 orders", percent: 86, tone: "bg-emerald-500" },
      { label: "Behind", value: "2 orders", percent: 14, tone: "bg-rose-500" },
    ],
    notices: [{ title: "PO-85107 behind schedule", detail: "Zara cargo pant — fabric sourcing delayed 5 days.", tone: "rose" }],
  },
  "sms-email-auto-alarm-notification": {
    title: "SMS, Email, Auto-Alarm Notification",
    eyebrow: "Notifications",
    description: "Configure and send SMS, email, and auto-alarm notifications for task deadlines and milestones.",
    action: "Send notification",
    metrics: [
      { label: "Notifications sent", value: "248", note: "This month", trend: "up" },
      { label: "Auto-alarms active", value: "18", note: "Deadline triggers", trend: "neutral" },
      { label: "Delivery rate", value: "98.4%", note: "SMS + email", trend: "up" },
      { label: "Pending", value: "6", note: "Scheduled", trend: "neutral" },
    ],
    tableTitle: "Notification log",
    tableDescription: "Recent notifications sent.",
    columns: ["Ref", "Type", "Recipient", "Subject", "Sent", "Status"],
    rows: [
      ["NT-2418", "Email", "M. Rahman", "PO-84920 deadline reminder", "14 Oct", "Delivered"],
      ["NT-2415", "SMS", "S. Ahmed", "Task overdue alert", "14 Oct", "Delivered"],
      ["NT-2412", "Auto-alarm", "F. Islam", "Sample approval due", "14 Oct", "Triggered"],
      ["NT-2408", "Email", "T. Hasan", "Schedule update", "13 Oct", "Delivered"],
    ],
    statusIndex: 5,
    sideTitle: "Notification type",
    sideDescription: "Monthly notification breakdown.",
    progress: [
      { label: "Email", value: "180 msgs", percent: 73, tone: "bg-primary" },
      { label: "SMS", value: "48 msgs", percent: 19, tone: "bg-emerald-500" },
      { label: "Auto-alarm", value: "20 triggers", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "6 notifications scheduled", detail: "Auto-alarms queued for tomorrow's deadline reminders.", tone: "amber" }],
  },
  "export-import-data-in-csv-excel": {
    title: "Export/Import Data in CSV/Excel",
    eyebrow: "Data import/export",
    description: "Import and export task data in CSV and Excel formats for reporting and integration.",
    action: "Import data",
    metrics: [
      { label: "Exports this month", value: "24", note: "CSV & Excel", trend: "up" },
      { label: "Imports completed", value: "8", note: "Data uploads", trend: "up" },
      { label: "Records processed", value: "12,400", note: "Total rows", trend: "neutral" },
      { label: "Error rate", value: "0.4%", note: "Import errors", trend: "up" },
    ],
    tableTitle: "Import/export log",
    tableDescription: "Recent data import/export operations.",
    columns: ["Ref", "Type", "Format", "Records", "User", "Status"],
    rows: [
      ["IE-2418", "Export", "Excel", "1,240", "M. Rahman", "Complete"],
      ["IE-2415", "Export", "CSV", "860", "S. Ahmed", "Complete"],
      ["IE-2412", "Import", "Excel", "2,400", "F. Islam", "Complete"],
      ["IE-2408", "Import", "CSV", "180", "T. Hasan", "Failed"],
    ],
    statusIndex: 5,
    sideTitle: "Operation type",
    sideDescription: "Monthly import/export breakdown.",
    progress: [
      { label: "Exports", value: "24 ops", percent: 75, tone: "bg-primary" },
      { label: "Imports", value: "8 ops", percent: 25, tone: "bg-emerald-500" },
    ],
    notices: [{ title: "IE-2408 import failed", detail: "CSV format error — check column headers and retry.", tone: "rose" }],
  },
  "graphic-view-of-task-job-order-status": {
    title: "Graphic View of Task/Job/Order Status",
    eyebrow: "Visual status",
    description: "Visual dashboard showing task, job, and order status with Gantt charts and progress indicators.",
    action: "Refresh view",
    metrics: [
      { label: "Tasks visualized", value: "48", note: "Active tasks", trend: "neutral" },
      { label: "On track", value: "72%", note: "34 tasks", trend: "up" },
      { label: "At risk", value: "18%", note: "8 tasks", trend: "down" },
      { label: "Critical", value: "10%", note: "4 tasks", trend: "down" },
    ],
    tableTitle: "Status overview",
    tableDescription: "Visual status by order.",
    columns: ["Order", "Total tasks", "Completed", "In progress", "At risk", "Health"],
    rows: [
      ["PO-84920", "12", "8", "3", "1", "Good"],
      ["PO-85107", "10", "4", "4", "2", "At risk"],
      ["PO-85241", "8", "6", "2", "0", "Excellent"],
      ["PO-85322", "6", "3", "2", "1", "Fair"],
    ],
    statusIndex: 5,
    sideTitle: "Order health",
    sideDescription: "Orders by health status.",
    progress: [
      { label: "Good / Excellent", value: "2 orders", percent: 50, tone: "bg-emerald-500" },
      { label: "Fair", value: "1 order", percent: 25, tone: "bg-primary" },
      { label: "At risk", value: "1 order", percent: 25, tone: "bg-amber-500" },
    ],
    notices: [{ title: "PO-85107 at risk", detail: "2 tasks behind schedule — review timeline.", tone: "amber" }],
  },
  "critical-path-analysis": {
    title: "Critical Path Analysis",
    eyebrow: "CPM tracking",
    description: "Identify and track critical path tasks that directly impact order delivery timelines.",
    action: "Run analysis",
    metrics: [
      { label: "Critical tasks", value: "14", note: "On critical path", trend: "neutral" },
      { label: "On track", value: "10", note: "71% adherence", trend: "up" },
      { label: "Behind critical", value: "4", note: "Delay risk", trend: "down" },
      { label: "Buffer remaining", value: "6 days", note: "Avg. float", trend: "neutral" },
    ],
    tableTitle: "Critical path register",
    tableDescription: "Critical path tasks and status.",
    columns: ["Task", "Order", "Duration", "Float", "Owner", "Status"],
    rows: [
      ["Fabric sourcing", "PO-84920", "14 days", "2 days", "M. Rahman", "On track"],
      ["Pattern making", "PO-85107", "10 days", "-3 days", "S. Ahmed", "Behind"],
      ["Sample approval", "PO-85241", "7 days", "4 days", "F. Islam", "On track"],
      ["Bulk cutting", "PO-85322", "5 days", "1 day", "T. Hasan", "On track"],
    ],
    statusIndex: 5,
    sideTitle: "Path adherence",
    sideDescription: "Critical path status.",
    progress: [
      { label: "On track", value: "10 tasks", percent: 71, tone: "bg-emerald-500" },
      { label: "Behind critical", value: "4 tasks", percent: 29, tone: "bg-rose-500" },
    ],
    notices: [{ title: "4 tasks on critical path behind", detail: "Negative float on PO-85107 pattern making — escalate immediately.", tone: "rose" }],
  },
  "task-splitting-at-any-level": {
    title: "Task Splitting at Any Level",
    eyebrow: "Task decomposition",
    description: "Split tasks into sub-tasks at any level for granular tracking and management.",
    action: "Split task",
    metrics: [
      { label: "Split tasks", value: "24", note: "Decomposed tasks", trend: "neutral" },
      { label: "Sub-tasks created", value: "86", note: "Total sub-tasks", trend: "up" },
      { label: "Completion rate", value: "78%", note: "Sub-tasks done", trend: "up" },
      { label: "Avg. depth", value: "2.4 levels", note: "Split depth", trend: "neutral" },
    ],
    tableTitle: "Task split register",
    tableDescription: "Tasks split into sub-tasks.",
    columns: ["Parent", "Sub-task", "Level", "Owner", "Progress", "Status"],
    rows: [
      ["Fabric sourcing", "Vendor selection", "L1", "M. Rahman", "100%", "Complete"],
      ["Fabric sourcing", "Price negotiation", "L1", "M. Rahman", "80%", "In progress"],
      ["Pattern making", "Digital pattern", "L1", "S. Ahmed", "60%", "In progress"],
      ["Pattern making", "Grading", "L2", "S. Ahmed", "0%", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Split depth",
    sideDescription: "Tasks by split level.",
    progress: [
      { label: "Level 1", value: "48 sub-tasks", percent: 56, tone: "bg-primary" },
      { label: "Level 2", value: "28 sub-tasks", percent: 33, tone: "bg-emerald-500" },
      { label: "Level 3+", value: "10 sub-tasks", percent: 11, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Grading sub-task pending", detail: "L2 sub-task of pattern making — cannot proceed until digital pattern completes.", tone: "amber" }],
  },
  "task-dependency-specification": {
    title: "Task Dependency Specification",
    eyebrow: "Dependencies",
    description: "Define and manage task dependencies including finish-to-start, start-to-start, and lag times.",
    action: "Add dependency",
    metrics: [
      { label: "Dependencies defined", value: "36", note: "Across all orders", trend: "neutral" },
      { label: "Violations", value: "2", note: "Broken dependencies", trend: "down" },
      { label: "Auto-resolved", value: "8", note: "System resolved", trend: "up" },
      { label: "Manual review", value: "4", note: "Pending action", trend: "neutral" },
    ],
    tableTitle: "Dependency register",
    tableDescription: "Task dependencies and status.",
    columns: ["From task", "To task", "Type", "Lag", "Order", "Status"],
    rows: [
      ["Fabric sourcing", "Pattern making", "FS", "2 days", "PO-84920", "Met"],
      ["Pattern making", "Sample making", "FS", "1 day", "PO-85107", "Violated"],
      ["Sample approval", "Bulk cutting", "FS", "0 days", "PO-85241", "Met"],
      ["Cutting", "Sewing", "SS", "1 day", "PO-85322", "Met"],
    ],
    statusIndex: 5,
    sideTitle: "Dependency type",
    sideDescription: "Dependencies by type.",
    progress: [
      { label: "Met", value: "30 deps", percent: 83, tone: "bg-emerald-500" },
      { label: "Violated", value: "2 deps", percent: 6, tone: "bg-rose-500" },
      { label: "Pending", value: "4 deps", percent: 11, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 dependency violations", detail: "PO-85107 pattern→sample dependency broken due to upstream delay.", tone: "rose" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function TnAWorkspace({ module, metrics, rows }: { module: ModuleKey; metrics?: WorkspaceConfig["metrics"]; rows?: WorkspaceConfig["rows"] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? config.metrics
  const resolvedRows = rows ?? config.rows

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
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resolvedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-medium" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${noticeClass(cell as "amber" | "rose" | "emerald")}`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>Showing 4 of 24 records</span>
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
                {config.progress.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-muted-foreground">{item.label}</span><span className="font-medium text-foreground">{item.value}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.percent}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> TnA attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening TnA task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">TnA hub</p><p className="text-xs text-muted-foreground">All task data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
