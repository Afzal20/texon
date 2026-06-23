"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer, ZoomIn, ZoomOut, Hand, Sparkles } from "lucide-react"

const queue = [
  { po: "PO-2023-8891", fabric: "100% C. S/J 160GSM", color: "Navy Blue",      layers: 120, machine: "Auto-Cutter A1", status: "IN PROGRESS", statusColor: "bg-primary/10 text-primary border-primary/30" },
  { po: "PO-2023-8892", fabric: "Poly-Cotton Fleece",  color: "Heather Grey",   layers: 85,  machine: "Auto-Cutter B2", status: "QUEUED",      statusColor: "bg-muted text-muted-foreground border-border" },
  { po: "PO-2023-8893", fabric: "100% C. S/J 160GSM", color: "Optical White",  layers: 150, machine: "Auto-Cutter A1", status: "QUEUED",      statusColor: "bg-muted text-muted-foreground border-border" },
]

// Nesting pieces for the canvas
const pieces = [
  { id: "P-01", x: 4,   y: 15, w: 14, h: 72, angle: 0,   selected: false },
  { id: "P-02", x: 20,  y: 15, w: 14, h: 72, angle: 0,   selected: false },
  { id: "P-03", x: 36,  y: 15, w: 13, h: 72, angle: 0,   selected: false },
  { id: "P-04", x: 50,  y: 10, w: 15, h: 80, angle: 0,   selected: true  },
  { id: "P-05", x: 67,  y: 15, w: 14, h: 45, angle: 0,   selected: false },
  { id: "P-06", x: 67,  y: 62, w: 14, h: 30, angle: 0,   selected: false },
  { id: "P-07", x: 83,  y: 15, w: 13, h: 72, angle: 0,   selected: false },
]

export default function Cutting() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cutting Order Plan: Marker RMG-4402</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Fabric: 100% Cotton Single Jersey • Width: 180cm • Lay Length: 12.5m
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export DXF</Button>
            <Button className="gap-2 bg-foreground hover:bg-foreground/90 text-background">
              <Printer className="h-4 w-4" /> Send to Cutter
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Nesting Canvas */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 14L7 4L12 14H2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </div>
                <CardTitle className="text-base font-semibold">Live Nesting Canvas</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  AI OPTIMIZED (ResNet-152)
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><ZoomIn className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><ZoomOut className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Hand className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* SVG Nesting Canvas */}
              <div className="relative border border-border rounded-lg overflow-hidden bg-gray-50" style={{ height: 260 }}>
                <svg width="100%" height="100%" viewBox="0 100 100 90" preserveAspectRatio="none">
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                      <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#e5e7eb" strokeWidth="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Fabric boundary */}
                  <rect x="2" y="105" width="96" height="82" fill="none" stroke="#9ca3af" strokeWidth="0.5" strokeDasharray="1,1"/>
                  {/* Pieces */}
                  {pieces.map((p) => (
                    <g key={p.id}>
                      <rect
                        x={p.x} y={p.y + 100} width={p.w} height={p.h}
                        fill={p.selected ? "#e0e7ff" : "white"}
                        stroke={p.selected ? "#4f46e5" : "#6b7280"}
                        strokeWidth={p.selected ? 0.8 : 0.4}
                      />
                      <text x={p.x + p.w/2} y={p.y + 100 + p.h/2} textAnchor="middle" fontSize="3" fill={p.selected ? "#4f46e5" : "#6b7280"} fontWeight={p.selected ? "bold" : "normal"}>
                        {p.id}
                      </text>
                    </g>
                  ))}
                </svg>
                {/* Ruler labels */}
                <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground font-mono">0.0m</div>
                <div className="absolute bottom-2 right-2 text-[9px] text-muted-foreground font-mono">Total Length: 12.5m</div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* AI Optimization */}
            <Card className="bg-accent/60 border-primary/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Retraining marker with ML Model v3.2 can yield an additional{" "}
                  <span className="text-primary font-bold">2.1%</span> waste reduction by rotating P-05 and P-06.
                </p>
                <Button className="w-full mt-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wide">
                  Apply Re-Nesting
                </Button>
              </CardContent>
            </Card>

            {/* Nesting Statistics */}
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-semibold">Nesting Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Fabric Utilization</span>
                    <span className="font-bold text-foreground">87.5%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: "87.5%" }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 text-right">TARGET: 85.0%</div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Waste Area</span>
                  <span className="font-bold text-red-600">12.5% <span className="text-muted-foreground font-normal text-xs">(14.2 m²)</span></span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Pieces</span>
                  <span className="font-bold text-foreground">4,210</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Cutting Time</span>
                  <span className="font-bold text-foreground font-mono">01h 45m</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Queue Table */}
        <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Cutting Order Plan Queue</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wide px-6 py-3 border-b border-border bg-muted/20">
              <div>PO Number</div><div>Fabric Type</div><div>Color</div><div>Layer Count</div><div>Machine Assigned</div><div>Status</div>
            </div>
            {queue.map((row, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div className="font-mono font-semibold text-foreground">{row.po}</div>
                <div className="text-muted-foreground">{row.fabric}</div>
                <div className="text-muted-foreground">{row.color}</div>
                <div className="font-mono text-foreground">{row.layers}</div>
                <div className="text-muted-foreground">{row.machine}</div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded border ${row.statusColor}`}>{row.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  )
}
