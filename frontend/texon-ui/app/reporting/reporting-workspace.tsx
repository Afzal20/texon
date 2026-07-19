"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, BarChart3 } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "mis-reporting"
  | "management-dashboards"
  | "all-reports-export-to-excel-pdf"
  | "order-wise-profitability"
  | "style-wise-profitability"
  | "production-efficiency-reports"

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
  "mis-reporting": {
    title: "MIS Reporting",
    eyebrow: "MIS reports",
    description: "Generate management information system reports for operational and financial oversight.",
    action: "Generate report",
    metrics: [
      { label: "Reports generated", value: "48", note: "This month", trend: "up" },
      { label: "Scheduled reports", value: "12", note: "Automated", trend: "neutral" },
      { label: "Ad-hoc requests", value: "8", note: "This week", trend: "neutral" },
      { label: "Report accuracy", value: "99.4%", note: "Data validation", trend: "up" },
    ],
    tableTitle: "MIS report register",
    tableDescription: "Recent MIS reports generated.",
    columns: ["Report", "Type", "Period", "Generated", "Owner", "Status"],
    rows: [
      ["Daily Production Summary", "Operational", "Daily", "14 Oct", "IE Team", "Generated"],
      ["Weekly Financial Pack", "Financial", "Weekly", "13 Oct", "Finance", "Generated"],
      ["Monthly HR Report", "HR", "Monthly", "01 Oct", "HR Team", "Generated"],
      ["Inventory Status Report", "Inventory", "Weekly", "13 Oct", "Stores", "Generated"],
    ],
    statusIndex: 5,
    sideTitle: "Report category",
    sideDescription: "Reports by category.",
    progress: [
      { label: "Operational", value: "24 reports", percent: 50, tone: "bg-emerald-500" },
      { label: "Financial", value: "12 reports", percent: 25, tone: "bg-primary" },
      { label: "HR & Inventory", value: "12 reports", percent: 25, tone: "bg-slate-400" },
    ],
    notices: [{ title: "48 reports generated", detail: "All scheduled reports completed successfully this month.", tone: "emerald" }],
  },
  "management-dashboards": {
    title: "Management Dashboards",
    eyebrow: "Dashboards",
    description: "Real-time dashboards with KPIs, trends, and drill-down analytics for management.",
    action: "Customize dashboard",
    metrics: [
      { label: "Active dashboards", value: "8", note: "Live dashboards", trend: "neutral" },
      { label: "KPIs tracked", value: "42", note: "Across all modules", trend: "neutral" },
      { label: "Users active", value: "24", note: "Viewing dashboards", trend: "up" },
      { label: "Data freshness", value: "Live", note: "Real-time sync", trend: "up" },
    ],
    tableTitle: "Dashboard register",
    tableDescription: "Available management dashboards.",
    columns: ["Dashboard", "Owner", "KPIs", "Last viewed", "Users", "Status"],
    rows: [
      ["Production Overview", "COO", "12", "Live", "8", "Active"],
      ["Financial Summary", "CFO", "8", "Live", "4", "Active"],
      ["Sales Pipeline", "CSO", "6", "Live", "6", "Active"],
      ["HR & Workforce", "HR Dir.", "10", "2 hrs ago", "4", "Active"],
    ],
    statusIndex: 5,
    sideTitle: "Dashboard usage",
    sideDescription: "Most viewed dashboards.",
    progress: [
      { label: "Production", value: "8 users", percent: 33, tone: "bg-emerald-500" },
      { label: "Financial", value: "6 users", percent: 25, tone: "bg-primary" },
      { label: "Sales & HR", value: "10 users", percent: 42, tone: "bg-slate-400" },
    ],
    notices: [{ title: "8 dashboards active", detail: "All dashboards running with live data feeds.", tone: "emerald" }],
  },
  "all-reports-export-to-excel-pdf": {
    title: "All Reports Export to Excel & PDF",
    eyebrow: "Report export",
    description: "Export any report to Excel or PDF format with formatting and branding options.",
    action: "Export report",
    metrics: [
      { label: "Exports this month", value: "86", note: "Excel & PDF", trend: "up" },
      { label: "Excel exports", value: "62", note: "72% of total", trend: "up" },
      { label: "PDF exports", value: "24", note: "28% of total", trend: "neutral" },
      { label: "Avg. file size", value: "2.4 MB", note: "Per export", trend: "neutral" },
    ],
    tableTitle: "Export register",
    tableDescription: "Recent report exports.",
    columns: ["Report", "Format", "User", "Size", "Date", "Status"],
    rows: [
      ["Production Summary", "Excel", "M. Rahman", "1.8 MB", "14 Oct", "Complete"],
      ["Financial Pack", "PDF", "CFO Office", "3.2 MB", "13 Oct", "Complete"],
      ["Inventory Status", "Excel", "Stores", "2.1 MB", "13 Oct", "Complete"],
      ["HR Report", "PDF", "HR Team", "1.6 MB", "01 Oct", "Complete"],
    ],
    statusIndex: 5,
    sideTitle: "Export format",
    sideDescription: "Monthly export breakdown.",
    progress: [
      { label: "Excel", value: "62 exports", percent: 72, tone: "bg-emerald-500" },
      { label: "PDF", value: "24 exports", percent: 28, tone: "bg-primary" },
    ],
    notices: [{ title: "86 exports completed", detail: "All exports generated successfully.", tone: "emerald" }],
  },
  "order-wise-profitability": {
    title: "Order-Wise Profitability",
    eyebrow: "Order P&L",
    description: "Track profitability at the order level with revenue, cost, and margin analysis.",
    action: "View report",
    metrics: [
      { label: "Orders tracked", value: "48", note: "Active orders", trend: "neutral" },
      { label: "Avg. margin", value: "16.8%", note: "All orders", trend: "up" },
      { label: "Profitable orders", value: "42", note: "87.5%", trend: "up" },
      { label: "Loss-making", value: "6", note: "12.5%", trend: "down" },
    ],
    tableTitle: "Order profitability register",
    tableDescription: "Order-level P&L analysis.",
    columns: ["Order", "Buyer", "Revenue", "Cost", "Margin", "Status"],
    rows: [
      ["PO-84920", "H&M", "$428K", "$356K", "16.8%", "Profitable"],
      ["PO-85107", "Zara", "$356K", "$284K", "20.2%", "Profitable"],
      ["PO-85241", "Uniqlo", "$284K", "$248K", "12.7%", "Profitable"],
      ["PO-85322", "Levi's", "$196K", "$184K", "6.1%", "At risk"],
    ],
    statusIndex: 5,
    sideTitle: "Margin distribution",
    sideDescription: "Orders by margin tier.",
    progress: [
      { label: "High margin (>15%)", value: "18 orders", percent: 38, tone: "bg-emerald-500" },
      { label: "Medium (10–15%)", value: "16 orders", percent: 33, tone: "bg-primary" },
      { label: "Low (<10%)", value: "14 orders", percent: 29, tone: "bg-amber-500" },
    ],
    notices: [{ title: "PO-85322 at risk", detail: "Levi's jacket only 6.1% margin — review cost structure.", tone: "amber" }],
  },
  "style-wise-profitability": {
    title: "Style-Wise Profitability",
    eyebrow: "Style P&L",
    description: "Analyze profitability by style with BOM cost, CM, and margin breakdown.",
    action: "View report",
    metrics: [
      { label: "Styles tracked", value: "24", note: "Active styles", trend: "neutral" },
      { label: "Avg. margin", value: "18.2%", note: "All styles", trend: "up" },
      { label: "Best margin", value: "24.6%", note: "Relaxed Oxford", trend: "up" },
      { label: "Worst margin", value: "8.4%", note: "Denim Jacket", trend: "down" },
    ],
    tableTitle: "Style profitability register",
    tableDescription: "Style-level P&L analysis.",
    columns: ["Style", "Orders", "Revenue", "Cost", "Margin", "Trend"],
    rows: [
      ["Relaxed Oxford", "8", "$1.2M", "$904K", "24.6%", "Increasing"],
      ["Stretch Cargo", "6", "$860K", "$688K", "20.0%", "Stable"],
      ["Ribbed Tank", "4", "$480K", "$412K", "14.2%", "Stable"],
      ["Denim Jacket", "4", "$320K", "$293K", "8.4%", "Decreasing"],
    ],
    statusIndex: 5,
    sideTitle: "Style margins",
    sideDescription: "Styles by margin tier.",
    progress: [
      { label: "High margin (>20%)", value: "8 styles", percent: 33, tone: "bg-emerald-500" },
      { label: "Medium (15–20%)", value: "8 styles", percent: 33, tone: "bg-primary" },
      { label: "Low (<15%)", value: "8 styles", percent: 33, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Denim Jacket margin declining", detail: "8.4% margin — below 15% target. Review BOM costs.", tone: "amber" }],
  },
  "production-efficiency-reports": {
    title: "Production Efficiency Reports",
    eyebrow: "Efficiency reports",
    description: "Track production efficiency with line-wise, order-wise, and operator-wise analysis.",
    action: "View report",
    metrics: [
      { label: "Overall efficiency", value: "78.4%", note: "All lines", trend: "up" },
      { label: "Best line", value: "84.2%", note: "Line 1", trend: "up" },
      { label: "Worst line", value: "68.5%", note: "Line 4", trend: "down" },
      { label: "DHU rate", value: "3.2%", note: "Defects per 100", trend: "down" },
    ],
    tableTitle: "Efficiency report register",
    tableDescription: "Production efficiency by line.",
    columns: ["Line", "Supervisor", "Efficiency", "Output", "DHU", "Status"],
    rows: [
      ["Line 1", "R. Ahmed", "84.2%", "720 pcs", "1.8%", "Excellent"],
      ["Line 3", "S. Begum", "76.1%", "680 pcs", "2.4%", "Good"],
      ["Line 5", "M. Rahman", "72.4%", "580 pcs", "3.6%", "Fair"],
      ["Line 4", "K. Hasan", "68.5%", "520 pcs", "4.8%", "Poor"],
    ],
    statusIndex: 5,
    sideTitle: "Line performance",
    sideDescription: "Lines by efficiency tier.",
    progress: [
      { label: "Excellent (>80%)", value: "4 lines", percent: 33, tone: "bg-emerald-500" },
      { label: "Good (75–80%)", value: "4 lines", percent: 33, tone: "bg-primary" },
      { label: "Fair/Poor (<75%)", value: "4 lines", percent: 33, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Line 4 below target", detail: "68.5% efficiency — schedule IE review for method improvement.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function ReportingWorkspace({ module }: { module: ModuleKey }) {
  const config = configs[module]

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/reporting" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Reporting & Export
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <BarChart3 className="size-4 text-muted-foreground" />}
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
                <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Report attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening report task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Report hub</p><p className="text-xs text-muted-foreground">All report data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
