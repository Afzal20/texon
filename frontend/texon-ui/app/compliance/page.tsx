"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload, FileText, CheckCircle2,
  Leaf, Droplets, Zap, Calendar, MoreVertical,
  AlertTriangle, XCircle
} from "lucide-react"
import { toast } from "sonner"
import { getComplianceRecords, getComplianceSummary } from "@/lib/data/compliance-actions"
import type { ComplianceRecord, ComplianceSummary } from "@/lib/data/compliance"

export default function Compliance() {
  const [records, setRecords] = React.useState<ComplianceRecord[]>([])
  const [summary, setSummary] = React.useState<ComplianceSummary | null>(null)

  React.useEffect(() => {
    getComplianceRecords().then(setRecords).catch(() => {})
    getComplianceSummary().then(setSummary).catch(() => {})
  }, [])

  const avgScore = records.length > 0
    ? Math.round(records.reduce((s, r) => s + (r.score ?? 0), 0) / records.length)
    : summary?.overall_score ?? 94

  const upcomingAudits = records.filter(r => r.status === "scheduled" || r.status === "pending")
  const validDocs = records.filter(r => r.status === "approved" || r.status === "valid")
  const expiringDocs = records.filter(r => r.follow_up_date && new Date(r.follow_up_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Compliance & Audit Center</h2>
            <p className="text-muted-foreground mt-1 text-sm">ESG Tracking & Export Readiness Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.info("File upload dialog coming soon")}>
              <Upload className="h-4 w-4" /> Upload New Certificate
            </Button>
            <Button className="gap-2 bg-foreground hover:bg-foreground/90 text-background" onClick={() => toast.success("Compliance report generated")}>
              <FileText className="h-4 w-4" /> Generate Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Total Compliance</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => toast.info("Menu coming soon")}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#4f46e5" strokeWidth="10"
                    strokeDasharray={`${avgScore * 2.389} ${100 * 2.389}`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{avgScore}%</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider mt-1">EXPORT READY</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                {[
                  { label: "Social (BSCI)", pct: summary?.social_score ?? 98, color: "bg-emerald-500" },
                  { label: "Env. (Higg)", pct: summary?.environmental_score ?? 88, color: "bg-amber-400" },
                  { label: "Safety (Accord)", pct: summary?.safety_score ?? 96, color: "bg-emerald-500" },
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

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 -mx-5 px-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="text-primary">✦</span> Compliance Records
              </CardTitle>
              <span className="text-[10px] font-bold uppercase tracking-wider border border-border px-2 py-1 rounded text-muted-foreground">
                {records.length} RECORDS
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wide px-6 py-3 border-b border-border bg-muted/20">
                <div>Title</div><div>Type</div><div>Date</div><div>Status</div>
              </div>
              {records.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">No compliance records loaded.</div>
              )}
              {records.slice(0, 8).map((r) => (
                <div key={r.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{r.title}
                  </div>
                  <div className="text-muted-foreground">{r.compliance_type}</div>
                  <div className="text-muted-foreground">{r.audit_date ? new Date(r.audit_date).toLocaleDateString() : "—"}</div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border inline-flex items-center gap-1 ${
                      r.status === "approved" || r.status === "valid"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : r.status === "expiring" || r.status === "pending"
                        ? "bg-amber-50 text-amber-800 border-amber-300"
                        : "bg-red-50 text-red-800 border-red-300"
                    }`}>
                      {r.status === "approved" || r.status === "valid" ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-600" /> Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">{summary?.carbon_footprint?.toFixed(1) ?? "1.2"}</span>
                <span className="text-sm text-muted-foreground">tCO2e/unit</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
                <span>↓</span> Current measurement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" /> Water Recycled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">{summary?.water_recycled_percentage ?? "42"}</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${summary?.water_recycled_percentage ?? 42}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Renewable Energy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">{summary?.renewable_energy_percentage?.toFixed(1) ?? "18.5"}</span>
                <span className="text-sm text-muted-foreground">% of total</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">TARGET: 25% by 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Upcoming Audits
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Mock audit starting...")}>Mock Audit</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAudits.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No upcoming audits scheduled.</div>
            )}
            {upcomingAudits.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <div className="bg-muted rounded-lg p-3 text-center min-w-[52px]">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    {a.audit_date ? new Date(a.audit_date).toLocaleString("default", { month: "short" }) : "—"}
                  </div>
                  <div className="text-xl font-bold text-foreground leading-tight">
                    {a.audit_date ? new Date(a.audit_date).getDate() : "—"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{a.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-orange-50 text-orange-800 border border-orange-400">
                      {a.status === "scheduled" ? "PENDING" : a.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.description || `${a.compliance_type} audit`}</p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1" onClick={() => toast.info("Document preparation started")}>
                    <FileText className="h-3 w-3" /> Prepare Docs
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
