"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Ship } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"

type ModuleKey =
  | "import-management"
  | "export-management"
  | "export-lc-sales-contract-collection-amendment"
  | "btb-lc-opening-amendment"
  | "shipment-monitoring-eta-updates"
  | "supplier-document-receive-acceptance"
  | "acceptance-clearance"
  | "booking-to-forwarder"
  | "invoice-preparation"
  | "bill-of-exchange-bank-document"
  | "realization-follow-up"
  | "short-realization-cause-tracking"
  | "sod-fc-transfer-acknowledgement"
  | "disbursement-amount-tracking"

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

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

// Static labels only — every number and row on screen comes from backend data
// passed in via props/rawItems by the module pages.
const configs: Record<ModuleKey, WorkspaceConfig> = {
  "import-management": {
    title: "Import Management",
    eyebrow: "Import tracking",
    description: "Track and manage all import activities including LC, shipments, and customs clearance.",
    action: "New import",
    tableTitle: "Import register",
    tableDescription: "Active import shipments with status tracking.",
    columns: ["Import #", "Supplier", "LC number", "ETD", "ETA", "Status"],
    statusIndex: 5,
    sideTitle: "Import pipeline",
    sideDescription: "Live import status distribution.",
  },
  "export-management": {
    title: "Export Management",
    eyebrow: "Export tracking",
    description: "Manage export orders, shipment documentation, and buyer delivery schedules.",
    action: "New export",
    tableTitle: "Export shipment tracker",
    tableDescription: "Active export orders with shipment milestones.",
    columns: ["Export #", "Buyer", "PO #", "Shipment date", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Export value by buyer",
    sideDescription: "Live export distribution.",
  },
  "export-lc-sales-contract-collection-amendment": {
    title: "Export LC / Sales Contract Collection & Amendment",
    eyebrow: "LC management",
    description: "Manage export letter of credit collections, amendments, and compliance.",
    action: "New LC",
    tableTitle: "LC register",
    tableDescription: "Export LCs and sales contracts with status tracking.",
    columns: ["LC #", "Buyer", "Value", "Issue date", "Expiry", "Status"],
    statusIndex: 5,
    sideTitle: "LC status",
    sideDescription: "Live LC pipeline status.",
  },
  "btb-lc-opening-amendment": {
    title: "BTB LC Opening & Amendment",
    eyebrow: "Back-to-back LC",
    description: "Manage back-to-back letter of credit opening, amendments, and tracking.",
    action: "Open BTB LC",
    tableTitle: "BTB LC register",
    tableDescription: "Back-to-back LCs linked to export orders.",
    columns: ["BTB LC #", "Supplier", "Export LC", "Value", "Validity", "Status"],
    statusIndex: 5,
    sideTitle: "BTB LC pipeline",
    sideDescription: "Live LC status distribution.",
  },
  "shipment-monitoring-eta-updates": {
    title: "Shipment Monitoring & ETA Updates",
    eyebrow: "Shipment tracking",
    description: "Monitor incoming and outgoing shipments with real-time ETA tracking.",
    action: "Add shipment",
    tableTitle: "Shipment tracker",
    tableDescription: "Active shipments with ETA monitoring.",
    columns: ["Shipment #", "Type", "Origin / Destination", "Carrier", "ETA", "Status"],
    statusIndex: 5,
    sideTitle: "Shipment status",
    sideDescription: "Live shipment pipeline.",
  },
  "supplier-document-receive-acceptance": {
    title: "Supplier Document Receive & Acceptance",
    eyebrow: "Document tracking",
    description: "Track supplier document submissions and acceptance status for imports.",
    action: "Log document",
    tableTitle: "Document register",
    tableDescription: "Supplier documents received with acceptance tracking.",
    columns: ["Document #", "Supplier", "PO #", "Type", "Received", "Status"],
    statusIndex: 5,
    sideTitle: "Document status",
    sideDescription: "Live document processing.",
  },
  "acceptance-clearance": {
    title: "Acceptance Clearance",
    eyebrow: "Clearance tracking",
    description: "Manage document acceptance and customs clearance for imported goods.",
    action: "New clearance",
    tableTitle: "Clearance register",
    tableDescription: "Import clearance status by shipment.",
    columns: ["Clearance #", "Shipment", "Supplier", "Documents", "Submitted", "Status"],
    statusIndex: 5,
    sideTitle: "Clearance pipeline",
    sideDescription: "Live clearance status.",
  },
  "booking-to-forwarder": {
    title: "Booking to Forwarder",
    eyebrow: "Freight booking",
    description: "Manage freight bookings with shipping lines and forwarders for imports and exports.",
    action: "New booking",
    tableTitle: "Booking register",
    tableDescription: "Freight bookings with shipping lines and forwarders.",
    columns: ["Booking #", "Shipment", "Forwarder", "Vessel/Flight", "ETD", "Status"],
    statusIndex: 5,
    sideTitle: "Booking status",
    sideDescription: "Live booking pipeline.",
  },
  "invoice-preparation": {
    title: "Invoice Preparation",
    eyebrow: "Invoice management",
    description: "Prepare, review, and manage commercial invoices for exports and imports.",
    action: "Create invoice",
    tableTitle: "Invoice register",
    tableDescription: "Commercial invoices with approval status.",
    columns: ["Invoice #", "Buyer/Supplier", "PO #", "Amount", "Prepared", "Status"],
    statusIndex: 5,
    sideTitle: "Invoice pipeline",
    sideDescription: "Live invoice processing status.",
  },
  "bill-of-exchange-bank-document": {
    title: "Bill of Exchange / Bank Document",
    eyebrow: "Bank documents",
    description: "Manage bills of exchange, bank documents, and trade finance paperwork.",
    action: "New document",
    tableTitle: "Bank document register",
    tableDescription: "Bills of exchange and trade finance documents.",
    columns: ["Document #", "LC #", "Bank", "Amount", "Submitted", "Status"],
    statusIndex: 5,
    sideTitle: "Document pipeline",
    sideDescription: "Live bank document processing status.",
  },
  "realization-follow-up": {
    title: "Realization Follow-up",
    eyebrow: "Realization tracking",
    description: "Track export realization status and follow up on pending payments from buyers.",
    action: "Log realization",
    tableTitle: "Realization tracker",
    tableDescription: "Export realization status with payment follow-up.",
    columns: ["Realization #", "Buyer", "Invoice #", "Amount", "Due date", "Status"],
    statusIndex: 5,
    sideTitle: "Realization status",
    sideDescription: "Live realization pipeline.",
  },
  "short-realization-cause-tracking": {
    title: "Short Realization Cause Tracking",
    eyebrow: "Shortfall tracking",
    description: "Track and analyze causes of short realization amounts against invoiced values.",
    action: "Log shortfall",
    tableTitle: "Short realization register",
    tableDescription: "Shortfalls between invoiced and realized amounts.",
    columns: ["Shortfall #", "Buyer", "Invoice #", "Short amount", "Cause", "Status"],
    statusIndex: 5,
    sideTitle: "Shortfall by cause",
    sideDescription: "Live shortfall distribution.",
  },
  "sod-fc-transfer-acknowledgement": {
    title: "SOD / FC Transfer Acknowledgement",
    eyebrow: "Transfer tracking",
    description: "Track SOD (Statement of Deficiency) and FC (Foreign Currency) transfers with acknowledgements.",
    action: "Log transfer",
    tableTitle: "Transfer register",
    tableDescription: "SOD and FC transfers with acknowledgement status.",
    columns: ["Transfer #", "Type", "Bank", "Amount", "Date", "Status"],
    statusIndex: 5,
    sideTitle: "Transfer status",
    sideDescription: "Live transfer pipeline.",
  },
  "disbursement-amount-tracking": {
    title: "Disbursement Amount Tracking",
    eyebrow: "Disbursement tracking",
    description: "Track and reconcile disbursement amounts against approved budgets and POs.",
    action: "Log disbursement",
    tableTitle: "Disbursement register",
    tableDescription: "Disbursement amounts with approval and reconciliation status.",
    columns: ["Disbursement #", "Category", "PO / Invoice", "Amount", "Date", "Status"],
    statusIndex: 5,
    sideTitle: "Disbursement by category",
    sideDescription: "Live disbursement distribution.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

export function CommercialManagementWorkspace({
  module,
  metrics,
  rows,
  isLoading = false,
  error = null,
  rawItems,
}: {
  module: ModuleKey
  metrics?: Metric[]
  rows?: string[][]
  isLoading?: boolean
  error?: string | null
  rawItems?: Record<string, unknown>[]
}) {
  const config = configs[module]
  const items = rawItems ?? []
  const displayMetrics: Metric[] = metrics ?? []
  const displayRows: string[][] = rows ?? []

  // Status distribution from real rows (prefers human-readable *_display).
  const statusField = items.some((i) => "status_display" in i) ? "status_display" : "status"
  const progress = tallyBy(items, statusField).slice(0, 3)
  const progressTotal = items.length || 1

  const pendingCount = items.filter((i) => PENDING_STATUSES.has(String(i.status ?? ""))).length
  const rejectedCount = items.filter((i) => String(i.status ?? "") === "rejected").length
  const notices: { title: string; detail: string; tone: "amber" | "rose" | "emerald" }[] = []
  if (rejectedCount > 0) {
    notices.push({ title: `${rejectedCount} record(s) rejected`, detail: `Follow up on rejected entries in ${config.tableTitle.toLowerCase()}.`, tone: "rose" })
  }
  if (pendingCount > 0) {
    notices.push({ title: `${pendingCount} record(s) pending`, detail: `Review open items in ${config.tableTitle.toLowerCase()}.`, tone: "amber" })
  }
  if (notices.length === 0 && !isLoading && items.length >= 0) {
    notices.push({ title: error ? "Could not load live data" : "Nothing needs attention", detail: error ? String(error) : `No open items found in ${config.tableTitle.toLowerCase()}.`, tone: error ? "rose" : "emerald" })
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/commercial-management" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Commercial Management
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
          {(isLoading && displayMetrics.length === 0
            ? [0, 1, 2, 3].map((i) => ({ label: `metric-${i}`, value: "—", note: "Loading…", trend: "neutral" as const }))
            : displayMetrics.length > 0 ? displayMetrics : [{ label: "Total records", value: String(items.length), note: isLoading ? "Loading…" : "From live data", trend: "neutral" as const }]
          ).map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Ship className="size-4 text-muted-foreground" />}
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
                    {isLoading && displayRows.length === 0 && (
                      <tr><td colSpan={config.columns.length} className="px-3 py-8 text-center text-xs text-muted-foreground">Loading…</td></tr>
                    )}
                    {!isLoading && displayRows.length === 0 && (
                      <tr><td colSpan={config.columns.length} className="px-3 py-8 text-center text-xs text-muted-foreground">No records yet.</td></tr>
                    )}
                    {displayRows.map((row, rowIndex) => (
                      <tr key={`${row[0]}-${rowIndex}`} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 whitespace-nowrap ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-amber-700`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>{displayRows.length} of {items.length} record(s)</span>
                <button className="flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => toast.info("Opening full register")}>View all <ArrowUpRight className="size-3" /></button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Ship className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
                <CardDescription>{config.sideDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                {progress.length === 0 && <p className="px-0 py-2 text-xs text-muted-foreground">No data yet.</p>}
                {progress.map((item) => (
                  <div key={item.value}>
                    <div className="mb-1.5 flex items-center justify-between text-xs"><span className="capitalize text-muted-foreground">{item.value.replace(/_/g, " ")}</span><span className="font-medium text-foreground">{item.count} · {Math.round((item.count / progressTotal) * 100)}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / progressTotal) * 100}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Commercial attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening commercial task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Commercial hub</p><p className="text-xs text-muted-foreground">All trade finance data syncs across modules.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
