"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, Banknote, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, WalletCards } from "lucide-react"
import { toast } from "sonner"

export type ModuleKey =
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
  metrics: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]
  tableTitle: string
  tableDescription: string
  columns: string[]
  rows: string[][]
  statusIndex?: number
  status: string[]
  sideTitle: string
  sideDescription: string
  progress: { label: string; value: string; percent: number; tone: string }[]
  notices: { title: string; detail: string; tone: "amber" | "rose" | "emerald" }[]
}

const configs: Record<ModuleKey, WorkspaceConfig> = {
  payable: {
    title: "Accounts Payable",
    eyebrow: "Payables control",
    description: "Track supplier obligations, approvals, and upcoming disbursements.",
    action: "Record payable",
    metrics: [
      { label: "Outstanding payables", value: "$1.82M", note: "42 supplier invoices", trend: "neutral" },
      { label: "Due this week", value: "$428.6K", note: "8 payment runs", trend: "down" },
      { label: "Early-pay discounts", value: "$14.2K", note: "Available this month", trend: "up" },
      { label: "Overdue balance", value: "$68.4K", note: "3 invoices need review", trend: "down" },
    ],
    tableTitle: "Open supplier obligations",
    tableDescription: "Prioritized by due date and approval state.",
    columns: ["Invoice", "Supplier", "Due date", "Amount", "Approval", "Status"],
    rows: [
      ["AP-INV-4821", "Envoy Textiles", "18 Oct 2024", "$186,420", "Approved", "Due soon"],
      ["AP-INV-4816", "Coats Bangladesh", "20 Oct 2024", "$94,800", "Approved", "Scheduled"],
      ["AP-INV-4804", "Artistic Milliners", "22 Oct 2024", "$72,350", "Pending", "Review"],
      ["AP-INV-4798", "Pacific Accessories", "28 Oct 2024", "$54,980", "Approved", "Open"],
    ],
    statusIndex: 5,
    status: ["Due soon", "Scheduled", "Review", "Open"],
    sideTitle: "Payment readiness",
    sideDescription: "This week’s proposed payment allocation.",
    progress: [
      { label: "Approved for payment", value: "$312.8K", percent: 73, tone: "bg-emerald-500" },
      { label: "Awaiting approval", value: "$81.6K", percent: 19, tone: "bg-amber-500" },
      { label: "On hold", value: "$34.2K", percent: 8, tone: "bg-rose-500" },
    ],
    notices: [{ title: "3 invoices nearing due date", detail: "Review approval routing before Friday’s payment run.", tone: "amber" }],
  },
  receivable: {
    title: "Accounts Receivable",
    eyebrow: "Collections overview",
    description: "Monitor buyer invoices, collection status, and aging exposure.",
    action: "Create invoice",
    metrics: [
      { label: "Open receivables", value: "$2.46M", note: "36 buyer invoices", trend: "up" },
      { label: "Collected this month", value: "$1.18M", note: "92% of monthly plan", trend: "up" },
      { label: "Average DSO", value: "34 days", note: "2 days below target", trend: "up" },
      { label: "Past due", value: "$126.5K", note: "5 invoices require follow-up", trend: "down" },
    ],
    tableTitle: "Buyer invoice register",
    tableDescription: "Collections are reconciled against shipment documentation.",
    columns: ["Invoice", "Buyer", "Shipment", "Due date", "Amount", "Status"],
    rows: [
      ["AR-2024-1092", "H&M Group", "EXP-8241", "16 Oct 2024", "$428,600", "Overdue"],
      ["AR-2024-1095", "Zara (Inditex)", "EXP-8252", "23 Oct 2024", "$356,240", "Submitted"],
      ["AR-2024-1097", "Uniqlo", "EXP-8260", "30 Oct 2024", "$284,900", "Accepted"],
      ["AR-2024-1101", "Levi's", "EXP-8268", "05 Nov 2024", "$196,800", "In review"],
    ],
    statusIndex: 5,
    status: ["Overdue", "Submitted", "Accepted", "In review"],
    sideTitle: "Receivable aging",
    sideDescription: "Outstanding balance by collection period.",
    progress: [
      { label: "Current", value: "$1.71M", percent: 70, tone: "bg-primary" },
      { label: "1–30 days", value: "$624K", percent: 25, tone: "bg-amber-500" },
      { label: "Over 30 days", value: "$126.5K", percent: 5, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Collection follow-up due", detail: "H&M invoice AR-2024-1092 is 4 days past due.", tone: "rose" }],
  },
  "supplier-bills": {
    title: "Supplier Bills",
    eyebrow: "Invoice processing",
    description: "Capture, validate, and route supplier bills for approval.",
    action: "Add supplier bill",
    metrics: [
      { label: "Bills received", value: "128", note: "Current month", trend: "up" },
      { label: "Awaiting validation", value: "14", note: "Matching with GRN / PO", trend: "neutral" },
      { label: "Approved value", value: "$1.34M", note: "Ready for payment", trend: "up" },
      { label: "Disputed bills", value: "3", note: "$18.7K under review", trend: "down" },
    ],
    tableTitle: "Recent supplier bills",
    tableDescription: "Match status checks purchase orders and goods receipts.",
    columns: ["Bill no.", "Supplier", "PO / GRN", "Received", "Amount", "Match status"],
    rows: [
      ["BILL-4586", "Envoy Textiles", "PO-7753 / GRN-980", "14 Oct 2024", "$186,420", "Matched"],
      ["BILL-4582", "Coats Bangladesh", "PO-7748 / GRN-974", "13 Oct 2024", "$94,800", "Matched"],
      ["BILL-4579", "Star Zippers Ltd.", "PO-7739 / —", "12 Oct 2024", "$22,760", "Needs GRN"],
      ["BILL-4571", "Pacific Accessories", "PO-7724 / GRN-961", "10 Oct 2024", "$54,980", "Price variance"],
    ],
    statusIndex: 5,
    status: ["Matched", "Needs GRN", "Price variance"],
    sideTitle: "Processing queue",
    sideDescription: "Bills currently moving through validation.",
    progress: [
      { label: "Three-way matched", value: "86 bills", percent: 67, tone: "bg-emerald-500" },
      { label: "Pending GRN", value: "28 bills", percent: 22, tone: "bg-amber-500" },
      { label: "Exception review", value: "14 bills", percent: 11, tone: "bg-rose-500" },
    ],
    notices: [{ title: "2 price variances need approval", detail: "The combined variance exceeds the configured tolerance.", tone: "amber" }],
  },
  "buyer-payments": {
    title: "Buyer Payments",
    eyebrow: "Inbound payments",
    description: "Reconcile buyer remittances, advances, and export proceeds.",
    action: "Record receipt",
    metrics: [
      { label: "Received this month", value: "$1.18M", note: "18 remittances posted", trend: "up" },
      { label: "Unapplied receipts", value: "$92.4K", note: "4 records need allocation", trend: "neutral" },
      { label: "Advance balance", value: "$318.6K", note: "Across 6 active orders", trend: "up" },
      { label: "Bank charges", value: "$8.2K", note: "Month to date", trend: "down" },
    ],
    tableTitle: "Incoming payment register",
    tableDescription: "Receipts are linked to invoices and export documents.",
    columns: ["Receipt", "Buyer", "Bank reference", "Received", "Amount", "Allocation"],
    rows: [
      ["RCPT-241018", "H&M Group", "CITI-88451", "15 Oct 2024", "$428,600", "Allocated"],
      ["RCPT-241015", "Zara (Inditex)", "HSBC-67084", "14 Oct 2024", "$182,240", "Partially allocated"],
      ["RCPT-241012", "Uniqlo", "SCB-44091", "12 Oct 2024", "$265,900", "Allocated"],
      ["RCPT-241008", "Levi's", "CITI-88130", "10 Oct 2024", "$92,400", "Unapplied"],
    ],
    statusIndex: 5,
    status: ["Allocated", "Partially allocated", "Unapplied"],
    sideTitle: "Collection sources",
    sideDescription: "Current-month receipt mix by buyer.",
    progress: [
      { label: "H&M Group", value: "$428.6K", percent: 36, tone: "bg-primary" },
      { label: "Uniqlo", value: "$265.9K", percent: 23, tone: "bg-emerald-500" },
      { label: "Other buyers", value: "$485.5K", percent: 41, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Unapplied receipt detected", detail: "Levi’s payment RCPT-241008 has no invoice reference.", tone: "amber" }],
  },
  "cost-centers": {
    title: "Cost Center Tracking",
    eyebrow: "Operational spend",
    description: "Compare departmental spending against approved operating budgets.",
    action: "Add cost entry",
    metrics: [
      { label: "Budget utilization", value: "72.4%", note: "$4.82M of annual budget", trend: "neutral" },
      { label: "This month spend", value: "$438.2K", note: "6.8% below budget", trend: "up" },
      { label: "Centers over plan", value: "2", note: "Need variance review", trend: "down" },
      { label: "Savings realized", value: "$64.8K", note: "Versus operating plan", trend: "up" },
    ],
    tableTitle: "Cost center performance",
    tableDescription: "Month-to-date actuals compared with the approved budget.",
    columns: ["Cost center", "Owner", "Budget", "Actual", "Variance", "Status"],
    rows: [
      ["CC-101 · Production", "M. Rahman", "$186,000", "$173,420", "-$12,580", "On track"],
      ["CC-204 · Washing", "S. Ahmed", "$74,500", "$81,260", "+$6,760", "Over plan"],
      ["CC-309 · Quality", "F. Islam", "$42,800", "$39,820", "-$2,980", "On track"],
      ["CC-412 · Logistics", "T. Hasan", "$58,000", "$61,750", "+$3,750", "Review"],
    ],
    statusIndex: 5,
    status: ["On track", "Over plan", "Review"],
    sideTitle: "Spend by function",
    sideDescription: "Share of this month’s operational expenditure.",
    progress: [
      { label: "Production", value: "39%", percent: 39, tone: "bg-primary" },
      { label: "Materials & sourcing", value: "28%", percent: 28, tone: "bg-emerald-500" },
      { label: "Support functions", value: "33%", percent: 33, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Washing exceeded budget", detail: "Utility costs are 9.1% above the monthly plan.", tone: "rose" }],
  },
  "profit-loss": {
    title: "Order-wise Profit & Loss",
    eyebrow: "Order profitability",
    description: "Measure actual margin performance from costing through shipment.",
    action: "Create P&L view",
    metrics: [
      { label: "Average gross margin", value: "16.8%", note: "Across 24 active orders", trend: "up" },
      { label: "Projected contribution", value: "$842.6K", note: "Current order portfolio", trend: "up" },
      { label: "Orders below target", value: "4", note: "Target margin is 15%", trend: "down" },
      { label: "Cost variance", value: "-1.4%", note: "Below approved costing", trend: "up" },
    ],
    tableTitle: "Active order profitability",
    tableDescription: "Projected contribution uses the latest material and production actuals.",
    columns: ["Order / buyer", "Revenue", "Actual cost", "Gross profit", "Margin", "Health"],
    rows: [
      ["PO-84920 · H&M", "$842,000", "$703,140", "$138,860", "16.5%", "Healthy"],
      ["PO-85107 · Zara", "$615,600", "$534,860", "$80,740", "13.1%", "Watch"],
      ["PO-85241 · Uniqlo", "$728,400", "$593,620", "$134,780", "18.5%", "Healthy"],
      ["PO-85322 · Levi's", "$396,000", "$346,500", "$49,500", "12.5%", "At risk"],
    ],
    statusIndex: 5,
    status: ["Healthy", "Watch", "At risk"],
    sideTitle: "Margin by order stage",
    sideDescription: "Where portfolio contribution is currently held.",
    progress: [
      { label: "In production", value: "$392K", percent: 47, tone: "bg-primary" },
      { label: "Ready to ship", value: "$284K", percent: 34, tone: "bg-emerald-500" },
      { label: "Costing review", value: "$167K", percent: 19, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Margin alert on PO-85322", detail: "Washing cost variance has lowered the projected margin by 2.8 points.", tone: "rose" }],
  },
  "bank-cash": {
    title: "Bank & Cash Management",
    eyebrow: "Liquidity position",
    description: "Maintain visibility over cash availability, bank accounts, and reconciliations.",
    action: "Record transaction",
    metrics: [
      { label: "Available cash", value: "$786.4K", note: "Across 5 active accounts", trend: "up" },
      { label: "Inflow this month", value: "$1.31M", note: "Buyer receipts and advances", trend: "up" },
      { label: "Outflow this month", value: "$982.6K", note: "Supplier and operating payments", trend: "down" },
      { label: "Unreconciled items", value: "9", note: "$47.3K needs matching", trend: "neutral" },
    ],
    tableTitle: "Bank account position",
    tableDescription: "Balances are shown after the latest imported bank statement.",
    columns: ["Account", "Bank", "Book balance", "Bank balance", "Last reconciled", "Status"],
    rows: [
      ["Operating USD", "Citibank", "$428,640", "$428,640", "15 Oct 2024", "Reconciled"],
      ["Export proceeds", "HSBC", "$214,880", "$208,420", "14 Oct 2024", "Variance"],
      ["Payroll BDT", "Standard Chartered", "$96,320", "$96,320", "15 Oct 2024", "Reconciled"],
      ["Petty cash", "Factory cash", "$46,560", "$43,260", "11 Oct 2024", "Count due"],
    ],
    statusIndex: 5,
    status: ["Reconciled", "Variance", "Count due"],
    sideTitle: "Liquidity allocation",
    sideDescription: "Available funds by purpose after committed payments.",
    progress: [
      { label: "Operating cash", value: "$428.6K", percent: 55, tone: "bg-primary" },
      { label: "Committed payments", value: "$246.8K", percent: 31, tone: "bg-amber-500" },
      { label: "Reserve", value: "$111K", percent: 14, tone: "bg-emerald-500" },
    ],
    notices: [{ title: "HSBC account has a variance", detail: "Two export charges need to be matched to the bank statement.", tone: "amber" }],
  },
  expenses: {
    title: "Expense Tracking",
    eyebrow: "Expense control",
    description: "Submit, approve, and analyze operational and travel expenses.",
    action: "Submit expense",
    metrics: [
      { label: "Expenses this month", value: "$164.8K", note: "428 approved claims", trend: "neutral" },
      { label: "Awaiting approval", value: "$18.6K", note: "34 expense reports", trend: "neutral" },
      { label: "Policy exceptions", value: "7", note: "$3.2K requires review", trend: "down" },
      { label: "Reimbursed", value: "$142.4K", note: "This month to date", trend: "up" },
    ],
    tableTitle: "Recent expense reports",
    tableDescription: "Expense claims are grouped by submission and approval stage.",
    columns: ["Report", "Employee / center", "Category", "Submitted", "Amount", "Status"],
    rows: [
      ["EXP-8452", "N. Chowdhury · Merchandising", "Buyer visit", "15 Oct 2024", "$1,840", "Pending approval"],
      ["EXP-8448", "S. Ahmed · Washing", "Utilities", "14 Oct 2024", "$6,280", "Approved"],
      ["EXP-8439", "M. Rahman · Production", "Maintenance", "13 Oct 2024", "$4,960", "Reimbursed"],
      ["EXP-8426", "F. Islam · Quality", "Testing", "11 Oct 2024", "$2,180", "Policy review"],
    ],
    statusIndex: 5,
    status: ["Pending approval", "Approved", "Reimbursed", "Policy review"],
    sideTitle: "Expense categories",
    sideDescription: "Month-to-date spend distribution.",
    progress: [
      { label: "Utilities & maintenance", value: "$88.2K", percent: 54, tone: "bg-primary" },
      { label: "Logistics & travel", value: "$43.6K", percent: 26, tone: "bg-emerald-500" },
      { label: "Admin & other", value: "$33K", percent: 20, tone: "bg-slate-400" },
    ],
    notices: [{ title: "7 policy exceptions awaiting review", detail: "The largest exception is above the travel per-diem threshold.", tone: "amber" }],
  },
  reports: {
    title: "Financial Reporting",
    eyebrow: "Reporting center",
    description: "Generate timely financial statements, schedules, and management packs.",
    action: "Create report",
    metrics: [
      { label: "Period close", value: "78%", note: "October close checklist", trend: "up" },
      { label: "Reports scheduled", value: "12", note: "Next 7 days", trend: "neutral" },
      { label: "Data freshness", value: "Today", note: "Last ledger sync 09:42", trend: "up" },
      { label: "Review items", value: "6", note: "Before management pack", trend: "down" },
    ],
    tableTitle: "Report library",
    tableDescription: "Standard reports with current period availability.",
    columns: ["Report", "Period", "Prepared by", "Last run", "Format", "Status"],
    rows: [
      ["Income statement", "Oct 2024 MTD", "Finance team", "15 Oct, 09:42", "PDF / XLSX", "Ready"],
      ["Balance sheet", "Sep 2024", "Finance team", "01 Oct, 11:20", "PDF / XLSX", "Ready"],
      ["Cash flow forecast", "13-week rolling", "Treasury", "15 Oct, 08:30", "XLSX", "Updated"],
      ["AR aging", "Oct 2024", "Collections", "14 Oct, 17:05", "PDF / XLSX", "Review"],
    ],
    statusIndex: 5,
    status: ["Ready", "Updated", "Review"],
    sideTitle: "Close checklist",
    sideDescription: "Progress toward October’s management reporting cycle.",
    progress: [
      { label: "Sub-ledgers closed", value: "8 / 9", percent: 89, tone: "bg-emerald-500" },
      { label: "Journal review", value: "26 / 34", percent: 76, tone: "bg-primary" },
      { label: "Management pack", value: "4 / 8", percent: 50, tone: "bg-amber-500" },
    ],
    notices: [{ title: "October close has 6 open items", detail: "Complete bank reconciliation before finalizing the cash flow report.", tone: "amber" }],
  },
  accounting: {
    title: "Integrated Financial Accounting",
    eyebrow: "General ledger",
    description: "Bring operational activity into a controlled, audit-ready financial ledger.",
    action: "New journal entry",
    metrics: [
      { label: "Ledger balance", value: "$8.64M", note: "Current asset position", trend: "up" },
      { label: "Posted journals", value: "1,284", note: "Current month", trend: "up" },
      { label: "Draft journals", value: "18", note: "Awaiting posting", trend: "neutral" },
      { label: "Control exceptions", value: "2", note: "Need finance review", trend: "down" },
    ],
    tableTitle: "Latest journal activity",
    tableDescription: "Entries flow from payables, receivables, inventory, and manual journals.",
    columns: ["Journal", "Source", "Posting date", "Description", "Amount", "Status"],
    rows: [
      ["JV-10284", "Accounts payable", "15 Oct 2024", "Supplier bill accrual", "$186,420", "Posted"],
      ["JV-10283", "Buyer payment", "15 Oct 2024", "H&M receipt allocation", "$428,600", "Posted"],
      ["JV-10282", "Inventory", "14 Oct 2024", "Fabric consumption issue", "$74,280", "Posted"],
      ["JV-10281", "Manual journal", "14 Oct 2024", "Utility accrual adjustment", "$12,640", "Draft"],
    ],
    statusIndex: 5,
    status: ["Posted", "Draft"],
    sideTitle: "Posting controls",
    sideDescription: "Journal workflow status for the current period.",
    progress: [
      { label: "Posted automatically", value: "1,188 journals", percent: 93, tone: "bg-emerald-500" },
      { label: "Awaiting review", value: "78 journals", percent: 6, tone: "bg-amber-500" },
      { label: "Exception queue", value: "18 journals", percent: 1, tone: "bg-rose-500" },
    ],
    notices: [{ title: "2 control exceptions identified", detail: "Manual journals above the authorization threshold require a secondary approval.", tone: "rose" }],
  },
}

function statusClass(status: string) {
  if (/overdue|at risk|over plan|variance|policy review/i.test(status)) return "bg-rose-50 text-rose-700 border-rose-200"
  if (/review|pending|due soon|unapplied|needs|watch|count due/i.test(status)) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-emerald-50 text-emerald-700 border-emerald-200"
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function FinanceWorkspace({ module, metrics, rows }: { module: ModuleKey; metrics?: WorkspaceConfig["metrics"]; rows?: WorkspaceConfig["rows"] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? config.metrics
  const resolvedRows = rows ?? config.rows

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
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {resolvedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-medium" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(cell)}`}>{cell}</span> : cell}
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
                <CardTitle className="flex items-center gap-2 text-base"><Banknote className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Finance attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening finance task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Audit-ready activity</p><p className="text-xs text-muted-foreground">Every record retains its source and approval trail.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
