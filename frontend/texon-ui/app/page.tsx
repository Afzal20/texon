"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, Info, AlertTriangle, MapPin, ReceiptText } from "lucide-react"
import { ProductionChart } from "@/components/dashboard/ProductionChart"
import { RiskHeatmap } from "@/components/dashboard/RiskHeatmap"

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Page Header */}
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

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 – Total Orders */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Orders (Oct)
              </CardTitle>
              <div className="p-2 bg-gradient-to-br from-muted/50 to-muted/20 rounded-md">
                <ReceiptText className="h-4 w-4 text-muted-foreground/60" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">1,248</div>
              <p className="text-xs text-primary font-semibold flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% vs last month
              </p>
              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary/20 rounded-b-lg overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "65%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Card 2 – Output */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Output: Target vs Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">88%</div>
                <div className="text-xs text-muted-foreground">
                  45k / <span className="text-muted-foreground/60">51k pcs</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                <Info className="h-3 w-3 mr-1 shrink-0" />
                Slight lag in Line 4
              </p>
            </CardContent>
          </Card>

          {/* Card 3 – Delay Risk */}
          <Card className="border-red-200/60 bg-gradient-to-br from-red-50/80 to-white/80 backdrop-blur-md shadow-sm hover:shadow-lg hover:shadow-red-100 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-[3rem]" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                Delay Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-600">14.2%</div>
              <p className="text-xs text-red-600 font-semibold flex items-center mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Elevated in Cutting Room
              </p>
            </CardContent>
          </Card>

          {/* Card 4 – Active Lines */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">32</div>
                <div className="text-sm text-muted-foreground font-medium">/ 36</div>
              </div>
              <div className="flex h-2 w-full mt-4 gap-0.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "30%" }} />
                <div className="bg-primary/70 h-full" style={{ width: "28%" }} />
                <div className="bg-primary/40 h-full" style={{ width: "20%" }} />
                <div className="bg-destructive h-full" style={{ width: "11%" }} />
                <div className="bg-border h-full" style={{ width: "11%" }} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary inline-block"/>Running</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive inline-block"/>Error</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-border inline-block"/>Idle</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Production Chart */}
          <Card className="lg:col-span-5 flex flex-col bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-base font-semibold text-foreground">
                Real-time Production Chart (Pcs/Hr)
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="text-xs border border-border px-3 py-1.5 rounded-md text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                  Today
                </div>
                <div className="text-xs bg-accent text-primary px-3 py-1.5 rounded-md font-semibold border border-primary/20 cursor-pointer">
                  Shift 1
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[380px] pt-2">
              <ProductionChart />
            </CardContent>
          </Card>

          {/* Risk Heatmap */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
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
