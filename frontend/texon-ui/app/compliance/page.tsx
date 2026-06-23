"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, Clock, 
  Leaf, Droplets, Zap, Calendar, MoreVertical, ArrowRight
} from "lucide-react"

const docs = [
  { type: "Trade License",  authority: "City Corporation", expiry: "2024-12-31", status: "Valid",         statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { type: "Fire License",   authority: "BFSCD",            expiry: "2023-11-10", status: "Expiring (14d)", statusColor: "bg-amber-100 text-amber-700 border-amber-200", expiryRed: true },
  { type: "Env. Clearance", authority: "DoE",              expiry: "2025-06-15", status: "Valid",         statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { type: "RSC Safety Cert", authority: "RSC",             expiry: "–",          status: "Missing Doc",   statusColor: "bg-red-100 text-red-700 border-red-200" },
]

const audits = [
  { month: "NOV", day: "24", title: "BSCI Follow-up Audit", badge: "PENDING PREP", badgeColor: "bg-amber-100 text-amber-700 border border-amber-200", desc: "Focus on working hours & wage slip verification.", action: "Prepare Docs" },
  { month: "DEC", day: "02", title: "Fire Safety Inspection", badge: "READY", badgeColor: "bg-emerald-100 text-emerald-700 border border-emerald-200", desc: "Annual RSC compliance check for Unit B.", action: "Docs Prepared", done: true },
]

export default function Compliance() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Compliance & Audit Center</h2>
            <p className="text-muted-foreground mt-1 text-sm">ESG Tracking & Export Readiness Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Upload New Certificate
            </Button>
            <Button className="gap-2 bg-foreground hover:bg-foreground/90 text-background">
              <FileText className="h-4 w-4" /> Generate Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Total Compliance Donut */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Total Compliance</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {/* SVG Donut */}
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#4f46e5" strokeWidth="10"
                    strokeDasharray={`${94 * 2.389} ${100 * 2.389}`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">94%</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mt-1">EXPORT READY</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                {[
                  { label: "Social (BSCI)", pct: 98, color: "bg-emerald-500" },
                  { label: "Env. (Higg)", pct: 88, color: "bg-amber-400" },
                  { label: "Safety (Accord)", pct: 96, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                    <span className="text-muted-foreground flex-1">{item.label}</span>
                    <span className="font-bold text-foreground">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Docu-Track */}
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">✦</span> AI Docu-Track
              </CardTitle>
              <span className="text-[10px] font-bold uppercase tracking-wider border border-border px-2 py-1 rounded text-muted-foreground">AUTO-VERIFIED</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wide px-6 py-3 border-b border-border bg-muted/20">
                <div>Document Type</div><div>Authority</div><div>Expiry Date</div><div>AI Status</div>
              </div>
              {docs.map((d, i) => (
                <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{d.type}
                  </div>
                  <div className="text-muted-foreground">{d.authority}</div>
                  <div className={d.expiryRed ? "text-red-600 font-semibold" : "text-muted-foreground"}>{d.expiry}</div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${d.statusColor}`}>{d.status}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ESG Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" /> Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">1.2</span>
                <span className="text-sm text-muted-foreground">tCO2e/unit</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                <span>↓</span> -5.4% vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" /> Water Recycled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">42</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "42%" }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Renewable Energy Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">18.5</span>
                <span className="text-sm text-muted-foreground">% of total grid</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">TARGET: 25% by 2025</span>
                <button className="text-xs text-primary font-semibold hover:underline">View ROI →</button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Audits */}
        <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Upcoming Audits
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs">Mock Audit</Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {audits.map((a, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <div className="bg-muted rounded-lg p-3 text-center min-w-[52px]">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{a.month}</div>
                  <div className="text-xl font-bold text-foreground leading-tight">{a.day}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{a.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${a.badgeColor}`}>{a.badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  {a.done ? (
                    <div className="flex items-center gap-1 mt-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {a.action}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1">
                      <FileText className="h-3 w-3" /> {a.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
