"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Factory } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "production-order-received"
  | "process-wise-floor-layout"
  | "floor-requisition"
  | "process-wise-production-execution"
  | "quality-assurance"
  | "inspection-packing"
  | "rm-requisition-approval"
  | "cutting-sending-to-line"
  | "artwork-printing-embroidery-monitoring"
  | "line-input"
  | "hourly-sewing-production"
  | "send-to-washing"
  | "receive-from-washing"
  | "thread-cutting"
  | "final-qc"
  | "carton-packing"
  | "packing-list-preparation"
  | "booking-to-forwarder"
  | "inspection-schedule"
  | "ex-factory"

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
  "production-order-received": {
    title: "Production Order Received",
    eyebrow: "Order intake",
    description: "Track production orders received from merchandising for shop floor execution.",
    action: "Log order",
    tableTitle: "Received orders register",
    tableDescription: "Production orders received from merchandising.",
    columns: ["Order #", "PO #", "Buyer", "Style", "Qty", "Status"],
    statusIndex: 5,
    sideTitle: "Order pipeline",
    sideDescription: "Monthly order intake status.",
  },
  "process-wise-floor-layout": {
    title: "Process-wise Floor Layout",
    eyebrow: "Floor layout",
    description: "Design and manage process-wise floor layouts for production lines.",
    action: "New layout",
    tableTitle: "Floor layout overview",
    tableDescription: "Process-wise machine placement across production lines.",
    columns: ["Line", "Process", "Machines", "Operators", "Capacity/day", "Status"],
    statusIndex: 5,
    sideTitle: "Layout status",
    sideDescription: "Current layout optimization status.",
  },
  "floor-requisition": {
    title: "Floor Requisition",
    eyebrow: "Floor requests",
    description: "Manage material and supply requisitions from the shop floor to stores.",
    action: "New requisition",
    tableTitle: "Floor requisition log",
    tableDescription: "Material requests from production floor to stores.",
    columns: ["Req #", "Line", "Material", "Qty", "Requested", "Status"],
    statusIndex: 5,
    sideTitle: "Fulfillment status",
    sideDescription: "Today's requisition fulfillment.",
  },
  "process-wise-production-execution": {
    title: "Process-wise Production Execution",
    eyebrow: "Production execution",
    description: "Track production execution across cutting, sewing, washing, and finishing processes.",
    action: "Update execution",
    tableTitle: "Process execution tracker",
    tableDescription: "Real-time production output by process.",
    columns: ["Process", "Target", "Achieved", "Efficiency", "Defects", "Status"],
    statusIndex: 5,
    sideTitle: "Process output",
    sideDescription: "Monthly production by process.",
  },
  "quality-assurance": {
    title: "Quality Assurance",
    eyebrow: "QA tracking",
    description: "Monitor quality assurance activities, defect rates, and corrective actions.",
    action: "Log inspection",
    tableTitle: "QA inspection log",
    tableDescription: "Quality inspection results from the shop floor.",
    columns: ["Inspection #", "Line", "Process", "Sample size", "Defects", "Status"],
    statusIndex: 5,
    sideTitle: "QA results",
    sideDescription: "Monthly inspection pass/fail.",
  },
  "inspection-packing": {
    title: "Inspection & Packing",
    eyebrow: "Final inspection",
    description: "Manage final inspection and packing operations for export readiness.",
    action: "Schedule inspection",
    tableTitle: "Inspection & packing log",
    tableDescription: "Final inspection and packing status by order.",
    columns: ["Order #", "Buyer", "Qty", "Inspector", "Result", "Status"],
    statusIndex: 5,
    sideTitle: "Inspection pipeline",
    sideDescription: "Current inspection status.",
  },
  "rm-requisition-approval": {
    title: "RM Requisition & Approval",
    eyebrow: "RM approval",
    description: "Request and approve raw materials from store to production floor.",
    action: "New requisition",
    tableTitle: "RM requisition tracker",
    tableDescription: "Raw material requisitions with approval status.",
    columns: ["Req #", "Line", "Material", "Qty", "Requested by", "Status"],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Today's requisition approvals.",
  },
  "cutting-sending-to-line": {
    title: "Cutting & Sending to Line",
    eyebrow: "Cutting tracking",
    description: "Track cutting operations and bundle dispatch to sewing lines.",
    action: "Log cutting",
    tableTitle: "Cutting & dispatch log",
    tableDescription: "Cutting output and bundle dispatch to sewing lines.",
    columns: ["Order #", "Style", "Cut qty", "Sent", "Pending", "Status"],
    statusIndex: 5,
    sideTitle: "Cutting status",
    sideDescription: "Today's cutting and dispatch.",
  },
  "artwork-printing-embroidery-monitoring": {
    title: "Artwork / Printing / Embroidery Monitoring",
    eyebrow: "Print & embroidery",
    description: "Monitor artwork, printing, and embroidery operations on production lines.",
    action: "Log operation",
    tableTitle: "Print & embroidery tracker",
    tableDescription: "Artwork, printing, and embroidery operations status.",
    columns: ["Order #", "Style", "Type", "Qty", "Completed", "Status"],
    statusIndex: 5,
    sideTitle: "Operation type",
    sideDescription: "Active operations by type.",
  },
  "line-input": {
    title: "Line Input",
    eyebrow: "Input tracking",
    description: "Track material input to sewing lines including cut bundles and trims.",
    action: "Log input",
    tableTitle: "Line input log",
    tableDescription: "Material input tracking for sewing lines.",
    columns: ["Line", "Order", "Input qty", "Time", "Operator", "Status"],
    statusIndex: 5,
    sideTitle: "Input status",
    sideDescription: "Today's line input completion.",
  },
  "hourly-sewing-production": {
    title: "Hourly Sewing Production",
    eyebrow: "Hourly tracking",
    description: "Monitor hourly sewing output across all lines with target vs actual tracking.",
    action: "Log hourly output",
    tableTitle: "Hourly production report",
    tableDescription: "Hourly sewing output by line.",
    columns: ["Line", "Hour", "Target", "Actual", "Efficiency", "Status"],
    statusIndex: 5,
    sideTitle: "Hourly trend",
    sideDescription: "Output by hour across all lines.",
  },
  "send-to-washing": {
    title: "Send to Washing",
    eyebrow: "Washing dispatch",
    description: "Track garment dispatch from sewing to washing unit with quantity and timing.",
    action: "Log dispatch",
    tableTitle: "Washing dispatch log",
    tableDescription: "Garment dispatch from sewing to washing.",
    columns: ["Dispatch #", "Order", "Qty", "Sent at", "Washing unit", "Status"],
    statusIndex: 5,
    sideTitle: "Dispatch status",
    sideDescription: "Today's washing dispatch.",
  },
  "receive-from-washing": {
    title: "Receive from Washing",
    eyebrow: "Washing receipt",
    description: "Track garment receipt from washing unit with quality and quantity verification.",
    action: "Log receipt",
    tableTitle: "Washing receipt log",
    tableDescription: "Garment receipt from washing with QC status.",
    columns: ["Receipt #", "Order", "Qty", "Received", "QC result", "Status"],
    statusIndex: 5,
    sideTitle: "Receipt status",
    sideDescription: "Today's washing receipt.",
  },
  "thread-cutting": {
    title: "Thread Cutting",
    eyebrow: "Thread cutting",
    description: "Track thread cutting operations and quality of finished garments.",
    action: "Log cutting",
    tableTitle: "Thread cutting log",
    tableDescription: "Thread cutting operations and quality status.",
    columns: ["Line", "Order", "Qty cut", "Pending", "QC result", "Status"],
    statusIndex: 5,
    sideTitle: "Cutting progress",
    sideDescription: "Today's thread cutting completion.",
  },
  "final-qc": {
    title: "Final QC",
    eyebrow: "Final inspection",
    description: "Perform final quality control inspection before packing and shipment.",
    action: "Log QC",
    tableTitle: "Final QC log",
    tableDescription: "Final quality control inspection results.",
    columns: ["Order #", "Inspected", "Pass", "Fail", "Result", "Status"],
    statusIndex: 5,
    sideTitle: "QC results",
    sideDescription: "Monthly final QC pass rate.",
  },
  "carton-packing": {
    title: "Carton & Packing",
    eyebrow: "Packing operations",
    description: "Manage carton packing, labeling, and stack preparation for shipment.",
    action: "Log packing",
    tableTitle: "Packing register",
    tableDescription: "Carton packing and labeling status.",
    columns: ["Carton #", "Order", "Qty", "Weight", "Packed", "Status"],
    statusIndex: 5,
    sideTitle: "Packing status",
    sideDescription: "Today's packing operations.",
  },
  "packing-list-preparation": {
    title: "Packing List Preparation",
    eyebrow: "Packing lists",
    description: "Prepare and manage packing lists for export shipments with documentation.",
    action: "Create packing list",
    tableTitle: "Packing list register",
    tableDescription: "Export packing lists with approval status.",
    columns: ["PL #", "Order", "Buyer", "Cartons", "Prepared", "Status"],
    statusIndex: 5,
    sideTitle: "List status",
    sideDescription: "Monthly packing list status.",
  },
  "booking-to-forwarder": {
    title: "Booking to Forwarder",
    eyebrow: "Freight booking",
    description: "Manage freight bookings with shipping lines and forwarders for export shipments.",
    action: "New booking",
    tableTitle: "Freight booking register",
    tableDescription: "Freight bookings for export shipments.",
    columns: ["Booking #", "Order", "Forwarder", "ETD", "Amount", "Status"],
    statusIndex: 5,
    sideTitle: "Booking status",
    sideDescription: "Current freight booking pipeline.",
  },
  "inspection-schedule": {
    title: "Inspection Schedule",
    eyebrow: "Inspection planning",
    description: "Schedule and manage quality inspections at various production stages.",
    action: "Schedule inspection",
    tableTitle: "Inspection schedule",
    tableDescription: "Scheduled inspections across production stages.",
    columns: ["Inspection #", "Order", "Stage", "Scheduled", "Inspector", "Status"],
    statusIndex: 5,
    sideTitle: "Inspection pipeline",
    sideDescription: "Weekly inspection status.",
  },
  "ex-factory": {
    title: "Ex-factory",
    eyebrow: "Shipment readiness",
    description: "Track ex-factory readiness and final shipment preparation for export orders.",
    action: "Log ex-factory",
    tableTitle: "Ex-factory tracker",
    tableDescription: "Orders with ex-factory status and shipment readiness.",
    columns: ["Order #", "Buyer", "Qty", "Ex-factory date", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Ex-factory pipeline",
    sideDescription: "Orders by ex-factory status.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function ProductionWorkspace({ 
  module, 
  metrics, 
  rows, 
  rawItems,
  isLoading, 
  error 
}: { 
  module: ModuleKey
  metrics?: Metric[]
  rows?: string[][]
  rawItems?: Record<string, unknown>[]
  isLoading?: boolean
  error?: string | null
}) {
  const baseConfig = configs[module]
  const config = {
    ...baseConfig,
  }

  if (isLoading) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">Loading {baseConfig.title.toLowerCase()} data...</p>
            </div>
          </div>
        </main>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg font-medium text-rose-600">Failed to load data</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/production" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Production
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
          {(metrics ?? []).map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Factory className="size-4 text-muted-foreground" />}
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
                    {rows !== undefined && rows.length === 0 && (
                      <tr><td colSpan={config.columns.length} className="px-3 py-8 text-center text-xs text-muted-foreground">No records yet.</td></tr>
                    )}
                    {(rows ?? []).map((row, rowIndex) => (
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
                <span>{(rows ?? []).length} record(s)</span>
                <button className="flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => toast.info("Opening full register")}>View all <ArrowUpRight className="size-3" /></button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Factory className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Production attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening production task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Production hub</p><p className="text-xs text-muted-foreground">All floor data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
