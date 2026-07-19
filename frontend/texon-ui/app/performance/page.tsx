"use client"

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

const lines = [
  { line: "Line 01", supervisor: "R. Ahmed", eff: "82.4%", effVal: 82.4, order: "PO-9921 (T-Shirts)", status: "On-Track", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { line: "Line 02", supervisor: "S. Begum",  eff: "76.1%", effVal: 76.1, order: "PO-9921 (T-Shirts)", status: "On-Track", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { line: "Line 03", supervisor: "M. Rahman", eff: "68.5%", effVal: 68.5, order: "PO-1045 (Hoodies)", status: "At-Risk",  statusColor: "text-amber-700 bg-amber-50 border-amber-200" },
  { line: "Line 04", supervisor: "K. Hasan",  eff: "54.2%", effVal: 54.2, order: "PO-1045 (Hoodies)", status: "Behind",   statusColor: "text-red-700 bg-red-50 border-red-200" },
  { line: "Line 05", supervisor: "F. Islam",  eff: "79.0%", effVal: 79.0, order: "PO-8830 (Denim)",   status: "On-Track", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
]

export default function Performance() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Performance Reports</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real-time production metrics across all active sewing lines.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
              <button className="px-3 py-2 bg-foreground text-background" onClick={() => toast.info("Showing today's data")}>Today</button>
              <button className="px-3 py-2 hover:bg-muted transition-colors" onClick={() => toast.info("Showing weekly data")}>This Week</button>
              <button className="px-3 py-2 hover:bg-muted transition-colors" onClick={() => toast.info("Custom date picker coming soon")}>Custom</button>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={() => toast.success("PDF report downloaded")}>
              <FileText className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={() => toast.success("Excel report downloaded")}>
              <Table2 className="h-3.5 w-3.5" /> Excel
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Overall Equip. Eff. (OEE)", value: "78.4", unit: "%", trend: "+2.1% vs last week", trendUp: true },
            { label: "Output (Target vs Actual)", value: "12,450", unit: "/ 13,000", sub: "95.7%", bar: 95.7 },
            { label: "DHU Rate", value: "3.2", unit: "defects/100", trend: "+0.5 vs target (2.7)", trendUp: false, trendRed: true },
            { label: "Downtime", value: "145", unit: "mins", note: "Major: Line 04 (45m)" },
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
                {kpi.bar && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full" style={{ width: `${kpi.bar}%` }} />
                    </div>
                  </div>
                )}
                {kpi.trend && (
                  <p className={cn("text-xs font-semibold flex items-center gap-1 mt-2",
                    kpi.trendRed ? "text-red-600" : "text-primary"
                  )}>
                    {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {kpi.trend}
                  </p>
                )}
                {kpi.note && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />{kpi.note}
                  </p>
                )}
                {kpi.sub && !kpi.bar && <p className="text-xs text-muted-foreground mt-2">{kpi.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Chart + Table */}
          <div className="lg:col-span-2 space-y-6">
            {/* 30-Day Trend */}
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

            {/* Line-wise Efficiency Table */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 -mx-5 px-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">Line-wise Efficiency</CardTitle>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Filter lines..." className="pl-8 h-8 text-xs" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Sewing Line</div>
                  <div>Supervisor</div>
                  <div>Efficiency %</div>
                  <div>Active Order</div>
                  <div>Status</div>
                </div>
                {lines.map((l, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr_1.5fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm"
                  >
                    <div className="font-mono font-semibold text-foreground">{l.line}</div>
                    <div className="text-muted-foreground">{l.supervisor}</div>
                    <div className={cn("font-bold", l.effVal >= 75 ? "text-primary" : l.effVal >= 65 ? "text-amber-600" : "text-red-600")}>
                      {l.eff}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{l.order}</div>
                    <div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded border", l.statusColor)}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-4 text-center border-t border-border">
                  <Button variant="link" className="text-primary font-semibold text-sm gap-1" onClick={() => toast.info("Full lines list coming soon")}>
                    View All 10 Lines <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: AI Insights */}
          <div className="space-y-4">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  AI Efficiency Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Critical */}
                <div className="border-l-4 border-red-500 pl-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-red-800">Critical Bottleneck: Line 04</div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Efficiency dropped to 54.2% due to <strong>Fabric Delay (Batch #44B)</strong> at the cutting section.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-indigo-100/50 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-md p-3">
                    <div className="text-[11px] font-bold text-primary mb-1.5 uppercase tracking-wide">AI Recommendation</div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      Re-route cutting batch #45A to Line 04 temporarily to minimize idle time. Estimated recovery: +12% efficiency today.
                    </p>
                    <Button size="sm" className="mt-3 h-7 text-xs font-semibold w-full bg-primary hover:bg-primary/90" onClick={() => toast.success("Re-route executed successfully")}>
                      Execute Re-route
                    </Button>
                  </div>
                </div>

                {/* Optimization */}
                <div className="border-l-4 border-primary pl-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-foreground">Optimization Opportunity</div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Line 01 is overperforming (+6% vs target). Supervisor R. Ahmed has optimized the sleeve attachment process.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Consider documenting this process variation for Line 02 &amp; 03 to improve overall floor OEE by projected 1.5%.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floor Activity Heatmap */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Floor Activity Heatmap (Last Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-0.5 h-20">
                  {Array.from({ length: 40 }).map((_, i) => {
                    // Predefined pseudo-random intensities to avoid Next.js hydration errors
                    const intensities = [0.8, 0.2, 0.5, 0.9, 0.1, 0.3, 0.6, 0.4, 0.7, 0.2, 0.8, 0.5, 0.1, 0.9, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.5, 0.9, 0.1, 0.3, 0.6, 0.4, 0.7, 0.2, 0.8, 0.5, 0.1, 0.9, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.5, 0.9]
                    const intensity = intensities[i]
                    const bg = intensity > 0.7 ? "bg-red-300" : intensity > 0.4 ? "bg-primary/30" : "bg-muted"
                    return <div key={i} className={cn("rounded-[2px]", bg)} />
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">Live Floor Data Syncing...</p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
