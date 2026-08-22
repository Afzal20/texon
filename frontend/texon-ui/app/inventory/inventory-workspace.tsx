"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Package } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "fabric-inventory"
  | "accessories-inventory"
  | "trims-inventory"
  | "physical-inventory-with-pi-booking"
  | "shade-approval-distribution"
  | "fabric-inspection"
  | "rm-issue-against-approved-requisition"
  | "gate-pass-challan-prepare-printing"
  | "leftover-declarations-after-style-lot-close"
  | "re-booking-or-po-for-remaining-quantity"
  | "rm-transfer-style-lot-store-to-style-lot-store"
  | "local-purchase"
  | "receiving-returning-rm-to-from-supplier"
  | "damaged-rejected-goods-receiving"
  | "low-stock-alerts"
  | "opening-closing-stock-tracking"
  | "wastage-tracking"

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
  "fabric-inventory": {
    title: "Fabric Inventory",
    eyebrow: "Fabric stock",
    description: "Track fabric inventory levels, usage, and replenishment across all warehouses.",
    action: "Log fabric receipt",
    tableTitle: "Fabric inventory register",
    tableDescription: "Current fabric stock by type and color.",
    columns: ["Fabric", "Color", "Rolls", "Meters", "Warehouse", "Status"],
    statusIndex: 5,
    sideTitle: "Stock distribution",
    sideDescription: "Fabric stock by warehouse.",
  },
  "accessories-inventory": {
    title: "Accessories Inventory",
    eyebrow: "Accessories stock",
    description: "Manage accessories inventory including buttons, zippers, labels, and packaging materials.",
    action: "Log receipt",
    tableTitle: "Accessories stock register",
    tableDescription: "Current accessories inventory by category.",
    columns: ["Item", "Category", "In stock", "Unit", "Reorder pt", "Status"],
    statusIndex: 5,
    sideTitle: "Category breakdown",
    sideDescription: "Accessories by category.",
  },
  "trims-inventory": {
    title: "Trims Inventory",
    eyebrow: "Trims stock",
    description: "Track trims inventory including threads, elastics, cords, and bias binding.",
    action: "Log trims receipt",
    tableTitle: "Trims inventory register",
    tableDescription: "Current trims stock by type.",
    columns: ["Trim", "Type", "In stock", "Unit", "Reorder pt", "Status"],
    statusIndex: 5,
    sideTitle: "Trims status",
    sideDescription: "Trims stock by category.",
  },
  "physical-inventory-with-pi-booking": {
    title: "Physical Inventory with PI/Booking",
    eyebrow: "PI tracking",
    description: "Manage physical inventory counts with PI reference and booking reconciliation.",
    action: "Start count",
    tableTitle: "PI count register",
    tableDescription: "Physical inventory count results with booking status.",
    columns: ["PI #", "Location", "Date", "Variance", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Count accuracy",
    sideDescription: "Monthly PI accuracy.",
  },
  "shade-approval-distribution": {
    title: "Shade Approval & Distribution",
    eyebrow: "Shade management",
    description: "Manage fabric shade approval and distribution to production lines.",
    action: "Log shade approval",
    tableTitle: "Shade approval tracker",
    tableDescription: "Shade approval and distribution status.",
    columns: ["Shade #", "Fabric", "Order", "Buyer", "Result", "Status"],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Shade approval status.",
  },
  "fabric-inspection": {
    title: "Fabric Inspection",
    eyebrow: "Inspection tracking",
    description: "Track fabric inspection results including defect grading and supplier quality.",
    action: "Log inspection",
    tableTitle: "Fabric inspection log",
    tableDescription: "Inspection results by fabric lot.",
    columns: ["Lot #", "Fabric", "Supplier", "Rolls", "Grade", "Status"],
    statusIndex: 5,
    sideTitle: "Inspection results",
    sideDescription: "Monthly inspection outcomes.",
  },
  "rm-issue-against-approved-requisition": {
    title: "RM Issue Against Approved Requisition",
    eyebrow: "RM issuance",
    description: "Issue raw materials from store against approved requisitions from production.",
    action: "Issue RM",
    tableTitle: "RM issuance register",
    tableDescription: "Raw material issues against approved requisitions.",
    columns: ["Issue #", "Requisition", "Material", "Qty", "Line", "Status"],
    statusIndex: 5,
    sideTitle: "Issue status",
    sideDescription: "Today's RM issuance.",
  },
  "gate-pass-challan-prepare-printing": {
    title: "Gate Pass, Challan Prepare & Printing",
    eyebrow: "Gate pass & challan",
    description: "Prepare and print gate passes and challans for material movement in and out of the factory.",
    action: "Create gate pass",
    tableTitle: "Gate pass & challan register",
    tableDescription: "Material movement documentation.",
    columns: ["GP #", "Type", "Material", "Qty", "Destination", "Status"],
    statusIndex: 5,
    sideTitle: "Movement type",
    sideDescription: "Today's gate pass types.",
  },
  "leftover-declarations-after-style-lot-close": {
    title: "Leftover Declarations After Style/Lot Close",
    eyebrow: "Leftover declarations",
    description: "Declare and manage leftover materials after style or lot closure for reconciliation.",
    action: "Declare leftover",
    tableTitle: "Leftover declaration register",
    tableDescription: "Leftover material declarations after style/lot close.",
    columns: ["Decl #", "Style", "Material", "Qty", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Declaration status",
    sideDescription: "Monthly leftover declarations.",
  },
  "re-booking-or-po-for-remaining-quantity": {
    title: "Re-booking or PO for Remaining Quantity",
    eyebrow: "Re-booking",
    description: "Manage re-bookings and purchase orders for remaining quantities after partial consumption.",
    action: "Create re-booking",
    tableTitle: "Re-booking register",
    tableDescription: "Re-bookings and POs for remaining quantities.",
    columns: ["RB #", "Original PO", "Material", "Qty", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Re-booking status",
    sideDescription: "Current re-booking pipeline.",
  },
  "rm-transfer-style-lot-store-to-style-lot-store": {
    title: "RM Transfer (Style/Lot/Store to Style/Lot/Store)",
    eyebrow: "RM transfer",
    description: "Track raw material transfers between style, lot, and store locations.",
    action: "New transfer",
    tableTitle: "RM transfer register",
    tableDescription: "Raw material transfers between locations.",
    columns: ["Transfer #", "Material", "From", "To", "Qty", "Status"],
    statusIndex: 5,
    sideTitle: "Transfer status",
    sideDescription: "Today's RM transfers.",
  },
  "local-purchase": {
    title: "Local Purchase",
    eyebrow: "Local procurement",
    description: "Manage local purchase orders for urgent material requirements from local suppliers.",
    action: "Create PO",
    tableTitle: "Local purchase register",
    tableDescription: "Local purchase orders and delivery status.",
    columns: ["PO #", "Supplier", "Material", "Qty", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Delivery status",
    sideDescription: "Local PO delivery pipeline.",
  },
  "receiving-returning-rm-to-from-supplier": {
    title: "Receiving/Returning RM to/from Supplier",
    eyebrow: "RM receiving",
    description: "Manage receiving of raw materials from suppliers and returns for quality issues.",
    action: "Log receipt",
    tableTitle: "RM receipt & return register",
    tableDescription: "Raw material receipts and returns from suppliers.",
    columns: ["Ref #", "Type", "Supplier", "Material", "Qty", "Status"],
    statusIndex: 5,
    sideTitle: "Receipt vs return",
    sideDescription: "Today's RM movements.",
  },
  "damaged-rejected-goods-receiving": {
    title: "Damaged/Rejected Goods Receiving",
    eyebrow: "Damaged goods",
    description: "Track receiving and handling of damaged or rejected goods from production and suppliers.",
    action: "Log damaged goods",
    tableTitle: "Damaged goods register",
    tableDescription: "Damaged and rejected goods with disposition status.",
    columns: ["Ref #", "Source", "Material", "Qty", "Value", "Status"],
    statusIndex: 5,
    sideTitle: "Disposition status",
    sideDescription: "Damaged goods handling.",
  },
  "low-stock-alerts": {
    title: "Low-Stock Alerts",
    eyebrow: "Stock alerts",
    description: "Monitor and manage low-stock alerts across all inventory categories.",
    action: "Acknowledge alert",
    tableTitle: "Low-stock alert register",
    tableDescription: "Active low-stock alerts across inventory.",
    columns: ["Alert #", "Item", "Category", "Current", "Reorder pt", "Severity"],
    statusIndex: 5,
    sideTitle: "Alert severity",
    sideDescription: "Active alerts by severity.",
  },
  "opening-closing-stock-tracking": {
    title: "Opening/Closing Stock Tracking",
    eyebrow: "Stock tracking",
    description: "Track opening and closing stock balances for inventory reconciliation and reporting.",
    action: "Log closing stock",
    tableTitle: "Stock balance register",
    tableDescription: "Opening and closing stock by category.",
    columns: ["Category", "Opening", "Received", "Issued", "Closing", "Variance"],
    statusIndex: 5,
    sideTitle: "Stock movement",
    sideDescription: "Monthly stock movement.",
  },
  "wastage-tracking": {
    title: "Wastage Tracking",
    eyebrow: "Wastage monitor",
    description: "Track and analyze material wastage across production processes for cost control.",
    action: "Log wastage",
    tableTitle: "Wastage register",
    tableDescription: "Material wastage by process and type.",
    columns: ["Entry #", "Process", "Material", "Qty", "Type", "Status"],
    statusIndex: 5,
    sideTitle: "Wastage by process",
    sideDescription: "Monthly wastage breakdown.",
  },
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function InventoryWorkspace({ 
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
            <a href="/inventory" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Inventory / Store
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
                <CardTitle className="flex items-center gap-2 text-base"><Package className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Inventory attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening inventory task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Inventory hub</p><p className="text-xs text-muted-foreground">All stock data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
