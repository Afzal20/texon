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

          <Card className="relative bg-transparent border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-visible">
            <div className="absolute inset-0 rounded-xl bg-white -z-10" />
            <div className="hover:-translate-y-0.5 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Orders
                </CardTitle>
                <div className="p-2 bg-gradient-to-br from-muted/50 to-muted/20 rounded-md">
                  <ReceiptText className="h-4 w-4 text-muted-foreground/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {ordersSummary?.total_ytd ?? summary?.total_orders?.toLocaleString() ?? "—"}
                </div>
                {summary?.order_trend && (
                  <p className="text-xs text-primary font-semibold flex items-center mt-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {summary.order_trend}
                  </p>
                )}
              </CardContent>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/20 rounded-b-xl overflow-hidden">
              <div className="h-full bg-primary" style={{ width: summary ? `${Math.min(summary.output_percentage, 100)}%` : "65%" }} />
            </div>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Output: Target vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  {summary ? `${Math.round(summary.output_percentage)}%` : "—"}
                </div>
                {summary && (
                  <div className="text-xs text-muted-foreground">
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

          <Card className="border-red-200/60 bg-gradient-to-br from-red-50 to-white shadow-sm hover:shadow-lg hover:shadow-red-100 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-[--card-spacing] right-[--card-spacing] w-12 h-12 bg-red-100 rounded-full opacity-60" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
              <CardTitle className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                Delay Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-600">
                {summary ? `${summary.delay_risk_percentage}%` : "—"}
              </div>
              {summary?.delay_risk_note && (
                <p className="text-xs text-red-600 font-semibold flex items-center mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {summary.delay_risk_note}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">{summary?.active_lines ?? "—"}</div>
                {summary && (
                  <div className="text-sm text-muted-foreground font-medium">/ {summary.total_lines}</div>
                )}
              </div>
              <div className="flex h-2 w-full mt-4 gap-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: summary ? `${summary.lines_running}%` : "30%" }} />
                <div className="bg-primary/70 h-full" style={{ width: summary ? `${summary.lines_error}%` : "28%" }} />
                <div className="bg-destructive h-full" style={{ width: summary ? `${summary.lines_idle}%` : "11%" }} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary inline-block" />Running</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive inline-block" />Error</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-border inline-block" />Idle</span>
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
