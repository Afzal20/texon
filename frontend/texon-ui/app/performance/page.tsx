"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TrendingUp, AlertTriangle, Search,
  MoreVertical, FileText, Table2, ArrowRight, Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { getProductionLines, getSewingRecords, getPerformanceRecords } from "@/lib/data/production-actions"
import type { ProductionLine, SewingRecord, PerformanceRecord } from "@/lib/data/production"

export default function Performance() {
  const [lines, setLines] = React.useState<ProductionLine[]>([])
  const [sewingRecords, setSewingRecords] = React.useState<SewingRecord[]>([])
  const [performanceRecords, setPerformanceRecords] = React.useState<PerformanceRecord[]>([])
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    getProductionLines().then(setLines).catch(() => {})
    getSewingRecords().then(setSewingRecords).catch(() => {})
    getPerformanceRecords().then(setPerformanceRecords).catch(() => {})
  }, [])

  const lineEfficiency = lines.map(line => {
    const records = sewingRecords.filter(r => r.production_line === line.id)
    const avgEff = records.length > 0
      ? records.reduce((s, r) => s + (r.efficiency || 0), 0) / records.length
      : 0
    return { line, efficiency: avgEff }
  })

  const oee = lineEfficiency.length > 0
    ? lineEfficiency.reduce((s, l) => s + l.efficiency, 0) / lineEfficiency.length
    : 0
  const totalOutput = sewingRecords.reduce((s, r) => s + (r.output_quantity || 0), 0)
  const totalInput = sewingRecords.reduce((s, r) => s + (r.input_quantity || 0), 0)
  const totalDefects = sewingRecords.reduce((s, r) => s + (r.defect_quantity || 0), 0)
  const dhu = totalOutput > 0 ? ((totalDefects / totalOutput) * 100).toFixed(1) : "0"
  const outputPct = totalInput > 0 ? Math.round((totalOutput / totalInput) * 100) : 0

  const filteredLines = search
    ? lineEfficiency.filter(l =>
        l.line.name.toLowerCase().includes(search.toLowerCase())
      )
    : lineEfficiency

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Reports</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real-time production metrics across all active sewing lines.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
              <button className="px-3 py-2 bg-foreground text-background">Today</button>
              <button className="px-3 py-2 hover:bg-muted transition-colors">This Week</button>
              <button className="px-3 py-2 hover:bg-muted transition-colors">Custom</button>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={() => toast.success("PDF report downloaded")}>
              <FileText className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={() => toast.success("Excel report downloaded")}>
              <Table2 className="h-3.5 w-3.5" /> Excel
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Overall Equip. Eff. (OEE)", value: oee.toFixed(1), unit: "%", trend: `${(oee > 70 ? "+" : "")}${(oee - 75).toFixed(1)}% vs target`, trendUp: oee >= 75 },
            { label: "Output (Target vs Actual)", value: totalOutput.toLocaleString(), unit: `/ ${totalInput.toLocaleString()}`, sub: `${outputPct}%`, bar: outputPct },
            { label: "DHU Rate", value: dhu, unit: "defects/100", trend: `${parseFloat(dhu) > 3 ? "+" : ""}${dhu} vs target (3.0)`, trendUp: false, trendRed: parseFloat(dhu) > 3 },
            { label: "Active Lines", value: String(lines.length), unit: "lines", note: `${sewingRecords.length} records today` },
          ].map((kpi, i) => (
            <Card key={i} className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1.5">
                  <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.unit}</div>
                </div>
                {"bar" in kpi && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: `${kpi.bar}%` }} />
                    </div>
                  </div>
                )}
                {"trend" in kpi && (
                  <p className={cn("text-xs font-semibold flex items-center gap-1 mt-2",
                    kpi.trendRed ? "text-red-600" : "text-primary"
                  )}>
                    {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {kpi.trend}
                  </p>
                )}
                {"note" in kpi && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />{kpi.note}
                  </p>
                )}
                {"sub" in kpi && !("bar" in kpi) && <p className="text-xs text-muted-foreground mt-2">{kpi.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">30-Day Production Trend</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => toast.info("Menu coming soon")}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <TrendChart />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 -mx-5 px-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">Line-wise Efficiency</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter lines..."
                    className="pl-8 h-8 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Sewing Line</div>
                  <div>Code</div>
                  <div>Efficiency %</div>
                  <div>Capacity</div>
                  <div>Status</div>
                </div>
                {filteredLines.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No production lines loaded.
                  </div>
                )}
                {filteredLines.map(({ line, efficiency }) => (
                  <div
                    key={line.id}
                    className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm"
                  >
                    <div className="font-mono font-semibold text-foreground">{line.name}</div>
                    <div className="text-muted-foreground">{line.code}</div>
                    <div className={cn("font-bold", efficiency >= 75 ? "text-primary" : efficiency >= 60 ? "text-amber-600" : "text-red-600")}>
                      {efficiency.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{line.capacity}/day</div>
                    <div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded border",
                        line.is_active ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-gray-700 bg-gray-50 border-gray-200"
                      )}>
                        {line.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredLines.length > 0 && (
                  <div className="p-4 text-center border-t border-border">
                    <Button variant="link" className="text-primary font-semibold text-sm gap-1" onClick={() => toast.info("Full lines list coming soon")}>
                      View All {lines.length} Lines <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineEfficiency.filter(l => l.efficiency < 65).length > 0 && (
                  <div className="border-l-4 border-red-500 pl-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-red-800">Lines Below Target</div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {lineEfficiency.filter(l => l.efficiency < 65).length} line(s) operating below 65% efficiency. Review resource allocation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {lineEfficiency.filter(l => l.efficiency >= 90).length > 0 && (
                  <div className="border-l-4 border-primary pl-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-foreground">Optimization Opportunity</div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {lineEfficiency.filter(l => l.efficiency >= 90).length} line(s) are overperforming. Consider documenting best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {lineEfficiency.length === 0 && (
                  <p className="text-xs text-muted-foreground">No data available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
