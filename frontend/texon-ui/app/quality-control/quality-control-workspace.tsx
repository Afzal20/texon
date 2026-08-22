"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "fabric-inspection"
  | "inline-qc"
  | "end-line-qc"
  | "finishing-qc"
  | "final-inspection"
  | "defect-category-tracking"
  | "rejection-report"
  | "alteration-report"
  | "buyer-wise-quality-history"
  | "corrective-action-tracking"

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
  "fabric-inspection": {
    title: "Fabric Inspection",
    eyebrow: "Incoming QC",
    description: "Inspect incoming fabric lots for quality, defects, and compliance with buyer specifications.",
    action: "Log inspection",
    tableTitle: "Fabric inspection log",
    tableDescription: "Incoming fabric inspection results by lot.",
    columns: ["Lot #", "Fabric", "Supplier", "Rolls", "Grade", "Status"],
    statusIndex: 5,
    sideTitle: "Inspection results",
    sideDescription: "Monthly inspection outcomes.",
  },
  "inline-qc": {
    title: "Inline QC",
    eyebrow: "In-process QC",
    description: "Monitor quality during production with inline inspections at critical checkpoints.",
    action: "Log inspection",
    tableTitle: "Inline QC log",
    tableDescription: "In-process quality inspection results.",
    columns: ["Inspection #", "Line", "Checkpoint", "Sample", "Defects", "Status"],
    statusIndex: 5,
    sideTitle: "Line quality",
    sideDescription: "Inline inspection by line.",
  },
  "end-line-qc": {
    title: "End-line QC",
    eyebrow: "End-line inspection",
    description: "Final quality check at the end of each sewing line before garments move to finishing.",
    action: "Log inspection",
    tableTitle: "End-line QC register",
    tableDescription: "End-of-line quality inspection by order.",
    columns: ["Order #", "Line", "Inspected", "Pass", "Fail", "Status"],
    statusIndex: 5,
    sideTitle: "Line performance",
    sideDescription: "End-line QC by sewing line.",
  },
  "finishing-qc": {
    title: "Finishing QC",
    eyebrow: "Finishing inspection",
    description: "Quality check after finishing operations including pressing, labeling, and packaging.",
    action: "Log inspection",
    tableTitle: "Finishing QC register",
    tableDescription: "Post-finishing quality inspection results.",
    columns: ["Order #", "Inspector", "Inspected", "Pass", "Fail", "Status"],
    statusIndex: 5,
    sideTitle: "Finishing results",
    sideDescription: "Monthly finishing QC outcomes.",
  },
  "final-inspection": {
    title: "Final Inspection",
    eyebrow: "Pre-shipment QC",
    description: "Final quality inspection before shipment including AQL sampling and buyer sign-off.",
    action: "Schedule inspection",
    tableTitle: "Final inspection register",
    tableDescription: "Pre-shipment inspection results.",
    columns: ["Order #", "Buyer", "Sample", "Defects", "AQL", "Status"],
    statusIndex: 5,
    sideTitle: "Inspection status",
    sideDescription: "Weekly final inspection.",
  },
  "defect-category-tracking": {
    title: "Defect Category Tracking",
    eyebrow: "Defect analysis",
    description: "Track and analyze defects by category, severity, and production line for root cause analysis.",
    action: "Log defect",
    tableTitle: "Defect category register",
    tableDescription: "Defects by category and line.",
    columns: ["Category", "Line", "Count", "Severity", "Order", "Trend"],
    statusIndex: 5,
    sideTitle: "Defect breakdown",
    sideDescription: "Top defect categories.",
  },
  "rejection-report": {
    title: "Rejection Report",
    eyebrow: "Rejection tracking",
    description: "Track and analyze rejected garments with root cause and corrective action status.",
    action: "Log rejection",
    tableTitle: "Rejection register",
    tableDescription: "Rejected garments by order and cause.",
    columns: ["Order #", "Stage", "Rejected", "Cause", "Reworked", "Status"],
    statusIndex: 5,
    sideTitle: "Rejection by stage",
    sideDescription: "Monthly rejection breakdown.",
  },
  "alteration-report": {
    title: "Alteration Report",
    eyebrow: "Alteration tracking",
    description: "Track alteration requests, rework status, and completion rates for rejected garments.",
    action: "Log alteration",
    tableTitle: "Alteration register",
    tableDescription: "Alteration requests and rework status.",
    columns: ["Alt #", "Order", "Defect", "Qty", "Assigned", "Status"],
    statusIndex: 5,
    sideTitle: "Alteration status",
    sideDescription: "Weekly alteration pipeline.",
  },
  "buyer-wise-quality-history": {
    title: "Buyer-wise Quality History",
    eyebrow: "Buyer quality",
    description: "Track quality performance history by buyer with defect rates and inspection trends.",
    action: "View report",
    tableTitle: "Buyer quality register",
    tableDescription: "Quality performance by buyer.",
    columns: ["Buyer", "Orders", "Inspected", "Pass rate", "Defects", "Rating"],
    statusIndex: 5,
    sideTitle: "Buyer ratings",
    sideDescription: "Buyer quality ratings.",
  },
  "corrective-action-tracking": {
    title: "Corrective Action Tracking",
    eyebrow: "CAR tracking",
    description: "Track corrective and preventive actions for quality issues with root cause analysis.",
    action: "Raise CAR",
    tableTitle: "CAR register",
    tableDescription: "Corrective action requests and status.",
    columns: ["CAR #", "Issue", "Root cause", "Owner", "Due", "Status"],
    statusIndex: 5,
    sideTitle: "CAR status",
    sideDescription: "Monthly CAR pipeline.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function QualityControlWorkspace({ 
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
            <a href="/quality-control" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Quality Control
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <ShieldCheck className="size-4 text-muted-foreground" />}
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
                <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Quality attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening quality task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Quality hub</p><p className="text-xs text-muted-foreground">All QC data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
