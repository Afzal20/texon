"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Database, Clock, CheckCircle2,
  AlertTriangle, HardDrive, RefreshCw, Download,
  Upload, MoreVertical, Calendar, Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const backups = [
  { id: "BK-2024-001", type: "Full", size: "2.4 GB", status: "Completed", date: "Jul 18, 2026 06:00 AM", duration: "12m 34s", retention: "30 days", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "BK-2024-002", type: "Incremental", size: "340 MB", status: "Completed", date: "Jul 17, 2026 06:00 AM", duration: "3m 12s", retention: "7 days", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "BK-2024-003", type: "Incremental", size: "285 MB", status: "Completed", date: "Jul 16, 2026 06:00 AM", duration: "2m 58s", retention: "7 days", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "BK-2024-004", type: "Full", size: "2.3 GB", status: "Completed", date: "Jul 11, 2026 06:00 AM", duration: "11m 45s", retention: "30 days", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "BK-2024-005", type: "Incremental", size: "412 MB", status: "Failed", date: "Jul 10, 2026 06:00 AM", duration: "—", retention: "—", statusColor: "bg-red-50 text-red-700 border-red-200" },
]

const schedules = [
  { name: "Daily Incremental", frequency: "Every day at 06:00 AM", lastRun: "Jul 18, 2026", nextRun: "Jul 19, 2026", enabled: true },
  { name: "Weekly Full Backup", frequency: "Every Sunday at 02:00 AM", lastRun: "Jul 13, 2026", nextRun: "Jul 20, 2026", enabled: true },
  { name: "Monthly Archive", frequency: "1st of every month at 01:00 AM", lastRun: "Jul 1, 2026", nextRun: "Aug 1, 2026", enabled: true },
]

export default function BackupRecoveryPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">Backup & Recovery</h2>
              <p className="text-muted-foreground mt-1 text-sm">Automated data protection, backup scheduling, and disaster recovery.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Backup settings opening...")}>
                <MoreVertical className="h-4 w-4" /> Settings
              </Button>
              <Button size="sm" className="gap-2" onClick={() => toast.success("Manual backup started")}>
                <Database className="h-4 w-4" /> Manual Backup
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Today</div>
              <p className="text-xs text-muted-foreground mt-1">06:00 AM • 2.4 GB • 12m 34s</p>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed Successfully
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">5.8</span>
                <span className="text-sm text-muted-foreground">GB</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "58%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">58% of 10 GB quota</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Recovery Points</CardTitle>
              <Shield className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">30</div>
              <p className="text-xs text-muted-foreground mt-1">Available restore points</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Failed Backups (30d)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">1</div>
              <p className="text-xs text-muted-foreground mt-1">Jul 10 — Storage quota exceeded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Backup History */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">Backup History</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.success("Backup history exported")}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Backup ID</div>
                  <div>Type</div>
                  <div>Size</div>
                  <div>Date</div>
                  <div>Duration</div>
                  <div>Status</div>
                </div>
                {backups.map((b, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_0.8fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div className="font-mono font-medium text-foreground text-xs">{b.id}</div>
                    <div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded border", b.type === "Full" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border")}>
                        {b.type}
                      </span>
                    </div>
                    <div className="text-muted-foreground font-mono text-xs">{b.size}</div>
                    <div className="text-muted-foreground text-xs">{b.date}</div>
                    <div className="text-muted-foreground font-mono text-xs">{b.duration}</div>
                    <div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded border", b.statusColor)}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Schedule + Actions */}
          <div className="space-y-4">
            {/* Backup Schedule */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Backup Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {schedules.map((s, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      <div className="h-5 w-9 rounded-full bg-primary relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.frequency}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last: {s.lastRun}</span>
                      <span>Next: {s.nextRun}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.success("Full backup started")}>
                  <Database className="h-3.5 w-3.5" /> Run Full Backup Now
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.info("Restore wizard opening...")}>
                  <Upload className="h-3.5 w-3.5" /> Restore from Backup
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.info("Download started")}>
                  <Download className="h-3.5 w-3.5" /> Download Latest Backup
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.success("Test restore completed")}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Test Restore (Dry Run)
                </Button>
              </CardContent>
            </Card>

            {/* Storage Breakdown */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold">Storage Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {[
                  { label: "Full Backups", size: "4.7 GB", pct: 81, color: "bg-primary" },
                  { label: "Incremental", size: "1.1 GB", pct: 19, color: "bg-amber-500" },
                ].map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-medium text-foreground">{s.size}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
