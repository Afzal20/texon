"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Shirt } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "style-management"
  | "pre-costing"
  | "sample-order-management"
  | "bulk-po-management"
  | "budget-demand-assessment"
  | "capacity-booking-allocation"
  | "buyer-enquiry-analysis"
  | "rm-collection-consumption-sourcing"
  | "development-monitoring-by-supplier"
  | "sample-monitoring-fit-pp"
  | "smv-calculation"
  | "ie-suggestion-for-pph"
  | "skill-inventory"
  | "production-downtime-analysis"
  | "line-layout"
  | "process-wise-targets-achievements"
  | "production-efficiency-tracking"

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
  "style-management": {
    title: "Style Management",
    eyebrow: "Style master",
    description: "Maintain style library, tech packs, and buyer-specific variants.",
    action: "Add style",
    tableTitle: "Style register",
    tableDescription: "Most recent style submissions and their development stage.",
    columns: ["Style #", "Style name", "Buyer", "Category", "Season", "Status"],
    statusIndex: 5,
    sideTitle: "Style pipeline",
    sideDescription: "Current styles by development stage.",
  },
  "pre-costing": {
    title: "Pre-Costing",
    eyebrow: "Cost estimation",
    description: "Generate preliminary cost sheets before final costing and buyer approval.",
    action: "New cost sheet",
    tableTitle: "Recent cost sheets",
    tableDescription: "Preliminary FOB estimates with material and labor breakdown.",
    columns: ["Cost sheet", "Style", "Buyer", "FOB estimate", "Fabric cost", "Status"],
    statusIndex: 5,
    sideTitle: "Cost breakdown",
    sideDescription: "Average FOB composition for approved sheets.",
  },
  "sample-order-management": {
    title: "Sample Order Management",
    eyebrow: "Sample tracking",
    description: "Manage sample requests, approvals, and shipment to buyers.",
    action: "Create sample order",
    tableTitle: "Sample order tracker",
    tableDescription: "Sample orders ranked by buyer deadline.",
    columns: ["Sample #", "Style", "Buyer", "Type", "Ship date", "Status"],
    statusIndex: 5,
    sideTitle: "Sample types",
    sideDescription: "Current sample orders by type.",
  },
  "bulk-po-management": {
    title: "Bulk PO Management",
    eyebrow: "Purchase orders",
    description: "Track bulk purchase orders from confirmation through shipment.",
    action: "New PO",
    tableTitle: "Active purchase orders",
    tableDescription: "Bulk POs ordered by shipment date.",
    columns: ["PO #", "Buyer", "Style", "Qty (pcs)", "Ship date", "Status"],
    statusIndex: 5,
    sideTitle: "Order value by buyer",
    sideDescription: "Open PO value distribution.",
  },
  "budget-demand-assessment": {
    title: "Budget & Demand Assessment",
    eyebrow: "Demand planning",
    description: "Evaluate buyer demand against factory capacity and financial targets.",
    action: "New assessment",
    tableTitle: "Buyer demand forecast",
    tableDescription: "Projected order volume by buyer for the upcoming quarter.",
    columns: ["Buyer", "Forecast (pcs)", "Booked (pcs)", "Gap (pcs)", "Revenue est.", "Confidence"],
    statusIndex: 5,
    sideTitle: "Capacity utilization",
    sideDescription: "Quarterly capacity allocation.",
  },
  "capacity-booking-allocation": {
    title: "Capacity & Booking Allocation",
    eyebrow: "Line allocation",
    description: "Allocate production lines to orders and manage booking conflicts.",
    action: "New booking",
    tableTitle: "Line allocation schedule",
    tableDescription: "Current week's production line assignments.",
    columns: ["Line", "Order", "Buyer", "Style", "Allocated", "Status"],
    statusIndex: 5,
    sideTitle: "Line utilization",
    sideDescription: "Current week allocation status.",
  },
  "buyer-enquiry-analysis": {
    title: "Buyer Enquiry Analysis",
    eyebrow: "Enquiry tracking",
    description: "Track buyer enquiries, conversion rates, and response performance.",
    action: "Log enquiry",
    tableTitle: "Recent buyer enquiries",
    tableDescription: "Enquiries from initial contact through to order conversion.",
    columns: ["Enquiry #", "Buyer", "Description", "Received", "Value est.", "Status"],
    statusIndex: 5,
    sideTitle: "Conversion funnel",
    sideDescription: "Enquiry-to-order pipeline.",
  },
  "rm-collection-consumption-sourcing": {
    title: "RM Collection, Consumption & Sourcing",
    eyebrow: "Material sourcing",
    description: "Track raw material requirements, sourcing status, and consumption against orders.",
    action: "New material entry",
    tableTitle: "Material sourcing tracker",
    tableDescription: "Active material requirements linked to purchase orders.",
    columns: ["Material", "Type", "Supplier", "PO qty", "Required by", "Status"],
    statusIndex: 5,
    sideTitle: "Sourcing status",
    sideDescription: "Material requirement fulfillment.",
  },
  "development-monitoring-by-supplier": {
    title: "Development Monitoring (by Supplier)",
    eyebrow: "Supplier development",
    description: "Monitor supplier development pipeline from initial sampling through production readiness.",
    action: "Add development order",
    tableTitle: "Supplier development status",
    tableDescription: "Styles currently in the development pipeline by supplier.",
    columns: ["Style", "Supplier", "Stage", "Deadline", "Days left", "Status"],
    statusIndex: 5,
    sideTitle: "Development stages",
    sideDescription: "Styles by current development phase.",
  },
  "sample-monitoring-fit-pp": {
    title: "Sample Monitoring (FIT, PP)",
    eyebrow: "Sample approval",
    description: "Track fit and pre-production sample approval stages across all active styles.",
    action: "Log sample status",
    tableTitle: "Sample approval tracker",
    tableDescription: "FIT and PP sample status by style and buyer.",
    columns: ["Style", "Buyer", "FIT round", "FIT status", "PP round", "PP status"],
    statusIndex: 3,
    sideTitle: "Approval breakdown",
    sideDescription: "Sample approval progress.",
  },
  "smv-calculation": {
    title: "SMV Calculation",
    eyebrow: "Time study",
    description: "Calculate and maintain Standard Minute Values for garment operations.",
    action: "New SMV study",
    tableTitle: "SMV register",
    tableDescription: "Standard minute values by style and operation.",
    columns: ["Style", "Operation", "SMV (min)", "Method", "Machine", "Category"],
    statusIndex: 5,
    sideTitle: "SMV by category",
    sideDescription: "Average SMV distribution across garment types.",
  },
  "ie-suggestion-for-pph": {
    title: "IE Suggestion for PPH",
    eyebrow: "Industrial engineering",
    description: "Generate IE recommendations for Pieces Per Hour targets and method improvements.",
    action: "New suggestion",
    tableTitle: "IE suggestions log",
    tableDescription: "Method improvements and PPH target recommendations.",
    columns: ["Suggestion #", "Line / style", "Operation", "Current PPH", "Target PPH", "Status"],
    statusIndex: 5,
    sideTitle: "PPH gains by line",
    sideDescription: "Average PPH improvement after IE implementation.",
  },
  "skill-inventory": {
    title: "Skill Inventory",
    eyebrow: "Workforce skills",
    description: "Maintain operator skill matrices and track training progress across lines.",
    action: "Update skill matrix",
    tableTitle: "Operator skill matrix",
    tableDescription: "Current skill levels by operator and operation type.",
    columns: ["Operator", "Line", "Sewing ops", "Finishing ops", "Multi-skill", "Rating"],
    statusIndex: 5,
    sideTitle: "Skill distribution",
    sideDescription: "Operator skill level breakdown.",
  },
  "production-downtime-analysis": {
    title: "Production Downtime Analysis",
    eyebrow: "Downtime tracking",
    description: "Monitor and analyze production downtime events across all lines.",
    action: "Log downtime",
    tableTitle: "Recent downtime events",
    tableDescription: "Downtime incidents logged with root cause classification.",
    columns: ["Event #", "Line", "Start time", "Duration", "Cause", "Status"],
    statusIndex: 5,
    sideTitle: "Downtime by cause",
    sideDescription: "Distribution of downtime across root causes.",
  },
  "line-layout": {
    title: "Line Layout",
    eyebrow: "Line configuration",
    description: "Design and manage production line layouts, machine placement, and operator positioning.",
    action: "New line layout",
    tableTitle: "Line configuration overview",
    tableDescription: "Current line layouts with machine and operator counts.",
    columns: ["Line", "Type", "Machines", "Operators", "Target/day", "Efficiency"],
    statusIndex: 5,
    sideTitle: "Line type distribution",
    sideDescription: "Production lines by garment category.",
  },
  "process-wise-targets-achievements": {
    title: "Process-wise Targets & Achievements",
    eyebrow: "Target tracking",
    description: "Compare process-level production targets against actual achievements.",
    action: "Update targets",
    tableTitle: "Process achievement report",
    tableDescription: "Monthly target vs. actual by production process.",
    columns: ["Process", "Target (pcs)", "Achieved (pcs)", "Achievement %", "Variance", "Status"],
    statusIndex: 5,
    sideTitle: "Process breakdown",
    sideDescription: "Achievement distribution by process.",
  },
  "production-efficiency-tracking": {
    title: "Production Efficiency Tracking",
    eyebrow: "Efficiency metrics",
    description: "Monitor line-level efficiency, identify bottlenecks, and track improvement trends.",
    action: "View report",
    tableTitle: "Line efficiency dashboard",
    tableDescription: "Real-time efficiency metrics by production line.",
    columns: ["Line", "Style", "Supervisor", "Efficiency %", "Output (pcs)", "Status"],
    statusIndex: 5,
    sideTitle: "Efficiency distribution",
    sideDescription: "Lines grouped by efficiency band.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

const ROWS_PER_PAGE = 15

export function MerchandisingWorkspace({ module, metrics, rows, isLoading, error, dataNotice, rowLink, rawItems }: { module: ModuleKey; metrics?: Metric[]; rows?: string[][]; isLoading?: boolean; error?: string | null; dataNotice?: string | null; rowLink?: (row: string[]) => string; rawItems?: Record<string, unknown>[] }) {
  const router = useRouter()
  const config = configs[module]
  const resolvedMetrics = metrics ?? []
  const resolvedRows = rows ?? []
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(resolvedRows.length / ROWS_PER_PAGE))
  const paginatedRows = useMemo(() => resolvedRows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE), [resolvedRows, page])

  if (isLoading) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="gap-3 border-border/70 py-4 shadow-none">
                <CardContent className="p-0">
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-7 w-32 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-3 w-36 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-12 text-center">
            <p className="text-lg font-semibold text-rose-800">Failed to load data</p>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        {dataNotice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            {dataNotice}
          </div>
        )}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/merchandising" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Merchandising
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{config.eyebrow}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          </div>
          <Button className="gap-2" onClick={() => router.push(`/merchandising/${module}/new`)}><Plus className="size-4" /> {config.action}</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resolvedMetrics.map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Shirt className="size-4 text-muted-foreground" />}
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
                    {paginatedRows.length > 0 ? paginatedRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`border-t transition-colors ${rowLink ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/30"}`}
                        onClick={() => { if (rowLink) router.push(rowLink(row)) }}
                      >
                        {row.slice(0, config.columns.length).map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 whitespace-nowrap ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${noticeClass(cell as "amber" | "rose" | "emerald")}`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={config.columns.length} className="px-5 py-8 text-center text-sm text-muted-foreground">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>{resolvedRows.length} record{resolvedRows.length !== 1 ? "s" : ""}</span>
                <div className="flex items-center gap-1">
                  <button
                    className={`inline-flex size-7 items-center justify-center rounded-md ${page <= 1 ? "text-muted-foreground/40" : "text-muted-foreground hover:bg-muted"}`}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`inline-flex size-7 items-center justify-center rounded-md text-xs font-medium ${
                        p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className={`inline-flex size-7 items-center justify-center rounded-md ${page >= totalPages ? "text-muted-foreground/40" : "text-muted-foreground hover:bg-muted"}`}
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Shirt className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Merchandising attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening merchandising task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Merchandising hub</p><p className="text-xs text-muted-foreground">All module data is synced in real-time across teams.</p></div></CardContent>
            </Card>
          </div>
        </div>

        {rawItems && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
