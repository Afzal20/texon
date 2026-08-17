"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Settings } from "lucide-react"
import { toast } from "sonner"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

type ModuleKey =
  | "capacity-booking-allocation"
  | "process-wise-production-planning"
  | "risk-assessment"
  | "po-wise-tna-time-action"
  | "production-order-issue"
  | "production-dashboard"
  | "style-analysis"
  | "ladder-planning"
  | "line-planning-loading-unloading"

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
  "capacity-booking-allocation": {
    title: "Capacity & Booking Allocation",
    eyebrow: "Line allocation",
    description: "Allocate production lines to orders, manage bookings, and resolve scheduling conflicts.",
    action: "New booking",
    metrics: [
      { label: "Lines allocated", value: "14 / 18", note: "78% utilization", trend: "up" },
      { label: "Booking conflicts", value: "2", note: "Need rescheduling", trend: "down" },
      { label: "Unallocated lines", value: "4", note: "Available next week", trend: "neutral" },
      { label: "Capacity efficiency", value: "82.4%", note: "Monthly average", trend: "up" },
    ],
    tableTitle: "Line allocation schedule",
    tableDescription: "Current week's production line assignments and availability.",
    columns: ["Line", "Order", "Buyer", "Style", "Allocated", "Status"],
    rows: [
      ["Line 1", "PO-84920", "H&M", "Relaxed Oxford", "14–18 Oct", "Running"],
      ["Line 3", "PO-85107", "Zara", "Stretch Cargo", "14–22 Oct", "Running"],
      ["Line 5", "PO-85241", "Uniqlo", "Ribbed Tank", "21–28 Oct", "Scheduled"],
      ["Line 7", "—", "—", "—", "Available", "Unallocated"],
    ],
    statusIndex: 5,
    sideTitle: "Line utilization",
    sideDescription: "Current week allocation status.",
    progress: [
      { label: "Running", value: "10 lines", percent: 56, tone: "bg-emerald-500" },
      { label: "Scheduled", value: "4 lines", percent: 22, tone: "bg-amber-500" },
      { label: "Available", value: "4 lines", percent: 22, tone: "bg-slate-400" },
    ],
    notices: [{ title: "2 booking conflicts detected", detail: "Lines 3 and 5 have overlapping allocation for next week.", tone: "amber" }],
  },
  "process-wise-production-planning": {
    title: "Process-wise Production Planning",
    eyebrow: "Process planning",
    description: "Plan and track production targets across cutting, sewing, washing, and finishing processes.",
    action: "New plan",
    metrics: [
      { label: "Plans created", value: "24", note: "This month", trend: "up" },
      { label: "On-track plans", value: "18", note: "75% completion rate", trend: "up" },
      { label: "Behind schedule", value: "4", note: "Need intervention", trend: "down" },
      { label: "Avg. plan adherence", value: "91.2%", note: "Across all processes", trend: "up" },
    ],
    tableTitle: "Production plan overview",
    tableDescription: "Process-level plans with target and actual tracking.",
    columns: ["Plan #", "Process", "Order", "Target (pcs)", "Achieved", "Status"],
    rows: [
      ["PP-2418", "Cutting", "PO-84920", "12,400", "12,400", "Complete"],
      ["PP-2415", "Sewing", "PO-85107", "8,600", "6,880", "In progress"],
      ["PP-2412", "Washing", "PO-85241", "18,200", "12,740", "In progress"],
      ["PP-2408", "Finishing", "PO-85322", "4,800", "2,400", "Behind"],
    ],
    statusIndex: 5,
    sideTitle: "Process completion",
    sideDescription: "Monthly plan completion by process.",
    progress: [
      { label: "Cutting", value: "96%", percent: 96, tone: "bg-emerald-500" },
      { label: "Sewing", value: "82%", percent: 82, tone: "bg-primary" },
      { label: "Washing & finishing", value: "74%", percent: 74, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Finishing process behind schedule", detail: "PO-85322 finishing is only 50% complete — allocate overtime.", tone: "rose" }],
  },
  "risk-assessment": {
    title: "Risk Assessment",
    eyebrow: "Risk management",
    description: "Identify, evaluate, and mitigate production and delivery risks across all active orders.",
    action: "Log risk",
    metrics: [
      { label: "Active risks", value: "14", note: "Across 8 orders", trend: "neutral" },
      { label: "High-severity risks", value: "3", note: "Immediate action needed", trend: "down" },
      { label: "Mitigated this month", value: "8", note: "Successfully resolved", trend: "up" },
      { label: "Risk score", value: "6.2 / 10", note: "Factory average", trend: "down" },
    ],
    tableTitle: "Risk register",
    tableDescription: "Identified risks ranked by severity and impact.",
    columns: ["Risk #", "Order", "Category", "Severity", "Impact", "Status"],
    rows: [
      ["RSK-2418", "PO-84920", "Material delay", "High", "$48K", "Open"],
      ["RSK-2415", "PO-85107", "Quality defect", "Medium", "$22K", "Mitigating"],
      ["RSK-2412", "PO-85241", "Machine breakdown", "High", "$36K", "Open"],
      ["RSK-2408", "PO-85322", "Labor shortage", "Low", "$8K", "Monitoring"],
    ],
    statusIndex: 5,
    sideTitle: "Risk by category",
    sideDescription: "Risk distribution across categories.",
    progress: [
      { label: "Material / sourcing", value: "5 risks", percent: 36, tone: "bg-rose-500" },
      { label: "Production / quality", value: "6 risks", percent: 43, tone: "bg-amber-500" },
      { label: "Labor / other", value: "3 risks", percent: 21, tone: "bg-slate-400" },
    ],
    notices: [{ title: "3 high-severity risks open", detail: "Material delay on PO-84920 may impact H&M delivery date.", tone: "rose" }],
  },
  "po-wise-tna-time-action": {
    title: "PO-wise TnA (Time & Action)",
    eyebrow: "Time & action",
    description: "Track time and action milestones for each purchase order from confirmation to shipment.",
    action: "New TnA",
    metrics: [
      { label: "Active TnAs", value: "38", note: "Across all POs", trend: "neutral" },
      { label: "On schedule", value: "28", note: "74% adherence", trend: "up" },
      { label: "Milestones overdue", value: "6", note: "Need follow-up", trend: "down" },
      { label: "Avg. lead time", value: "62 days", note: "Order to shipment", trend: "neutral" },
    ],
    tableTitle: "TnA milestone tracker",
    tableDescription: "Key milestones for active purchase orders.",
    columns: ["PO #", "Buyer", "Milestone", "Planned", "Actual", "Status"],
    rows: [
      ["PO-84920", "H&M", "Fabric in house", "08 Oct 2024", "08 Oct 2024", "Met"],
      ["PO-85107", "Zara", "Cutting start", "14 Oct 2024", "14 Oct 2024", "Met"],
      ["PO-85241", "Uniqlo", "Sewing start", "18 Oct 2024", "20 Oct 2024", "Delayed"],
      ["PO-85322", "Levi's", "Shipment", "01 Nov 2024", "—", "At risk"],
    ],
    statusIndex: 5,
    sideTitle: "Milestone adherence",
    sideDescription: "On-time milestone completion rate.",
    progress: [
      { label: "Met on time", value: "28 milestones", percent: 74, tone: "bg-emerald-500" },
      { label: "Delayed", value: "6 milestones", percent: 16, tone: "bg-amber-500" },
      { label: "At risk", value: "4 milestones", percent: 10, tone: "bg-rose-500" },
    ],
    notices: [{ title: "PO-85322 shipment at risk", detail: "Sewing is 2 days behind — may miss Nov 1 shipment date.", tone: "rose" }],
  },
  "production-order-issue": {
    title: "Production Order Issue",
    eyebrow: "Order issuance",
    description: "Issue and track production orders from merchandising to the shop floor.",
    action: "Issue order",
    metrics: [
      { label: "Orders issued", value: "42", note: "This month", trend: "up" },
      { label: "Pending issuance", value: "8", note: "Awaiting material confirmation", trend: "neutral" },
      { label: "Issued value", value: "$3.2M", note: "Total order value", trend: "up" },
      { label: "Avg. issuance time", value: "1.2 days", note: "From PO to shop floor", trend: "up" },
    ],
    tableTitle: "Production order log",
    tableDescription: "Recently issued production orders with shop floor status.",
    columns: ["Order #", "PO #", "Buyer", "Style", "Qty", "Status"],
    rows: [
      ["WO-2418", "PO-84920", "H&M", "Relaxed Oxford", "12,400", "Issued"],
      ["WO-2415", "PO-85107", "Zara", "Stretch Cargo", "8,600", "Issued"],
      ["WO-2412", "PO-85241", "Uniqlo", "Ribbed Tank", "18,200", "Pending"],
      ["WO-2408", "PO-85322", "Levi's", "Denim Jacket", "4,800", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Issuance status",
    sideDescription: "Current month order issuance breakdown.",
    progress: [
      { label: "Issued to floor", value: "42 orders", percent: 84, tone: "bg-emerald-500" },
      { label: "Pending material", value: "6 orders", percent: 12, tone: "bg-amber-500" },
      { label: "On hold", value: "2 orders", percent: 4, tone: "bg-rose-500" },
    ],
    notices: [{ title: "8 orders pending issuance", detail: "6 awaiting material confirmation, 2 on hold for buyer approval.", tone: "amber" }],
  },
  "production-dashboard": {
    title: "Production Dashboard",
    eyebrow: "Live overview",
    description: "Real-time view of factory production performance across all active lines and orders.",
    action: "Refresh data",
    metrics: [
      { label: "Today's output", value: "4,280 pcs", note: "Across 18 lines", trend: "up" },
      { label: "Avg. efficiency", value: "82.4%", note: "Target: 85%", trend: "up" },
      { label: "Active orders", value: "24", note: "Currently on floor", trend: "neutral" },
      { label: "Defect rate", value: "2.1%", note: "Below 3% target", trend: "up" },
    ],
    tableTitle: "Line performance summary",
    tableDescription: "Live production metrics by line.",
    columns: ["Line", "Order", "Style", "Output (pcs)", "Efficiency", "Status"],
    rows: [
      ["Line 1", "PO-84920", "Relaxed Oxford", "658", "91.2%", "Excellent"],
      ["Line 3", "PO-85107", "Stretch Cargo", "576", "84.6%", "On target"],
      ["Line 5", "PO-85241", "Ribbed Tank", "456", "78.4%", "Below target"],
      ["Line 7", "PO-85322", "Denim Jacket", "612", "72.8%", "At risk"],
    ],
    statusIndex: 5,
    sideTitle: "Output by section",
    sideDescription: "Today's production distribution.",
    progress: [
      { label: "Cutting", value: "4,800 pcs", percent: 30, tone: "bg-primary" },
      { label: "Sewing", value: "4,280 pcs", percent: 27, tone: "bg-emerald-500" },
      { label: "Finishing", value: "6,920 pcs", percent: 43, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Line 7 efficiency dropped", detail: "Denim jacket line at 72.8% — schedule IE review.", tone: "rose" }],
  },
  "style-analysis": {
    title: "Style Analysis",
    eyebrow: "Style analytics",
    description: "Analyze style-level performance, costing accuracy, and production complexity.",
    action: "New analysis",
    metrics: [
      { label: "Styles analyzed", value: "48", note: "Active styles", trend: "up" },
      { label: "Avg. SMV", value: "12.4 min", note: "Across analyzed styles", trend: "neutral" },
      { label: "Complex styles", value: "12", note: "SMV > 15 min", trend: "neutral" },
      { label: "Costing accuracy", value: "96.8%", note: "Estimate vs. actual", trend: "up" },
    ],
    tableTitle: "Style performance report",
    tableDescription: "Style-level metrics with SMV and costing comparison.",
    columns: ["Style #", "Style name", "SMV (min)", "Target PPH", "Actual PPH", "Accuracy"],
    rows: [
      ["STY-4821", "Relaxed Oxford Shirt", "14.2", "16.8", "16.2", "96.4%"],
      ["STY-4816", "Stretch Cargo Pant", "18.6", "12.4", "11.8", "95.2%"],
      ["STY-4804", "Ribbed Tank Top", "8.4", "21.2", "20.8", "98.1%"],
      ["STY-4798", "Denim Trucker Jacket", "22.4", "8.8", "7.6", "86.4%"],
    ],
    statusIndex: 5,
    sideTitle: "Complexity distribution",
    sideDescription: "Styles grouped by SMV complexity.",
    progress: [
      { label: "Low complexity (SMV < 10)", value: "14 styles", percent: 29, tone: "bg-emerald-500" },
      { label: "Medium (SMV 10–18)", value: "22 styles", percent: 46, tone: "bg-primary" },
      { label: "High (SMV > 18)", value: "12 styles", percent: 25, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Denim Jacket costing below target", detail: "STY-4798 PPH is 13.6% below estimate — review method study.", tone: "rose" }],
  },
  "ladder-planning": {
    title: "Ladder Planning",
    eyebrow: "Production ladder",
    description: "Create and manage production ladders to visualize daily output targets by style and line.",
    action: "New ladder",
    metrics: [
      { label: "Active ladders", value: "18", note: "Currently running", trend: "neutral" },
      { label: "On track", value: "14", note: "78% adherence", trend: "up" },
      { label: "Behind ladder", value: "4", note: "Need catch-up plan", trend: "down" },
      { label: "Avg. daily target", value: "680 pcs", note: "Per line average", trend: "up" },
    ],
    tableTitle: "Production ladder overview",
    tableDescription: "Daily output targets versus actual for active ladders.",
    columns: ["Line", "Style", "Day 1 target", "Day 1 actual", "Cum. target", "Cum. actual"],
    rows: [
      ["Line 1", "Relaxed Oxford", "650", "658", "3,250", "3,310"],
      ["Line 3", "Stretch Cargo", "680", "672", "3,400", "3,360"],
      ["Line 5", "Ribbed Tank", "580", "546", "2,900", "2,780"],
      ["Line 7", "Denim Jacket", "840", "792", "4,200", "4,020"],
    ],
    statusIndex: 5,
    sideTitle: "Ladder adherence",
    sideDescription: "Lines against their production ladder.",
    progress: [
      { label: "Ahead of ladder", value: "4 lines", percent: 22, tone: "bg-emerald-500" },
      { label: "On track", value: "10 lines", percent: 56, tone: "bg-primary" },
      { label: "Behind ladder", value: "4 lines", percent: 22, tone: "bg-rose-500" },
    ],
    notices: [{ title: "4 lines behind their ladders", detail: "Line 5 is 120 pcs behind cumulative target — schedule overtime.", tone: "rose" }],
  },
  "line-planning-loading-unloading": {
    title: "Line Planning (Loading & Unloading)",
    eyebrow: "Line loading",
    description: "Plan line loading sequences and manage style transitions during loading and unloading.",
    action: "Plan loading",
    metrics: [
      { label: "Lines loading", value: "3", note: "Transition in progress", trend: "neutral" },
      { label: "Lines running", value: "14", note: "Steady state production", trend: "up" },
      { label: "Lines unloading", value: "1", note: "Finishing current order", trend: "neutral" },
      { label: "Avg. loading time", value: "4.2 hrs", note: "Style changeover", trend: "up" },
    ],
    tableTitle: "Line loading schedule",
    tableDescription: "Current loading, running, and unloading status for all lines.",
    columns: ["Line", "Loading in", "Current style", "Loading out", "Next style", "Status"],
    rows: [
      ["Line 1", "—", "Relaxed Oxford", "—", "—", "Running"],
      ["Line 3", "—", "Stretch Cargo", "—", "—", "Running"],
      ["Line 5", "Ribbed Tank", "—", "Cargo Short", "18 Oct", "Loading"],
      ["Line 7", "—", "Denim Jacket", "—", "—", "Running"],
    ],
    statusIndex: 5,
    sideTitle: "Line status breakdown",
    sideDescription: "Current line operational status.",
    progress: [
      { label: "Running (steady state)", value: "14 lines", percent: 78, tone: "bg-emerald-500" },
      { label: "Loading (changing over)", value: "3 lines", percent: 17, tone: "bg-amber-500" },
      { label: "Unloading", value: "1 line", percent: 5, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Line 5 loading in progress", detail: "Ribbed Tank → Cargo Short transition — target ready by 18 Oct.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function IEPlanningWorkspace({ module, metrics, rows, rawItems }: { module: ModuleKey; metrics?: WorkspaceConfig["metrics"]; rows?: WorkspaceConfig["rows"]; rawItems?: Record<string, unknown>[] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? config.metrics
  const resolvedRows = rows ?? config.rows

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/ie-planning" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> IE &amp; Planning
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Settings className="size-4 text-muted-foreground" />}
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
                <CardTitle className="flex items-center gap-2 text-base"><Settings className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> IE &amp; Planning attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening IE task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">IE &amp; Planning hub</p><p className="text-xs text-muted-foreground">All planning data syncs in real-time with production.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
