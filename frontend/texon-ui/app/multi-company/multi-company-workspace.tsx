"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Building2 } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "group-company-multi-company"
  | "multi-currency-support"
  | "location-based-operations"
  | "inter-modules-integrated-system"

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
  "group-company-multi-company": {
    title: "Group Company & Multi-Company",
    eyebrow: "Company structure",
    description: "Manage group companies, subsidiaries, and inter-company relationships.",
    action: "Add company",
    metrics: [
      { label: "Total companies", value: "4", note: "Group entities", trend: "neutral" },
      { label: "Active subsidiaries", value: "3", note: "Operating", trend: "neutral" },
      { label: "Inter-co transactions", value: "24", note: "This month", trend: "up" },
      { label: "Consolidated revenue", value: "$12.4M", note: "YTD", trend: "up" },
    ],
    tableTitle: "Company register",
    tableDescription: "Group company entities.",
    columns: ["Company", "Type", "Location", "Revenue", "Employees", "Status"],
    rows: [
      ["Texon Group", "Parent", "Dhaka", "$8.4M", "1,248", "Active"],
      ["Texon Garments", "Subsidiary", "Chittagong", "$2.8M", "420", "Active"],
      ["Texon Fabrics", "Subsidiary", "Dhaka", "$1.2M", "186", "Active"],
      ["Texon Exports", "Subsidiary", "Dhaka", "$0", "24", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Revenue split",
    sideDescription: "Revenue by entity.",
    progress: [
      { label: "Texon Group", value: "$8.4M", percent: 68, tone: "bg-emerald-500" },
      { label: "Texon Garments", value: "$2.8M", percent: 23, tone: "bg-primary" },
      { label: "Others", value: "$1.2M", percent: 9, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Inter-co transactions pending", detail: "24 transactions awaiting reconciliation this month.", tone: "amber" }],
  },
  "multi-currency-support": {
    title: "Multi-Currency Support",
    eyebrow: "Currency management",
    description: "Manage multiple currencies with real-time exchange rates and currency conversion.",
    action: "Update rates",
    metrics: [
      { label: "Active currencies", value: "4", note: "USD, EUR, GBP, BDT", trend: "neutral" },
      { label: "Transactions today", value: "18", note: "Multi-currency", trend: "up" },
      { label: "FX gain/loss", value: "+$2,400", note: "This month", trend: "up" },
      { label: "Rate freshness", value: "2 hrs", note: "Last update", trend: "neutral" },
    ],
    tableTitle: "Currency register",
    tableDescription: "Active currencies and exchange rates.",
    columns: ["Currency", "Code", "Rate vs USD", "Last updated", "Transactions", "Trend"],
    rows: [
      ["US Dollar", "USD", "1.0000", "Live", "342", "Stable"],
      ["Euro", "EUR", "0.9240", "2 hrs ago", "86", "Up"],
      ["British Pound", "GBP", "0.7890", "2 hrs ago", "24", "Up"],
      ["Bangladeshi Taka", "BDT", "110.40", "2 hrs ago", "1,248", "Stable"],
    ],
    statusIndex: 5,
    sideTitle: "Transaction mix",
    sideDescription: "Transactions by currency.",
    progress: [
      { label: "USD", value: "342 txns", percent: 42, tone: "bg-emerald-500" },
      { label: "BDT", value: "386 txns", percent: 48, tone: "bg-primary" },
      { label: "EUR & GBP", value: "82 txns", percent: 10, tone: "bg-slate-400" },
    ],
    notices: [{ title: "EUR rate trending up", detail: "Euro strengthened 1.2% — review pending EUR receivables.", tone: "amber" }],
  },
  "location-based-operations": {
    title: "Location-Based Operations",
    eyebrow: "Multi-location",
    description: "Manage operations across multiple factory locations with location-specific dashboards.",
    action: "Add location",
    metrics: [
      { label: "Active locations", value: "3", note: "Factories", trend: "neutral" },
      { label: "Total capacity", value: "1,854", note: "Workers across sites", trend: "neutral" },
      { label: "Utilization", value: "78.4%", note: "Avg. across sites", trend: "up" },
      { label: "Output today", value: "12,400 pcs", note: "All locations", trend: "up" },
    ],
    tableTitle: "Location register",
    tableDescription: "Factory locations and capacity.",
    columns: ["Location", "Workers", "Lines", "Output", "Utilization", "Status"],
    rows: [
      ["Dhaka Plant", "1,248", "16", "8,400 pcs", "82%", "Active"],
      ["Chittagong Plant", "420", "6", "2,800 pcs", "74%", "Active"],
      ["Dhaka Unit B", "186", "4", "1,200 pcs", "72%", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Location output",
    sideDescription: "Output by location.",
    progress: [
      { label: "Dhaka Plant", value: "8,400 pcs", percent: 68, tone: "bg-emerald-500" },
      { label: "Chittagong", value: "2,800 pcs", percent: 23, tone: "bg-primary" },
      { label: "Unit B", value: "1,200 pcs", percent: 9, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Dhaka Unit B at 72% utilization", detail: "Below 75% target — review staffing levels.", tone: "amber" }],
  },
  "inter-modules-integrated-system": {
    title: "Inter-Modules Integrated System",
    eyebrow: "System integration",
    description: "Monitor data flow and integration status between all system modules.",
    action: "Check integration",
    metrics: [
      { label: "Active integrations", value: "24", note: "Module connections", trend: "neutral" },
      { label: "Data sync rate", value: "99.2%", note: "Uptime", trend: "up" },
      { label: "Pending sync", value: "2", note: "Queued updates", trend: "neutral" },
      { label: "API calls today", value: "12,400", note: "All modules", trend: "up" },
    ],
    tableTitle: "Integration register",
    tableDescription: "Module integrations and status.",
    columns: ["From", "To", "Type", "Last sync", "Calls", "Status"],
    rows: [
      ["Merchandising", "Production", "Real-time", "Live", "4,200", "Healthy"],
      ["Production", "Inventory", "Real-time", "Live", "3,600", "Healthy"],
      ["Inventory", "Accounts", "Batch (15m)", "5 min ago", "1,800", "Healthy"],
      ["HR", "Payroll", "Batch (daily)", "12 hrs ago", "240", "Delayed"],
    ],
    statusIndex: 5,
    sideTitle: "Integration health",
    sideDescription: "System health status.",
    progress: [
      { label: "Healthy", value: "22 integrations", percent: 92, tone: "bg-emerald-500" },
      { label: "Delayed", value: "2 integrations", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "HR→Payroll sync delayed", detail: "Daily batch job delayed 12 hours — check scheduler.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function MultiCompanyWorkspace({ module }: { module: ModuleKey }) {
  const config = configs[module]

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/multi-company" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Multi-Company / Multi-Location
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Building2 className="size-4 text-muted-foreground" />}
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
                <CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> System attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening system task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Integration hub</p><p className="text-xs text-muted-foreground">All company data syncs in real-time across locations.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
