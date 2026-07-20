"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Users } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "buyer-profile"
  | "buyer-communication-records"
  | "order-amendment-history"
  | "buyer-wise-profitability"

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
  "buyer-profile": {
    title: "Buyer Profile",
    eyebrow: "Buyer management",
    description: "Maintain comprehensive buyer profiles with contact details, preferences, and order history.",
    action: "Add buyer",
    metrics: [
      { label: "Total buyers", value: "48", note: "Active profiles", trend: "neutral" },
      { label: "New this month", value: "3", note: "Onboarded", trend: "up" },
      { label: "Active orders", value: "32", note: "Across all buyers", trend: "up" },
      { label: "Avg. order value", value: "$124K", note: "Per buyer", trend: "up" },
    ],
    tableTitle: "Buyer register",
    tableDescription: "Active buyer profiles and order history.",
    columns: ["Buyer", "Contact", "Country", "Orders", "Value", "Status"],
    rows: [
      ["H&M", "Anna Lindqvist", "Sweden", "24", "$3.2M", "Active"],
      ["Zara", "Carlos Mendez", "Spain", "18", "$2.8M", "Active"],
      ["Uniqlo", "Yuki Tanaka", "Japan", "14", "$1.6M", "Active"],
      ["Levi's", "Sarah Johnson", "USA", "8", "$920K", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Buyer distribution",
    sideDescription: "Buyers by region.",
    progress: [
      { label: "Europe", value: "18 buyers", percent: 38, tone: "bg-emerald-500" },
      { label: "Asia Pacific", value: "16 buyers", percent: 33, tone: "bg-primary" },
      { label: "Americas", value: "14 buyers", percent: 29, tone: "bg-slate-400" },
    ],
    notices: [{ title: "3 new buyers onboarded", detail: "Successfully added H&M Home, Zara Kids, and Uniqlo Sport profiles.", tone: "emerald" }],
  },
  "buyer-communication-records": {
    title: "Buyer Communication Records",
    eyebrow: "Communication log",
    description: "Track all communications with buyers including emails, calls, and meeting notes.",
    action: "Log communication",
    metrics: [
      { label: "Communications today", value: "12", note: "Across all buyers", trend: "up" },
      { label: "Pending responses", value: "4", note: "Awaiting reply", trend: "neutral" },
      { label: "Meeting scheduled", value: "2", note: "This week", trend: "neutral" },
      { label: "Response rate", value: "94.2%", note: "Within 24 hrs", trend: "up" },
    ],
    tableTitle: "Communication log",
    tableDescription: "Recent communications with buyers.",
    columns: ["Date", "Buyer", "Type", "Subject", "Owner", "Status"],
    rows: [
      ["14 Oct", "H&M", "Email", "PO-84920 shipment update", "M. Rahman", "Replied"],
      ["14 Oct", "Zara", "Call", "Quality concern on cargo pant", "S. Ahmed", "Pending"],
      ["13 Oct", "Uniqlo", "Meeting", "Q1 2025 planning", "F. Islam", "Completed"],
      ["13 Oct", "Levi's", "Email", "Sample approval request", "T. Hasan", "Replied"],
    ],
    statusIndex: 5,
    sideTitle: "Communication type",
    sideDescription: "Monthly communication breakdown.",
    progress: [
      { label: "Email", value: "120 msgs", percent: 55, tone: "bg-primary" },
      { label: "Call", value: "60 calls", percent: 28, tone: "bg-emerald-500" },
      { label: "Meeting", value: "36 meetings", percent: 17, tone: "bg-slate-400" },
    ],
    notices: [{ title: "4 responses pending", detail: "Zara quality concern and 3 other emails need response within 24 hrs.", tone: "amber" }],
  },
  "order-amendment-history": {
    title: "Order Amendment History",
    eyebrow: "Amendment tracking",
    description: "Track and manage order amendments including quantity changes, delivery shifts, and spec modifications.",
    action: "Log amendment",
    metrics: [
      { label: "Amendments this month", value: "14", note: "Across all orders", trend: "neutral" },
      { label: "Quantity changes", value: "8", note: "57% of amendments", trend: "neutral" },
      { label: "Delivery shifts", value: "4", note: "29% of amendments", trend: "down" },
      { label: "Avg. impact", value: "$12.4K", note: "Per amendment", trend: "neutral" },
    ],
    tableTitle: "Amendment register",
    tableDescription: "Order amendments and their impact.",
    columns: ["Amend #", "Order", "Buyer", "Type", "Impact", "Status"],
    rows: [
      ["AMD-2418", "PO-84920", "H&M", "Qty +2,400", "+$18.6K", "Approved"],
      ["AMD-2415", "PO-85107", "Zara", "Delivery +7 days", "Neutral", "Pending"],
      ["AMD-2412", "PO-85241", "Uniqlo", "Spec change", "+$8.2K", "Approved"],
      ["AMD-2408", "PO-85322", "Levi's", "Qty -800", "-$6.4K", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "Amendment type",
    sideDescription: "Monthly amendment breakdown.",
    progress: [
      { label: "Quantity change", value: "8 amendments", percent: 57, tone: "bg-primary" },
      { label: "Delivery shift", value: "4 amendments", percent: 29, tone: "bg-amber-500" },
      { label: "Spec change", value: "2 amendments", percent: 14, tone: "bg-slate-400" },
    ],
    notices: [{ title: "AMD-2415 pending approval", detail: "Zara delivery shift +7 days — awaiting buyer confirmation.", tone: "amber" }],
  },
  "buyer-wise-profitability": {
    title: "Buyer-wise Profitability",
    eyebrow: "Profitability analysis",
    description: "Analyze profitability by buyer with margin tracking, cost breakdown, and performance trends.",
    action: "View report",
    metrics: [
      { label: "Overall margin", value: "18.4%", note: "All buyers combined", trend: "up" },
      { label: "Best margin", value: "24.2%", note: "H&M", trend: "up" },
      { label: "Lowest margin", value: "11.8%", note: "Levi's", trend: "down" },
      { label: "Total revenue", value: "$8.4M", note: "YTD", trend: "up" },
    ],
    tableTitle: "Buyer profitability register",
    tableDescription: "Profitability analysis by buyer.",
    columns: ["Buyer", "Revenue", "Cost", "Margin", "Orders", "Trend"],
    rows: [
      ["H&M", "$3.2M", "$2.4M", "24.2%", "24", "Increasing"],
      ["Zara", "$2.8M", "$2.2M", "21.4%", "18", "Stable"],
      ["Uniqlo", "$1.6M", "$1.3M", "18.8%", "14", "Increasing"],
      ["Levi's", "$920K", "$812K", "11.8%", "8", "Decreasing"],
    ],
    statusIndex: 5,
    sideTitle: "Margin distribution",
    sideDescription: "Buyers by margin tier.",
    progress: [
      { label: "High margin (>20%)", value: "12 buyers", percent: 25, tone: "bg-emerald-500" },
      { label: "Medium margin (15–20%)", value: "24 buyers", percent: 50, tone: "bg-primary" },
      { label: "Low margin (<15%)", value: "12 buyers", percent: 25, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Levi's margin declining", detail: "11.8% margin — below 15% target. Review pricing with buyer.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function CRMWorkspace({ module, metrics, rows }: { module: ModuleKey; metrics?: WorkspaceConfig["metrics"]; rows?: WorkspaceConfig["rows"] }) {
  const config = configs[module]
  const resolvedMetrics = metrics ?? config.metrics
  const resolvedRows = rows ?? config.rows

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/crm" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> CRM
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
                  <TrendingUp className="size-4 text-muted-foreground" />
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
                <CardTitle className="flex items-center gap-2 text-base"><Users className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> CRM attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening CRM task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">CRM hub</p><p className="text-xs text-muted-foreground">All buyer data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
