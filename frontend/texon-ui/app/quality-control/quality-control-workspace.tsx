"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

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
  "fabric-inspection": {
    title: "Fabric Inspection",
    eyebrow: "Incoming QC",
    description: "Inspect incoming fabric lots for quality, defects, and compliance with buyer specifications.",
    action: "Log inspection",
    metrics: [
      { label: "Inspections today", value: "18", note: "Across all suppliers", trend: "up" },
      { label: "Pass rate", value: "93.4%", note: "Above 90% target", trend: "up" },
      { label: "Rejections", value: "3", note: "Rolls rejected", trend: "down" },
      { label: "Avg. grade", value: "4.1/5", note: "Supplier quality", trend: "up" },
    ],
    tableTitle: "Fabric inspection log",
    tableDescription: "Incoming fabric inspection results by lot.",
    columns: ["Lot #", "Fabric", "Supplier", "Rolls", "Grade", "Status"],
    rows: [
      ["LOT-2418", "Cotton Poplin", "TexFab Ltd", "42", "4.5/5", "Pass"],
      ["LOT-2415", "Poly Blend", "FiberCo", "28", "4.2/5", "Pass"],
      ["LOT-2412", "Denim 7oz", "DenimWorks", "18", "3.1/5", "Fail"],
      ["LOT-2408", "Chambray", "ChamText", "12", "4.0/5", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Inspection results",
    sideDescription: "Monthly inspection outcomes.",
    progress: [
      { label: "Pass", value: "156 rolls", percent: 93, tone: "bg-emerald-500" },
      { label: "Fail", value: "12 rolls", percent: 7, tone: "bg-rose-500" },
    ],
    notices: [{ title: "LOT-2412 failed inspection", detail: "Denim 7oz — excessive slubs and uneven dye. Reject entire lot.", tone: "rose" }],
  },
  "inline-qc": {
    title: "Inline QC",
    eyebrow: "In-process QC",
    description: "Monitor quality during production with inline inspections at critical checkpoints.",
    action: "Log inspection",
    metrics: [
      { label: "Inspections today", value: "24", note: "Across all lines", trend: "up" },
      { label: "Pass rate", value: "96.8%", note: "Above 95% target", trend: "up" },
      { label: "Defects found", value: "28", note: "18 minor, 10 major", trend: "down" },
      { label: "Open CARs", value: "3", note: "Corrective actions", trend: "neutral" },
    ],
    tableTitle: "Inline QC log",
    tableDescription: "In-process quality inspection results.",
    columns: ["Inspection #", "Line", "Checkpoint", "Sample", "Defects", "Status"],
    rows: [
      ["IQ-2418", "Line 1", "Post-sewing", "200 pcs", "2 minor", "Pass"],
      ["IQ-2415", "Line 3", "Post-sewing", "200 pcs", "3 major", "Fail"],
      ["IQ-2412", "Line 5", "Mid-process", "150 pcs", "1 minor", "Pass"],
      ["IQ-2408", "Line 7", "Post-sewing", "200 pcs", "4 minor", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Line quality",
    sideDescription: "Inline inspection by line.",
    progress: [
      { label: "Pass", value: "22 inspections", percent: 92, tone: "bg-emerald-500" },
      { label: "Fail", value: "2 inspections", percent: 8, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Line 3 inline QC fail", detail: "3 major defects on seam alignment — rework required before end-line.", tone: "rose" }],
  },
  "end-line-qc": {
    title: "End-line QC",
    eyebrow: "End-line inspection",
    description: "Final quality check at the end of each sewing line before garments move to finishing.",
    action: "Log inspection",
    metrics: [
      { label: "Inspected today", value: "4,280 pcs", note: "Across all lines", trend: "up" },
      { label: "First-pass rate", value: "94.2%", note: "Above 92% target", trend: "up" },
      { label: "Rejections", value: "248 pcs", note: "5.8% rejection", trend: "down" },
      { label: "Rework pending", value: "180 pcs", note: "Awaiting rework", trend: "neutral" },
    ],
    tableTitle: "End-line QC register",
    tableDescription: "End-of-line quality inspection by order.",
    columns: ["Order #", "Line", "Inspected", "Pass", "Fail", "Status"],
    rows: [
      ["PO-84920", "Line 1", "1,240", "1,208", "32", "Pass"],
      ["PO-85107", "Line 3", "860", "812", "48", "Fail"],
      ["PO-85241", "Line 5", "720", "696", "24", "Pass"],
      ["PO-85322", "Line 7", "480", "460", "20", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Line performance",
    sideDescription: "End-line QC by sewing line.",
    progress: [
      { label: "Pass (>92%)", value: "8 lines", percent: 67, tone: "bg-emerald-500" },
      { label: "Fail (<92%)", value: "2 lines", percent: 17, tone: "bg-rose-500" },
      { label: "Rework queue", value: "2 lines", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Line 3 end-line fail", detail: "48 pcs rejected on PO-85107 — seam puckering. Schedule rework.", tone: "rose" }],
  },
  "finishing-qc": {
    title: "Finishing QC",
    eyebrow: "Finishing inspection",
    description: "Quality check after finishing operations including pressing, labeling, and packaging.",
    action: "Log inspection",
    metrics: [
      { label: "Inspected today", value: "3,600 pcs", note: "Post-finishing", trend: "up" },
      { label: "Pass rate", value: "97.4%", note: "Above 96% target", trend: "up" },
      { label: "Rejections", value: "94 pcs", note: "2.6% rejection", trend: "down" },
      { label: "Label errors", value: "12", note: "Misplaced labels", trend: "neutral" },
    ],
    tableTitle: "Finishing QC register",
    tableDescription: "Post-finishing quality inspection results.",
    columns: ["Order #", "Inspector", "Inspected", "Pass", "Fail", "Status"],
    rows: [
      ["PO-84920", "Rahim U.", "1,208", "1,184", "24", "Pass"],
      ["PO-85107", "Fatima B.", "812", "792", "20", "Pass"],
      ["PO-85241", "Kamal H.", "696", "684", "12", "Pass"],
      ["PO-85322", "Nasrin A.", "460", "448", "12", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Finishing results",
    sideDescription: "Monthly finishing QC outcomes.",
    progress: [
      { label: "Pass", value: "3,508 pcs", percent: 97, tone: "bg-emerald-500" },
      { label: "Fail", value: "92 pcs", percent: 3, tone: "bg-rose-500" },
    ],
    notices: [{ title: "12 label errors detected", detail: "PO-85107 — size labels misaligned on 12 units. Correct before packing.", tone: "amber" }],
  },
  "final-inspection": {
    title: "Final Inspection",
    eyebrow: "Pre-shipment QC",
    description: "Final quality inspection before shipment including AQL sampling and buyer sign-off.",
    action: "Schedule inspection",
    metrics: [
      { label: "Inspections scheduled", value: "8", note: "This week", trend: "neutral" },
      { label: "Completed", value: "6", note: "75% completion", trend: "up" },
      { label: "AQL pass rate", value: "91.2%", note: "Level 2.5", trend: "up" },
      { label: "Pending sign-off", value: "2", note: "Awaiting buyer", trend: "neutral" },
    ],
    tableTitle: "Final inspection register",
    tableDescription: "Pre-shipment inspection results.",
    columns: ["Order #", "Buyer", "Sample", "Defects", "AQL", "Status"],
    rows: [
      ["PO-84920", "H&M", "80 pcs", "2 minor", "2.5", "Pass"],
      ["PO-85107", "Zara", "50 pcs", "4 major", "2.5", "Fail"],
      ["PO-85241", "Uniqlo", "80 pcs", "1 minor", "2.5", "Pass"],
      ["PO-85322", "Levi's", "32 pcs", "0", "2.5", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Inspection status",
    sideDescription: "Weekly final inspection.",
    progress: [
      { label: "Pass", value: "5 inspections", percent: 62, tone: "bg-emerald-500" },
      { label: "Fail", value: "1 inspection", percent: 12, tone: "bg-rose-500" },
      { label: "Scheduled", value: "2 inspections", percent: 25, tone: "bg-primary" },
    ],
    notices: [{ title: "PO-85107 AQL fail", detail: "Zara cargo — 4 major defects exceed AQL 2.5. Rework and re-inspect.", tone: "rose" }],
  },
  "defect-category-tracking": {
    title: "Defect Category Tracking",
    eyebrow: "Defect analysis",
    description: "Track and analyze defects by category, severity, and production line for root cause analysis.",
    action: "Log defect",
    metrics: [
      { label: "Total defects today", value: "42", note: "Across all lines", trend: "down" },
      { label: "Major defects", value: "12", note: "29% of total", trend: "down" },
      { label: "Minor defects", value: "30", note: "71% of total", trend: "neutral" },
      { label: "Defect rate", value: "2.4%", note: "Below 3% target", trend: "up" },
    ],
    tableTitle: "Defect category register",
    tableDescription: "Defects by category and line.",
    columns: ["Category", "Line", "Count", "Severity", "Order", "Trend"],
    rows: [
      ["Seam puckering", "Line 3", "14", "Major", "PO-85107", "Increasing"],
      ["Skip stitch", "Line 1", "8", "Minor", "PO-84920", "Stable"],
      ["Open seam", "Line 5", "6", "Major", "PO-85241", "Decreasing"],
      ["Label misplacement", "Line 7", "4", "Minor", "PO-85322", "Stable"],
    ],
    statusIndex: 5,
    sideTitle: "Defect breakdown",
    sideDescription: "Top defect categories.",
    progress: [
      { label: "Seam defects", value: "20 defects", percent: 48, tone: "bg-rose-500" },
      { label: "Stitch defects", value: "12 defects", percent: 29, tone: "bg-amber-500" },
      { label: "Label & finish", value: "10 defects", percent: 24, tone: "bg-primary" },
    ],
    notices: [{ title: "Seam puckering increasing", detail: "Line 3 — 14 defects this week. Check machine tension and operator technique.", tone: "rose" }],
  },
  "rejection-report": {
    title: "Rejection Report",
    eyebrow: "Rejection tracking",
    description: "Track and analyze rejected garments with root cause and corrective action status.",
    action: "Log rejection",
    metrics: [
      { label: "Rejections today", value: "342 pcs", note: "Across all stages", trend: "down" },
      { label: "Rejection rate", value: "3.2%", note: "Below 4% target", trend: "up" },
      { label: "Reworked", value: "280 pcs", note: "82% rework success", trend: "up" },
      { label: "Scrapped", value: "62 pcs", note: "Irrecoverable", trend: "neutral" },
    ],
    tableTitle: "Rejection register",
    tableDescription: "Rejected garments by order and cause.",
    columns: ["Order #", "Stage", "Rejected", "Cause", "Reworked", "Status"],
    rows: [
      ["PO-85107", "End-line QC", "48 pcs", "Seam puckering", "40 pcs", "Partially reworked"],
      ["PO-84920", "Final inspection", "32 pcs", "Color shade", "0 pcs", "Scrapped"],
      ["PO-85241", "Finishing QC", "24 pcs", "Label error", "24 pcs", "Reworked"],
      ["PO-85322", "Inline QC", "18 pcs", "Skip stitch", "16 pcs", "Reworked"],
    ],
    statusIndex: 5,
    sideTitle: "Rejection by stage",
    sideDescription: "Monthly rejection breakdown.",
    progress: [
      { label: "End-line QC", value: "48 pcs", percent: 40, tone: "bg-rose-500" },
      { label: "Final inspection", value: "32 pcs", percent: 27, tone: "bg-amber-500" },
      { label: "Finishing QC", value: "42 pcs", percent: 35, tone: "bg-primary" },
    ],
    notices: [{ title: "32 pcs scrapped — PO-84920", detail: "Color shade variance cannot be reworked. File supplier claim.", tone: "rose" }],
  },
  "alteration-report": {
    title: "Alteration Report",
    eyebrow: "Alteration tracking",
    description: "Track alteration requests, rework status, and completion rates for rejected garments.",
    action: "Log alteration",
    metrics: [
      { label: "Alterations pending", value: "64", note: "Awaiting rework", trend: "neutral" },
      { label: "Completed today", value: "48", note: "75% completion", trend: "up" },
      { label: "Avg. turnaround", value: "4.2 hrs", note: "Request to completion", trend: "up" },
      { label: "Success rate", value: "94.6%", note: "First-time rework", trend: "up" },
    ],
    tableTitle: "Alteration register",
    tableDescription: "Alteration requests and rework status.",
    columns: ["Alt #", "Order", "Defect", "Qty", "Assigned", "Status"],
    rows: [
      ["ALT-2418", "PO-85107", "Seam puckering", "40 pcs", "Rahim U.", "In progress"],
      ["ALT-2415", "PO-85241", "Label error", "24 pcs", "Fatima B.", "Completed"],
      ["ALT-2412", "PO-85322", "Skip stitch", "16 pcs", "Kamal H.", "Completed"],
      ["ALT-2408", "PO-84920", "Open seam", "8 pcs", "Nasrin A.", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Alteration status",
    sideDescription: "Weekly alteration pipeline.",
    progress: [
      { label: "Completed", value: "96 alterations", percent: 60, tone: "bg-emerald-500" },
      { label: "In progress", value: "48 alterations", percent: 30, tone: "bg-primary" },
      { label: "Pending", value: "16 alterations", percent: 10, tone: "bg-amber-500" },
    ],
    notices: [{ title: "40 pcs seam rework pending", detail: "PO-85107 — Rahim U. assigned. ETA 4 hours for completion.", tone: "amber" }],
  },
  "buyer-wise-quality-history": {
    title: "Buyer-wise Quality History",
    eyebrow: "Buyer quality",
    description: "Track quality performance history by buyer with defect rates and inspection trends.",
    action: "View report",
    metrics: [
      { label: "Buyers tracked", value: "12", note: "Active buyers", trend: "neutral" },
      { label: "Avg. pass rate", value: "96.4%", note: "All buyers combined", trend: "up" },
      { label: "Best performer", value: "H&M", note: "98.2% pass rate", trend: "up" },
      { label: "Needs attention", value: "2", note: "Below 94% target", trend: "down" },
    ],
    tableTitle: "Buyer quality register",
    tableDescription: "Quality performance by buyer.",
    columns: ["Buyer", "Orders", "Inspected", "Pass rate", "Defects", "Rating"],
    rows: [
      ["H&M", "24", "48,600", "98.2%", "0.8%", "Excellent"],
      ["Zara", "18", "32,400", "94.6%", "2.4%", "Good"],
      ["Uniqlo", "14", "28,200", "96.8%", "1.6%", "Good"],
      ["Levi's", "8", "12,800", "91.2%", "4.2%", "Needs review"],
    ],
    statusIndex: 5,
    sideTitle: "Buyer ratings",
    sideDescription: "Buyer quality ratings.",
    progress: [
      { label: "Excellent (>97%)", value: "5 buyers", percent: 42, tone: "bg-emerald-500" },
      { label: "Good (94–97%)", value: "5 buyers", percent: 42, tone: "bg-primary" },
      { label: "Needs review (<94%)", value: "2 buyers", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Levi's quality below target", detail: "91.2% pass rate — schedule quality review meeting with buyer.", tone: "amber" }],
  },
  "corrective-action-tracking": {
    title: "Corrective Action Tracking",
    eyebrow: "CAR tracking",
    description: "Track corrective and preventive actions for quality issues with root cause analysis.",
    action: "Raise CAR",
    metrics: [
      { label: "Open CARs", value: "6", note: "Awaiting closure", trend: "neutral" },
      { label: "Closed this month", value: "14", note: "87.5% closure rate", trend: "up" },
      { label: "Overdue CARs", value: "2", note: "Past deadline", trend: "down" },
      { label: "Avg. closure time", value: "5.2 days", note: "Request to closure", trend: "up" },
    ],
    tableTitle: "CAR register",
    tableDescription: "Corrective action requests and status.",
    columns: ["CAR #", "Issue", "Root cause", "Owner", "Due", "Status"],
    rows: [
      ["CAR-2418", "Seam puckering Line 3", "Machine tension", "IE Team", "16 Oct", "In progress"],
      ["CAR-2415", "Color shade PO-84920", "Supplier batch", "Procurement", "14 Oct", "Closed"],
      ["CAR-2412", "Label error Line 7", "Operator training", "HR Team", "18 Oct", "In progress"],
      ["CAR-2408", "Skip stitch Line 1", "Needle wear", "Maintenance", "12 Oct", "Overdue"],
    ],
    statusIndex: 5,
    sideTitle: "CAR status",
    sideDescription: "Monthly CAR pipeline.",
    progress: [
      { label: "Closed", value: "14 CARs", percent: 58, tone: "bg-emerald-500" },
      { label: "In progress", value: "6 CARs", percent: 25, tone: "bg-primary" },
      { label: "Overdue", value: "4 CARs", percent: 17, tone: "bg-rose-500" },
    ],
    notices: [{ title: "CAR-2408 overdue", detail: "Needle wear fix on Line 1 was due Oct 12 — escalate with maintenance.", tone: "rose" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
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
          {config.metrics.map((metric) => (
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
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {config.rows.map((row) => (
                      <tr key={row[0]} className="border-t transition-colors hover:bg-muted/30">
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
                <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Quality attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
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
