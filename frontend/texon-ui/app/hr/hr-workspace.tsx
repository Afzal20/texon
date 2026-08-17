"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

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
  "employee-profile": {
    title: "Employee Profile",
    eyebrow: "Employee management",
    description: "Manage employee profiles with personal details, employment history, and document attachments.",
    action: "Add employee",
    metrics: [
      { label: "Total employees", value: "1,248", note: "Across all departments", trend: "neutral" },
      { label: "New this month", value: "24", note: "Onboarded", trend: "up" },
      { label: "Active contracts", value: "1,186", note: "95% of total", trend: "up" },
      { label: "Pending verification", value: "12", note: "Documents incomplete", trend: "neutral" },
    ],
    tableTitle: "Employee register",
    tableDescription: "Active employee profiles.",
    columns: ["ID", "Name", "Department", "Designation", "Join date", "Status"],
    rows: [
      ["EMP-001", "Rafiqul Islam", "Production", "Floor Manager", "12 Jan 2020", "Active"],
      ["EMP-002", "Salma Begum", "Quality Control", "Quality Checker", "08 Mar 2021", "Active"],
      ["EMP-003", "Abdul Karim", "Production", "Line Supervisor", "15 Jun 2019", "Active"],
      ["EMP-004", "Nusrat Jahan", "Merchandising", "Merchandiser", "22 Sep 2022", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Department split",
    sideDescription: "Employees by department.",
    progress: [
      { label: "Production", value: "840 employees", percent: 67, tone: "bg-emerald-500" },
      { label: "Quality Control", value: "186 employees", percent: 15, tone: "bg-primary" },
      { label: "Support functions", value: "222 employees", percent: 18, tone: "bg-slate-400" },
    ],
    notices: [{ title: "12 profiles pending verification", detail: "Submit missing documents to complete onboarding.", tone: "amber" }],
  },
  "worker-id": {
    title: "Worker ID",
    eyebrow: "ID management",
    description: "Issue and manage worker identification cards with biometric and access data.",
    action: "Issue ID",
    metrics: [
      { label: "IDs issued", value: "1,224", note: "Active workers", trend: "neutral" },
      { label: "Pending issue", value: "24", note: "Awaiting photo/biometric", trend: "neutral" },
      { label: "Expired IDs", value: "8", note: "Need renewal", trend: "down" },
      { label: "Replacement requests", value: "4", note: "This week", trend: "neutral" },
    ],
    tableTitle: "Worker ID register",
    tableDescription: "Worker ID status and issuance.",
    columns: ["Worker ID", "Name", "Department", "Issued", "Expiry", "Status"],
    rows: [
      ["WID-1248", "Rafiqul Islam", "Production", "01 Jan 2024", "31 Dec 2025", "Active"],
      ["WID-1247", "Salma Begum", "Quality Control", "01 Jan 2024", "31 Dec 2025", "Active"],
      ["WID-1246", "Abdul Karim", "Production", "01 Jan 2024", "31 Dec 2025", "Active"],
      ["WID-1245", "Nusrat Jahan", "Merchandising", "01 Jan 2024", "31 Dec 2025", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "ID status",
    sideDescription: "Current ID status.",
    progress: [
      { label: "Active", value: "1,224 IDs", percent: 98, tone: "bg-emerald-500" },
      { label: "Expired", value: "8 IDs", percent: 1, tone: "bg-amber-500" },
      { label: "Pending", value: "16 IDs", percent: 1, tone: "bg-primary" },
    ],
    notices: [{ title: "8 IDs expired", detail: "Renew expired worker IDs to maintain access compliance.", tone: "amber" }],
  },
  "department-designation": {
    title: "Department & Designation",
    eyebrow: "Org structure",
    description: "Manage organizational departments, designations, and reporting hierarchies.",
    action: "Add department",
    metrics: [
      { label: "Total departments", value: "14", note: "Active", trend: "neutral" },
      { label: "Designations", value: "42", note: "Across departments", trend: "neutral" },
      { label: "Headcount budget", value: "1,400", note: "Approved", trend: "neutral" },
      { label: "Vacancies", value: "152", note: "Open positions", trend: "neutral" },
    ],
    tableTitle: "Department register",
    tableDescription: "Organizational departments and headcount.",
    columns: ["Department", "Head", "Headcount", "Budget", "Vacancies", "Status"],
    rows: [
      ["Production", "Rafiqul Islam", "840", "900", "60", "Active"],
      ["Quality Control", "Salma Begum", "186", "200", "14", "Active"],
      ["Merchandising", "Nusrat Jahan", "48", "60", "12", "Active"],
      ["IE & Planning", "Anisur Rahman", "24", "30", "6", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Headcount distribution",
    sideDescription: "Employees by department tier.",
    progress: [
      { label: "Production floor", value: "840", percent: 67, tone: "bg-emerald-500" },
      { label: "Quality & compliance", value: "186", percent: 15, tone: "bg-primary" },
      { label: "Support & admin", value: "222", percent: 18, tone: "bg-slate-400" },
    ],
    notices: [{ title: "152 open vacancies", detail: "Critical gaps in Production (60) and QC (14).", tone: "amber" }],
  },
  "shift-schedule": {
    title: "Shift Schedule",
    eyebrow: "Shift management",
    description: "Manage employee shift schedules, rotations, and shift-based attendance patterns.",
    action: "Create schedule",
    metrics: [
      { label: "Active shifts", value: "3", note: "Morning, Afternoon, Night", trend: "neutral" },
      { label: "Workers scheduled", value: "1,186", note: "Today", trend: "neutral" },
      { label: "Shift changes", value: "12", note: "This week", trend: "neutral" },
      { label: "Overtime workers", value: "48", note: "Extended shift", trend: "up" },
    ],
    tableTitle: "Shift schedule register",
    tableDescription: "Today's shift assignments.",
    columns: ["Shift", "Time", "Lines", "Workers", "Supervisor", "Status"],
    rows: [
      ["Morning", "08:00–17:00", "12", "480", "R. Ahmed", "Active"],
      ["Afternoon", "14:00–23:00", "8", "320", "S. Begum", "Active"],
      ["Night", "22:00–07:00", "4", "160", "M. Rahman", "Scheduled"],
      ["Overtime", "17:00–20:00", "6", "48", "K. Hasan", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Shift coverage",
    sideDescription: "Workers by shift.",
    progress: [
      { label: "Morning", value: "480 workers", percent: 40, tone: "bg-emerald-500" },
      { label: "Afternoon", value: "320 workers", percent: 27, tone: "bg-primary" },
      { label: "Night + OT", value: "386 workers", percent: 33, tone: "bg-slate-400" },
    ],
    notices: [{ title: "48 workers on overtime", detail: "Extended shift for PO-84920 deadline. Monitor fatigue.", tone: "amber" }],
  },
  "attendance": {
    title: "Attendance",
    eyebrow: "Attendance tracking",
    description: "Track daily attendance with biometric verification, late arrivals, and absent management.",
    action: "Log attendance",
    metrics: [
      { label: "Present today", value: "1,164", note: "93.3% attendance", trend: "up" },
      { label: "Absent", value: "36", note: "2.9% absence", trend: "down" },
      { label: "Late arrivals", value: "48", note: "3.8% late", trend: "neutral" },
      { label: "On leave", value: "48", note: "Approved", trend: "neutral" },
    ],
    tableTitle: "Attendance register",
    tableDescription: "Today's attendance summary.",
    columns: ["Department", "Total", "Present", "Absent", "Late", "Rate"],
    rows: [
      ["Production", "840", "792", "18", "30", "94.3%"],
      ["Quality Control", "186", "178", "4", "8", "95.7%"],
      ["Merchandising", "48", "44", "2", "4", "91.7%"],
      ["IE & Planning", "24", "22", "1", "2", "91.7%"],
    ],
    statusIndex: 5,
    sideTitle: "Attendance trend",
    sideDescription: "Weekly attendance rate.",
    progress: [
      { label: "Present", value: "1,164", percent: 93, tone: "bg-emerald-500" },
      { label: "On leave", value: "48", percent: 4, tone: "bg-primary" },
      { label: "Absent", value: "36", percent: 3, tone: "bg-rose-500" },
    ],
    notices: [{ title: "36 workers absent today", detail: "Production floor at 94.3% — monitor for overtime needs.", tone: "amber" }],
  },
  "overtime": {
    title: "Overtime",
    eyebrow: "OT management",
    description: "Track and manage overtime requests, approvals, and overtime pay calculations.",
    action: "Request overtime",
    metrics: [
      { label: "OT hours today", value: "144 hrs", note: "48 workers × 3 hrs", trend: "up" },
      { label: "OT cost today", value: "$4,320", note: "At 2× rate", trend: "neutral" },
      { label: "Pending approval", value: "8", note: "Requests awaiting", trend: "neutral" },
      { label: "OT this month", value: "3,240 hrs", note: "$97,200 cost", trend: "up" },
    ],
    tableTitle: "Overtime register",
    tableDescription: "Overtime requests and approvals.",
    columns: ["OT #", "Worker", "Line", "Hours", "Reason", "Status"],
    rows: [
      ["OT-2418", "Rahim U.", "Line 1", "3 hrs", "PO-84920 rush", "Approved"],
      ["OT-2415", "Fatima B.", "Line 3", "2 hrs", "Rework completion", "Approved"],
      ["OT-2412", "Kamal H.", "Line 5", "3 hrs", "Cutting backlog", "Pending"],
      ["OT-2408", "Nasrin A.", "Line 7", "2 hrs", "QC clearance", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "OT by line",
    sideDescription: "Overtime hours by line.",
    progress: [
      { label: "Line 1 & 3", value: "72 hrs", percent: 50, tone: "bg-emerald-500" },
      { label: "Line 5", value: "36 hrs", percent: 25, tone: "bg-amber-500" },
      { label: "Other lines", value: "36 hrs", percent: 25, tone: "bg-slate-400" },
    ],
    notices: [{ title: "8 OT requests pending", detail: "Submit approvals before shift end to avoid payroll delays.", tone: "amber" }],
  },
  "leave": {
    title: "Leave",
    eyebrow: "Leave management",
    description: "Manage employee leave requests, balances, and leave policy compliance.",
    action: "Request leave",
    metrics: [
      { label: "On leave today", value: "48", note: "Approved leaves", trend: "neutral" },
      { label: "Pending requests", value: "12", note: "Awaiting approval", trend: "neutral" },
      { label: "Leave balance", value: "18 days", note: "Avg. remaining", trend: "neutral" },
      { label: "Absent without leave", value: "6", note: "Unauthorized", trend: "down" },
    ],
    tableTitle: "Leave register",
    tableDescription: "Leave requests and status.",
    columns: ["Leave #", "Employee", "Type", "Days", "Period", "Status"],
    rows: [
      ["LV-2418", "Rahim U.", "Annual", "3", "16–18 Oct", "Approved"],
      ["LV-2415", "Fatima B.", "Sick", "1", "14 Oct", "Approved"],
      ["LV-2412", "Kamal H.", "Annual", "5", "20–24 Oct", "Pending"],
      ["LV-2408", "Nasrin A.", "Casual", "2", "15–16 Oct", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "Leave type",
    sideDescription: "Monthly leave breakdown.",
    progress: [
      { label: "Annual leave", value: "180 days", percent: 45, tone: "bg-emerald-500" },
      { label: "Sick leave", value: "120 days", percent: 30, tone: "bg-amber-500" },
      { label: "Casual / other", value: "100 days", percent: 25, tone: "bg-slate-400" },
    ],
    notices: [{ title: "6 unauthorized absences", detail: "Workers absent without leave approval — issue warnings.", tone: "rose" }],
  },
  "salary-sheet": {
    title: "Salary Sheet",
    eyebrow: "Payroll",
    description: "Generate and manage monthly salary sheets with basic pay, allowances, and deductions.",
    action: "Generate sheet",
    metrics: [
      { label: "Total payroll", value: "$482K", note: "This month", trend: "neutral" },
      { label: "Basic pay", value: "$324K", note: "67% of total", trend: "neutral" },
      { label: "Allowances", value: "$96K", note: "20% of total", trend: "neutral" },
      { label: "Deductions", value: "$62K", note: "13% of total", trend: "neutral" },
    ],
    tableTitle: "Salary sheet register",
    tableDescription: "Monthly salary summary by department.",
    columns: ["Department", "Workers", "Basic", "Allowances", "Deductions", "Net"],
    rows: [
      ["Production", "840", "$226K", "$68K", "$42K", "$252K"],
      ["Quality Control", "186", "$48K", "$14K", "$10K", "$52K"],
      ["Merchandising", "48", "$18K", "$6K", "$4K", "$20K"],
      ["IE & Planning", "24", "$12K", "$4K", "$3K", "$13K"],
    ],
    statusIndex: 5,
    sideTitle: "Pay structure",
    sideDescription: "Salary composition.",
    progress: [
      { label: "Basic pay", value: "$324K", percent: 67, tone: "bg-emerald-500" },
      { label: "Allowances", value: "$96K", percent: 20, tone: "bg-primary" },
      { label: "Deductions", value: "$62K", percent: 13, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Payroll closing in 3 days", detail: "Submit all attendance and OT data before Oct 17 deadline.", tone: "amber" }],
  },
  "bonus": {
    title: "Bonus",
    eyebrow: "Bonus management",
    description: "Manage festival bonuses, performance bonuses, and incentive calculations.",
    action: "Calculate bonus",
    metrics: [
      { label: "Bonus pool", value: "$184K", note: "This quarter", trend: "neutral" },
      { label: "Eligible workers", value: "1,124", note: "90% of total", trend: "up" },
      { label: "Avg. bonus", value: "$164", note: "Per worker", trend: "neutral" },
      { label: "Pending approval", value: "2", note: "Exception cases", trend: "neutral" },
    ],
    tableTitle: "Bonus register",
    tableDescription: "Bonus calculations and disbursement.",
    columns: ["Period", "Type", "Eligible", "Pool", "Avg.", "Status"],
    rows: [
      ["Q3 2024", "Festival bonus", "1,124", "$124K", "$110", "Approved"],
      ["Q3 2024", "Performance", "840", "$42K", "$50", "Approved"],
      ["Q3 2024", "Attendance", "1,086", "$18K", "$17", "Pending"],
      ["Q3 2024", "OT incentive", "480", "$12K", "$25", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "Bonus type",
    sideDescription: "Quarterly bonus breakdown.",
    progress: [
      { label: "Festival bonus", value: "$124K", percent: 67, tone: "bg-emerald-500" },
      { label: "Performance", value: "$42K", percent: 23, tone: "bg-primary" },
      { label: "Attendance & OT", value: "$18K", percent: 10, tone: "bg-slate-400" },
    ],
    notices: [{ title: "2 bonus exceptions pending", detail: "Review and approve before disbursement deadline.", tone: "amber" }],
  },
  "payroll-approval": {
    title: "Payroll Approval",
    eyebrow: "Payroll workflow",
    description: "Review and approve payroll runs with multi-level approval workflow.",
    action: "Review payroll",
    metrics: [
      { label: "Pending approval", value: "1", note: "October payroll", trend: "neutral" },
      { label: "Approved this month", value: "1", note: "September payroll", trend: "up" },
      { label: "Total disbursed", value: "$468K", note: "Last month", trend: "neutral" },
      { label: "Approval SLA", value: "2.4 days", note: "Avg. turnaround", trend: "up" },
    ],
    tableTitle: "Payroll approval register",
    tableDescription: "Payroll runs and approval status.",
    columns: ["Period", "Gross", "Deductions", "Net", "Submitted", "Status"],
    rows: [
      ["Sep 2024", "$548K", "$80K", "$468K", "01 Oct", "Approved"],
      ["Aug 2024", "$532K", "$76K", "$456K", "01 Sep", "Approved"],
      ["Jul 2024", "$540K", "$78K", "$462K", "01 Aug", "Approved"],
      ["Oct 2024", "$548K", "$66K", "$482K", "14 Oct", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Monthly payroll status.",
    progress: [
      { label: "Approved", value: "12 runs", percent: 92, tone: "bg-emerald-500" },
      { label: "Pending", value: "1 run", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "October payroll pending approval", detail: "Submit for MD approval before Oct 17 disbursement.", tone: "amber" }],
  },
  "compliance-reports": {
    title: "Compliance Reports",
    eyebrow: "HR compliance",
    description: "Generate and track HR compliance reports including labor law and buyer audit requirements.",
    action: "Generate report",
    metrics: [
      { label: "Reports generated", value: "18", note: "This month", trend: "up" },
      { label: "Pending reports", value: "4", note: "Awaiting data", trend: "neutral" },
      { label: "Audit pass rate", value: "96.2%", note: "All buyers", trend: "up" },
      { label: "Non-compliance", value: "2", note: "Minor findings", trend: "down" },
    ],
    tableTitle: "Compliance report register",
    tableDescription: "HR compliance reports and audit status.",
    columns: ["Report", "Type", "Period", "Generated", "Auditor", "Status"],
    rows: [
      ["BSCI Social Audit", "Social compliance", "Q3 2024", "12 Oct", "BSCI", "Pass"],
      ["Fire Safety Report", "Safety compliance", "Oct 2024", "10 Oct", "Internal", "Pass"],
      ["Wage Slip Audit", "Wage compliance", "Sep 2024", "08 Oct", "Buyer", "Pass"],
      ["Working Hours Report", "Hours compliance", "Sep 2024", "05 Oct", "Internal", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Report type",
    sideDescription: "Monthly compliance reports.",
    progress: [
      { label: "Passed", value: "16 reports", percent: 89, tone: "bg-emerald-500" },
      { label: "Pending", value: "2 reports", percent: 11, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 compliance reports pending", detail: "Complete working hours report before buyer audit on Oct 20.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function HRWorkspace({ module, metrics, rows, rawItems }: { module: ModuleKey; metrics?: WorkspaceConfig["metrics"]; rows?: WorkspaceConfig["rows"]; rawItems?: Record<string, unknown>[] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? config.metrics
  const resolvedRows = rows ?? config.rows

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
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resolvedRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t transition-colors hover:bg-muted/30">
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
                <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> HR attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
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
