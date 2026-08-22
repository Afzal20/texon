"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Info, AlertTriangle, MapPin, ReceiptText, RefreshCw } from "lucide-react"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap"
import { getDashboardSummary } from "@/lib/data/production-actions"
import { getDashboardOrdersSummary } from "@/lib/data/order-actions"
import type { ProductionDashboard } from "@/lib/data/production"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

function getStatValueFontSize(val: string | number | undefined | null) {
  if (val === undefined || val === null) return "text-2xl xl:text-3xl font-extrabold"
  const str = String(val)
  if (str.length > 20) return "text-xs sm:text-sm font-bold tracking-tight"
  if (str.length > 16) return "text-sm sm:text-base font-bold tracking-tight"
  if (str.length > 12) return "text-base sm:text-lg xl:text-xl font-bold tracking-tight"
  if (str.length > 8) return "text-lg sm:text-xl xl:text-2xl font-extrabold tracking-tight"
  return "text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight"
}

export default function Dashboard() {
  const [summary, setSummary] = React.useState<ProductionDashboard | null>(null)
  const [ordersSummary, setOrdersSummary] = React.useState<{
    total_ytd: string; active_buyers: number;
    avg_lead_time_days: number; samples_pending: number
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(() => {
    setError(null)
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => {
        const msg = err?.message || "Failed to load dashboard"
        setError(msg)
        toast.error(msg)
      })
    getDashboardOrdersSummary()
      .then(setOrdersSummary)
      .catch((err) => {
        const msg = err?.message || "Failed to load orders"
        setError(msg)
        toast.error(msg)
      })
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  const displayTotal = ordersSummary?.total_ytd ?? summary?.total_orders?.toLocaleString() ?? "—"
  const outputPctStr = summary ? `${Math.round(summary.output_percentage)}%` : "—"
  const delayRiskStr = summary ? `${summary.delay_risk_percentage}%` : "—"
  const activeLinesStr = summary?.active_lines ?? "—"

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Production Dashboard</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time telemetry and AI insights for Floor A &amp; B.
            </p>
          </div>
          <div className="flex flex-col items-end text-sm">
            <span className="text-muted-foreground text-xs">Last sync: Just now</span>
            <div className="flex items-center gap-1.5 text-primary font-semibold mt-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              SYSTEM ACTIVE
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Failed to load some data: {error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <Card className="relative bg-white border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl">
            <div className="hover:-translate-y-0.5 transition-transform duration-300 p-5 pb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Orders / YTD
                </CardTitle>
                <div className="p-1.5 bg-muted/40 rounded-md shrink-0 ml-2">
                  <ReceiptText className="h-4 w-4 text-muted-foreground/70" />
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-1 min-w-0">
                <div
                  className={cn(
                    getStatValueFontSize(displayTotal),
                    "text-foreground leading-tight tracking-tight break-words font-extrabold"
                  )}
                >
                  {displayTotal}
                </div>
                {summary?.order_trend && (
                  <p className="text-xs text-primary font-semibold flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 mr-1 shrink-0" />
                    {summary.order_trend}
                  </p>
                )}
              </CardContent>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/20 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: summary ? `${Math.min(summary.output_percentage, 100)}%` : "65%" }} />
            </div>
          </Card>

          <Card className="bg-white border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden rounded-xl p-5 pb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Output: Target vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                <div className={cn(getStatValueFontSize(outputPctStr), "text-foreground leading-tight tracking-tight break-words font-extrabold")}>
                  {outputPctStr}
                </div>
                {summary && (
                  <div className="text-xs text-muted-foreground shrink-0 font-medium">
                    {summary.output_actual?.toLocaleString()} / <span className="text-muted-foreground/60">{summary.output_target?.toLocaleString()} pcs</span>
                  </div>
                )}
              </div>
              {summary?.delay_risk_note && (
                <p className="text-xs text-muted-foreground flex items-center mt-2">
                  <Info className="h-3 w-3 mr-1 shrink-0" />
                  {summary.delay_risk_note}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-rose-200/80 bg-gradient-to-br from-rose-50/60 via-white to-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-xl p-5 pb-6 relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2 relative z-10">
              <CardTitle className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                Delay Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-1 min-w-0 relative z-10">
              <div className={cn(getStatValueFontSize(delayRiskStr), "text-rose-600 leading-tight tracking-tight break-words font-extrabold")}>
                {delayRiskStr}
              </div>
              {summary?.delay_risk_note && (
                <p className="text-xs text-rose-600 font-semibold flex items-center mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />
                  {summary.delay_risk_note}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden rounded-xl p-5 pb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Lines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-1 min-w-0">
              <div className="flex items-baseline gap-2 min-w-0">
                <div className={cn(getStatValueFontSize(activeLinesStr), "text-foreground leading-tight tracking-tight break-words font-extrabold")}>
                  {activeLinesStr}
                </div>
                {summary && (
                  <div className="text-sm text-muted-foreground font-medium shrink-0">/ {summary.total_lines}</div>
                )}
              </div>
              <div className="flex h-2 w-full mt-3 gap-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: summary ? `${summary.lines_running}%` : "30%" }} />
                <div className="bg-amber-500 h-full" style={{ width: summary ? `${summary.lines_error}%` : "28%" }} />
                <div className="bg-slate-300 h-full" style={{ width: summary ? `${summary.lines_idle}%` : "11%" }} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary inline-block shrink-0" />Running</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500 inline-block shrink-0" />Error</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-slate-300 inline-block shrink-0" />Idle</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-5 bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                Real-time Production Chart (Pcs/Hr)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[380px]">
              <ProductionChart />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">ML Risk Heatmap</CardTitle>
                  <CardDescription className="text-xs mt-1">Defect &amp; Delay probability by line</CardDescription>
                </div>
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
              </div>
            </CardHeader>
            <CardContent>
              <RiskHeatmap />
            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  )
}
