"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, Banknote, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { tallyBy } from "@/lib/api/module-data"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

export const PENDING_STATUSES = new Set([
  "pending", "draft", "submitted", "under_review", "expected",
  "booked", "requested", "in_progress", "resubmitted",
])

type Metric = { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }

type ModuleKey =
  | "payable"
  | "receivable"
  | "supplier-bills"
  | "buyer-payments"
  | "cost-centers"
  | "profit-loss"
  | "bank-cash"
  | "expenses"
  | "reports"
  | "accounting"

type WorkspaceConfig = {
  title: string
  eyebrow: string
  description: string
  action: string
  tableTitle: string
  tableDescription: string
  columns: string[]
  statusIndex?: number
  status: string[]
  sideTitle: string
  sideDescription: string
}

const configs: Record<ModuleKey, WorkspaceConfig> = {
  payable: {
    title: "Accounts Payable",
    eyebrow: "Payables control",
    description: "Track supplier obligations, approvals, and upcoming disbursements.",
    action: "Record payable",
    tableTitle: "Open supplier obligations",
    tableDescription: "Prioritized by due date and approval state.",
    columns: ["Invoice", "Supplier", "Due date", "Amount", "Approval", "Status"],
    statusIndex: 5,
    status: ["Due soon", "Scheduled", "Review", "Open"],
    sideTitle: "Payment readiness",
    sideDescription: "This week’s proposed payment allocation.",
  },
  receivable: {
    title: "Accounts Receivable",
    eyebrow: "Collections overview",
    description: "Monitor buyer invoices, collection status, and aging exposure.",
    action: "Create invoice",
    tableTitle: "Buyer invoice register",
    tableDescription: "Collections are reconciled against shipment documentation.",
    columns: ["Invoice", "Buyer", "Shipment", "Due date", "Amount", "Status"],
    statusIndex: 5,
    status: ["Overdue", "Submitted", "Accepted", "In review"],
    sideTitle: "Receivable aging",
    sideDescription: "Outstanding balance by collection period.",
  },
  "supplier-bills": {
    title: "Supplier Bills",
    eyebrow: "Invoice processing",
    description: "Capture, validate, and route supplier bills for approval.",
    action: "Add supplier bill",
    tableTitle: "Recent supplier bills",
    tableDescription: "Match status checks purchase orders and goods receipts.",
    columns: ["Bill no.", "Supplier", "PO / GRN", "Received", "Amount", "Match status"],
    statusIndex: 5,
    status: ["Matched", "Needs GRN", "Price variance"],
    sideTitle: "Processing queue",
    sideDescription: "Bills currently moving through validation.",
  },
  "buyer-payments": {
    title: "Buyer Payments",
    eyebrow: "Inbound payments",
    description: "Reconcile buyer remittances, advances, and export proceeds.",
    action: "Record receipt",
    tableTitle: "Incoming payment register",
    tableDescription: "Receipts are linked to invoices and export documents.",
    columns: ["Receipt", "Buyer", "Bank reference", "Received", "Amount", "Allocation"],
    statusIndex: 5,
    status: ["Allocated", "Partially allocated", "Unapplied"],
    sideTitle: "Collection sources",
    sideDescription: "Current-month receipt mix by buyer.",
  },
  "cost-centers": {
    title: "Cost Center Tracking",
    eyebrow: "Operational spend",
    description: "Compare departmental spending against approved operating budgets.",
    action: "Add cost entry",
    tableTitle: "Cost center performance",
    tableDescription: "Month-to-date actuals compared with the approved budget.",
    columns: ["Cost center", "Owner", "Budget", "Actual", "Variance", "Status"],
    statusIndex: 5,
    status: ["On track", "Over plan", "Review"],
    sideTitle: "Spend by function",
    sideDescription: "Share of this month’s operational expenditure.",
  },
  "profit-loss": {
    title: "Order-wise Profit & Loss",
    eyebrow: "Order profitability",
    description: "Measure actual margin performance from costing through shipment.",
    action: "Create P&L view",
    tableTitle: "Active order profitability",
    tableDescription: "Projected contribution uses the latest material and production actuals.",
    columns: ["Order / buyer", "Revenue", "Actual cost", "Gross profit", "Margin", "Health"],
    statusIndex: 5,
    status: ["Healthy", "Watch", "At risk"],
    sideTitle: "Margin by order stage",
    sideDescription: "Where portfolio contribution is currently held.",
  },
  "bank-cash": {
    title: "Bank & Cash Management",
    eyebrow: "Liquidity position",
    description: "Maintain visibility over cash availability, bank accounts, and reconciliations.",
    action: "Record transaction",
    tableTitle: "Bank account position",
    tableDescription: "Balances are shown after the latest imported bank statement.",
    columns: ["Account", "Bank", "Book balance", "Bank balance", "Last reconciled", "Status"],
    statusIndex: 5,
    status: ["Reconciled", "Variance", "Count due"],
    sideTitle: "Liquidity allocation",
    sideDescription: "Available funds by purpose after committed payments.",
  },
  expenses: {
    title: "Expense Tracking",
    eyebrow: "Expense control",
    description: "Submit, approve, and analyze operational and travel expenses.",
    action: "Submit expense",
    tableTitle: "Recent expense reports",
    tableDescription: "Expense claims are grouped by submission and approval stage.",
    columns: ["Report", "Employee / center", "Category", "Submitted", "Amount", "Status"],
    statusIndex: 5,
    status: ["Pending approval", "Approved", "Reimbursed", "Policy review"],
    sideTitle: "Expense categories",
    sideDescription: "Month-to-date spend distribution.",
  },
  reports: {
    title: "Financial Reporting",
    eyebrow: "Reporting center",
    description: "Generate timely financial statements, schedules, and management packs.",
    action: "Create report",
    tableTitle: "Report library",
    tableDescription: "Standard reports with current period availability.",
    columns: ["Report", "Period", "Prepared by", "Last run", "Format", "Status"],
    statusIndex: 5,
    status: ["Ready", "Updated", "Review"],
    sideTitle: "Close checklist",
    sideDescription: "Progress toward October’s management reporting cycle.",
  },
  accounting: {
    title: "Integrated Financial Accounting",
    eyebrow: "General ledger",
    description: "Bring operational activity into a controlled, audit-ready financial ledger.",
    action: "New journal entry",
    tableTitle: "Latest journal activity",
    tableDescription: "Entries flow from payables, receivables, inventory, and manual journals.",
    columns: ["Journal", "Source", "Posting date", "Description", "Amount", "Status"],
    statusIndex: 5,
    status: ["Posted", "Draft"],
    sideTitle: "Posting controls",
    sideDescription: "Journal workflow status for the current period.",
  },
}

function statusClass(status: string) {
  if (/overdue|at risk|over plan|variance|policy review/i.test(status)) return "bg-rose-50 text-rose-700 border-rose-200"
  if (/review|pending|due soon|unapplied|needs|watch|count due/i.test(status)) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-emerald-50 text-emerald-700 border-emerald-200"
}

function noticeClass(tone: string) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function FinanceWorkspace({ module, metrics, rows, rawItems }: { module: ModuleKey; metrics?: Metric[]; rows?: string[][]; rawItems?: Record<string, unknown>[] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? []
  const resolvedRows = rows ?? []

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/accounts-finance" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Accounts &amp; Finance
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <WalletCards className="size-4 text-muted-foreground" />}
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
                    {resolvedRows !== undefined && resolvedRows.length === 0 && (
                      <tr><td colSpan={config.columns.length} className="px-3 py-8 text-center text-xs text-muted-foreground">No records yet.</td></tr>
                    )}
                    {resolvedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 whitespace-nowrap ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${statusClass(cell)}`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>{(resolvedRows ?? []).length} record(s)</span>
                <button className="flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => toast.info("Opening full register")}>View all <ArrowUpRight className="size-3" /></button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Banknote className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Finance attention</CardTitle>
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
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening finance task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Audit-ready activity</p><p className="text-xs text-muted-foreground">Every record retains its source and approval trail.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
