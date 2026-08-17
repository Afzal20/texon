"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Package } from "lucide-react"
import { toast } from "sonner"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

type ModuleKey =
  | "raw-materials-booking"
  | "knitting-dyeing-program"
  | "raw-materials-requisition"
  | "procurement-management"
  | "stock-loan-management"
  | "quotation-vs-actual-analysis"
  | "supplier-selection-price-quality-delivery-grade"

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
  "raw-materials-booking": {
    title: "Raw Materials Booking",
    eyebrow: "Material booking",
    description: "Book and track raw material reservations against purchase orders and production plans.",
    action: "New booking",
    metrics: [
      { label: "Active bookings", value: "24", note: "Across 12 suppliers", trend: "neutral" },
      { label: "Booked value", value: "$1.8M", note: "Pending delivery", trend: "up" },
      { label: "Bookings confirmed", value: "18", note: "75% confirmation rate", trend: "up" },
      { label: "Pending confirmation", value: "6", note: "Awaiting supplier", trend: "down" },
    ],
    tableTitle: "Booking register",
    tableDescription: "Raw material bookings with supplier and delivery status.",
    columns: ["Booking #", "Material", "Supplier", "Qty", "Delivery", "Status"],
    rows: [
      ["BK-2418", "100% Cotton Poplin", "Envoy Textiles", "24,800 m", "20 Oct 2024", "Confirmed"],
      ["BK-2415", "Polyester Blend", "DBL Group", "18,200 m", "25 Oct 2024", "Confirmed"],
      ["BK-2412", "Elastane 40S", "Noman Group", "6,400 m", "22 Oct 2024", "Pending"],
      ["BK-2408", "Denim 7oz", "Epic Group", "12,600 m", "28 Oct 2024", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Booking pipeline",
    sideDescription: "Current booking confirmation status.",
    progress: [
      { label: "Confirmed", value: "18 bookings", percent: 75, tone: "bg-emerald-500" },
      { label: "Pending", value: "4 bookings", percent: 17, tone: "bg-amber-500" },
      { label: "On hold", value: "2 bookings", percent: 8, tone: "bg-rose-500" },
    ],
    notices: [{ title: "6 bookings pending confirmation", detail: "Follow up with Noman Group for elastane confirmation.", tone: "amber" }],
  },
  "knitting-dyeing-program": {
    title: "Knitting & Dyeing Program",
    eyebrow: "KD program",
    description: "Plan and track knitting and dyeing programs for fabric production.",
    action: "New program",
    metrics: [
      { label: "Active programs", value: "18", note: "Across 6 units", trend: "neutral" },
      { label: "On schedule", value: "14", note: "78% adherence", trend: "up" },
      { label: "Behind schedule", value: "3", note: "Need catch-up", trend: "down" },
      { label: "Completion rate", value: "82%", note: "Monthly target", trend: "up" },
    ],
    tableTitle: "KD program tracker",
    tableDescription: "Knitting and dyeing programs with schedule tracking.",
    columns: ["Program #", "Fabric", "Type", "Start date", "End date", "Status"],
    rows: [
      ["KD-2418", "Cotton Poplin", "Knitting", "14 Oct 2024", "18 Oct 2024", "Running"],
      ["KD-2415", "Poly Blend", "Dyeing", "12 Oct 2024", "16 Oct 2024", "Running"],
      ["KD-2412", "Denim 7oz", "Knitting", "15 Oct 2024", "20 Oct 2024", "Scheduled"],
      ["KD-2408", "Rib Fabric", "Dyeing", "10 Oct 2024", "14 Oct 2024", "Complete"],
    ],
    statusIndex: 5,
    sideTitle: "Program status",
    sideDescription: "Current KD pipeline.",
    progress: [
      { label: "Complete", value: "8 programs", percent: 44, tone: "bg-emerald-500" },
      { label: "Running", value: "7 programs", percent: 39, tone: "bg-primary" },
      { label: "Scheduled", value: "3 programs", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "3 programs behind schedule", detail: "KD-2412 denim knitting delayed by 2 days.", tone: "amber" }],
  },
  "raw-materials-requisition": {
    title: "Raw Materials Requisition",
    eyebrow: "RM requisition",
    description: "Request and approve raw materials from inventory for production orders.",
    action: "New requisition",
    metrics: [
      { label: "Requisitions raised", value: "42", note: "This month", trend: "up" },
      { label: "Approved", value: "36", note: "86% approval rate", trend: "up" },
      { label: "Pending approval", value: "4", note: "Awaiting manager", trend: "neutral" },
      { label: "Rejected", value: "2", note: "Insufficient stock", trend: "down" },
    ],
    tableTitle: "Requisition register",
    tableDescription: "Raw material requisitions with approval workflow.",
    columns: ["Req #", "Order", "Material", "Qty", "Requested", "Status"],
    rows: [
      ["REQ-2418", "PO-84920", "Cotton Poplin", "4,800 m", "14 Oct 2024", "Approved"],
      ["REQ-2415", "PO-85107", "Poly Blend", "3,200 m", "13 Oct 2024", "Approved"],
      ["REQ-2412", "PO-85241", "Rib Fabric", "2,400 m", "12 Oct 2024", "Pending"],
      ["REQ-2408", "PO-85322", "Denim 7oz", "1,800 m", "10 Oct 2024", "Rejected"],
    ],
    statusIndex: 5,
    sideTitle: "Requisition pipeline",
    sideDescription: "Monthly requisition status.",
    progress: [
      { label: "Approved & issued", value: "36 requisitions", percent: 86, tone: "bg-emerald-500" },
      { label: "Pending approval", value: "4 requisitions", percent: 9, tone: "bg-amber-500" },
      { label: "Rejected", value: "2 requisitions", percent: 5, tone: "bg-rose-500" },
    ],
    notices: [{ title: "REQ-2408 rejected", detail: "Denim 7oz stock insufficient — raise purchase order.", tone: "rose" }],
  },
  "procurement-management": {
    title: "Procurement Management",
    eyebrow: "Purchase management",
    description: "Manage purchase orders, supplier negotiations, and procurement workflows.",
    action: "New PO",
    metrics: [
      { label: "Active POs", value: "32", note: "Total value $4.2M", trend: "neutral" },
      { label: "POs issued", value: "24", note: "This month", trend: "up" },
      { label: "Pending approval", value: "5", note: "$680K value", trend: "down" },
      { label: "PO completion", value: "78%", note: "On-time delivery", trend: "up" },
    ],
    tableTitle: "Purchase order register",
    tableDescription: "Active purchase orders with supplier and status.",
    columns: ["PO #", "Supplier", "Material", "Amount", "Delivery", "Status"],
    rows: [
      ["PO-7753", "Envoy Textiles", "Cotton Poplin", "$186,420", "20 Oct 2024", "In transit"],
      ["PO-7748", "Coats Bangladesh", "Thread", "$94,800", "22 Oct 2024", "Confirmed"],
      ["PO-7739", "YKK Bangladesh", "Zippers", "$22,760", "25 Oct 2024", "Pending"],
      ["PO-7724", "Pacific Accessories", "Labels", "$54,980", "28 Oct 2024", "Draft"],
    ],
    statusIndex: 5,
    sideTitle: "PO status",
    sideDescription: "Current procurement pipeline.",
    progress: [
      { label: "Confirmed / in transit", value: "24 POs", percent: 75, tone: "bg-emerald-500" },
      { label: "Pending approval", value: "5 POs", percent: 16, tone: "bg-amber-500" },
      { label: "Draft", value: "3 POs", percent: 9, tone: "bg-slate-400" },
    ],
    notices: [{ title: "5 POs pending approval", detail: "PO-7739 YKK zippers needs procurement manager sign-off.", tone: "amber" }],
  },
  "stock-loan-management": {
    title: "Stock Loan Management",
    eyebrow: "Stock loans",
    description: "Track stock loans between suppliers, internal transfers, and return schedules.",
    action: "New loan",
    metrics: [
      { label: "Active loans", value: "8", note: "Across 4 suppliers", trend: "neutral" },
      { label: "Loan value", value: "$320K", note: "Outstanding balance", trend: "neutral" },
      { label: "Returns due", value: "3", note: "Within 7 days", trend: "down" },
      { label: "Overdue returns", value: "1", note: "5 days past due", trend: "down" },
    ],
    tableTitle: "Stock loan register",
    tableDescription: "Active stock loans with return tracking.",
    columns: ["Loan #", "Supplier", "Material", "Qty", "Loan date", "Status"],
    rows: [
      ["LN-2418", "Envoy Textiles", "Cotton Poplin", "4,200 m", "01 Oct 2024", "Active"],
      ["LN-2415", "DBL Group", "Poly Blend", "2,800 m", "05 Oct 2024", "Active"],
      ["LN-2412", "Noman Group", "Elastane", "1,200 m", "08 Oct 2024", "Return due"],
      ["LN-2408", "Epic Group", "Denim", "3,600 m", "12 Oct 2024", "Overdue"],
    ],
    statusIndex: 5,
    sideTitle: "Loan status",
    sideDescription: "Current stock loan pipeline.",
    progress: [
      { label: "Active", value: "5 loans", percent: 63, tone: "bg-primary" },
      { label: "Return due", value: "2 loans", percent: 25, tone: "bg-amber-500" },
      { label: "Overdue", value: "1 loan", percent: 12, tone: "bg-rose-500" },
    ],
    notices: [{ title: "LN-2408 overdue return", detail: "Epic Group denim loan 5 days past due — follow up.", tone: "rose" }],
  },
  "quotation-vs-actual-analysis": {
    title: "Quotation vs Actual Analysis",
    eyebrow: "Price variance",
    description: "Compare supplier quotations against actual invoice amounts to track price variances.",
    action: "New analysis",
    metrics: [
      { label: "Analyses completed", value: "28", note: "This month", trend: "up" },
      { label: "Positive variances", value: "18", note: "Actual below quote", trend: "up" },
      { label: "Negative variances", value: "8", note: "Actual above quote", trend: "down" },
      { label: "Avg. variance", value: "+2.4%", note: "Favorable overall", trend: "up" },
    ],
    tableTitle: "Variance report",
    tableDescription: "Quotation vs actual price comparison by material.",
    columns: ["Material", "Supplier", "Quoted", "Actual", "Variance", "Status"],
    rows: [
      ["Cotton Poplin", "Envoy Textiles", "$4.20/m", "$4.08/m", "-2.9%", "Favorable"],
      ["Thread", "Coats Bangladesh", "$2.80/cone", "$2.84/cone", "+1.4%", "Unfavorable"],
      ["Zippers", "YKK Bangladesh", "$0.42/pc", "$0.40/pc", "-4.8%", "Favorable"],
      ["Labels", "Pacific Accessories", "$0.08/pc", "$0.09/pc", "+12.5%", "Unfavorable"],
    ],
    statusIndex: 5,
    sideTitle: "Variance distribution",
    sideDescription: "Monthly price variance breakdown.",
    progress: [
      { label: "Favorable (below quote)", value: "18 items", percent: 64, tone: "bg-emerald-500" },
      { label: "On target (±2%)", value: "4 items", percent: 14, tone: "bg-primary" },
      { label: "Unfavorable", value: "6 items", percent: 21, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Labels 12.5% above quote", detail: "Pacific Accessories needs price correction — renegotiate.", tone: "rose" }],
  },
  "supplier-selection-price-quality-delivery-grade": {
    title: "Supplier Selection",
    eyebrow: "Supplier evaluation",
    description: "Evaluate and select suppliers based on price, quality, delivery performance, and grade.",
    action: "Evaluate supplier",
    metrics: [
      { label: "Suppliers evaluated", value: "18", note: "Active supplier pool", trend: "neutral" },
      { label: "Avg. score", value: "7.8 / 10", note: "Across all criteria", trend: "up" },
      { label: "Top rated", value: "4", note: "Score > 8.5", trend: "up" },
      { label: "Under review", value: "2", note: "Performance decline", trend: "down" },
    ],
    tableTitle: "Supplier scorecard",
    tableDescription: "Supplier evaluation across price, quality, delivery, and grade.",
    columns: ["Supplier", "Price", "Quality", "Delivery", "Grade", "Score"],
    rows: [
      ["Envoy Textiles", "8.2", "9.1", "8.6", "A", "8.6"],
      ["DBL Group", "7.8", "8.4", "7.2", "B+", "7.8"],
      ["Noman Group", "8.6", "7.8", "6.8", "B", "7.7"],
      ["Epic Group", "7.4", "8.8", "8.0", "B+", "8.1"],
    ],
    statusIndex: 5,
    sideTitle: "Grade distribution",
    sideDescription: "Supplier grade breakdown.",
    progress: [
      { label: "Grade A (8.5+)", value: "4 suppliers", percent: 22, tone: "bg-emerald-500" },
      { label: "Grade B+ (7.5–8.4)", value: "8 suppliers", percent: 44, tone: "bg-primary" },
      { label: "Grade B and below", value: "6 suppliers", percent: 33, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 suppliers under review", detail: "Noman Group delivery score dropped — schedule performance review.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function ProcurementWorkspace({ 
  module, 
  metrics, 
  rows, 
  rawItems,
  isLoading, 
  error 
}: { 
  module: ModuleKey
  metrics?: WorkspaceConfig["metrics"]
  rows?: WorkspaceConfig["rows"]
  rawItems?: Record<string, unknown>[]
  isLoading?: boolean
  error?: string | null
}) {
  const baseConfig = configs[module]
  const config = {
    ...baseConfig,
    metrics: metrics ?? baseConfig.metrics,
    rows: rows ?? baseConfig.rows,
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
            <a href="/procurement" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Procurement, Sourcing &amp; Supply
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
          {config.metrics.map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Package className="size-4 text-muted-foreground" />}
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
                    {config.rows.map((row, rowIndex) => (
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
                <CardTitle className="flex items-center gap-2 text-base"><Package className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Procurement attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening procurement task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Procurement hub</p><p className="text-xs text-muted-foreground">All sourcing data syncs with inventory and production.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
