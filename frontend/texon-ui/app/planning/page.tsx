"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const days = [
  { day: "MON", date: "12", isToday: false },
  { day: "TUE", date: "13", isToday: false },
  { day: "WED", date: "14", isToday: true },
  { day: "THU", date: "15", isToday: false },
  { day: "FRI", date: "16", isToday: false },
]

type GanttBar = {
  po: string
  label?: string
  color: string
  startDay: number
  spanDays: number
  rush?: boolean
}

type Line = {
  name: string
  cap: string
  alert?: boolean
  bars: GanttBar[]
}

type Unit = {
  title: string
  lines: Line[]
}

const units: Unit[] = [
  {
    title: "Unit A - Wovens",
    lines: [
      {
        name: "Cutting Line A1",
        cap: "Cap: 5000 pcs/day",
        bars: [
          { po: "PO-9921: Denim", label: "Qty: 10,000", color: "bg-gradient-to-r from-slate-600 to-slate-700 text-white", startDay: 0, spanDays: 1.5 },
          { po: "PO-9922: Chinos", color: "bg-gradient-to-r from-slate-600 to-slate-700 text-white", startDay: 1.5, spanDays: 3.5 },
        ],
      },
      {
        name: "Sewing Line S1 (Auto)",
        cap: "Cap: 1200 pcs/day",
        bars: [
          { po: "PO-9921: Denim", label: "Sewing • Auto", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white", startDay: 1, spanDays: 2 },
        ],
      },
      {
        name: "Sewing Line S2",
        cap: "Cap: 1000 pcs/day",
        alert: true,
        bars: [
          { po: "PO-8810: Jackets", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white", startDay: 2.5, spanDays: 1.5 },
          { po: "PO-9930 (RUSH)", color: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200 shadow-md", startDay: 4, spanDays: 1, rush: true },
        ],
      },
      {
        name: "Finishing Station F1",
        cap: "Cap: 6000 pcs/day",
        bars: [
          { po: "PO-9921: Denim", label: "Finishing & Pack", color: "bg-gradient-to-r from-violet-500 to-purple-600 text-white", startDay: 3, spanDays: 2 },
        ],
      },
    ],
  },
  {
    title: "Unit B - Knits",
    lines: [
      {
        name: "Sewing Line K1",
        cap: "Cap: 2500 pcs/day",
        bars: [
          { po: "PO-7744: Basic Tees (Continuous)", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white", startDay: 0, spanDays: 5 },
        ],
      },
      {
        name: "Sewing Line K2",
        cap: "Cap: 2500 pcs/day",
        bars: [
          { po: "PO-7750: Polos", color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white", startDay: 1, spanDays: 3 },
        ],
      },
    ],
  },
]

function GanttRow({ line }: { line: Line }) {
  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <div className="flex flex-col justify-center px-4 py-3 border-r border-border">
        <div className={cn("text-sm font-semibold", line.alert ? "text-red-600 flex items-center gap-1" : "text-foreground")}>
          {line.alert && <AlertTriangle className="h-3.5 w-3.5" />}
          {line.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{line.cap}</div>
      </div>
      {/* Gantt track */}
      <div className="relative h-[64px] flex items-center">
        {line.bars.map((bar, i) => {
          const left = (bar.startDay / 5) * 100
          const width = (bar.spanDays / 5) * 100
          return (
            <div
              key={i}
              className={cn(
                "absolute flex flex-col justify-center px-3 py-1 rounded-lg text-xs font-semibold h-[44px] cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 ring-1 ring-inset ring-white/10 shadow-sm",
                bar.color
              )}
              style={{ left: `${left}%`, width: `calc(${width}% - 4px)`, marginLeft: "2px" }}
              onClick={() => toast.info("Opening order details...")}
            >
              <div className="font-bold truncate">{bar.po}</div>
              {bar.label && <div className="text-[10px] font-medium opacity-80 mt-0.5">{bar.label}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProductionPlanning() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-0.5 w-5 h-5 shrink-0">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-foreground rounded-[1px]" />
                ))}
              </div>
              <h2 className="text-lg font-bold text-foreground">Weekly Plan: Nov 12 – Nov 18</h2>
            </div>
            <div className="h-5 w-px bg-border" />
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Filter panel coming soon")}>
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-slate-600 to-slate-700 inline-block"/>Cutting</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-slate-400 to-slate-500 inline-block"/>Sewing</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gradient-to-r from-violet-500 to-purple-600 inline-block"/>Finishing</span>
            </div>
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" /> Conflict Detected
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toast.info("Zoomed in")}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toast.info("Zoomed out")}><ZoomOut className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[220px_1fr] border-b border-border">
            <div className="px-4 py-3 border-r border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Production Unit / Machine</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              {days.map((d) => (
                <div
                  key={d.date}
                  className={cn(
                    "py-3 text-center border-r border-border last:border-0",
                    d.isToday ? "bg-primary/5 border-t-2 border-t-primary" : ""
                  )}
                >
                  <div className={cn("text-xs font-semibold", d.isToday ? "text-primary" : "text-muted-foreground")}>{d.day}</div>
                  <div className={cn("text-lg font-bold leading-tight", d.isToday ? "text-primary" : "text-foreground")}>{d.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Units & Lines */}
          {units.map((unit) => (
            <div key={unit.title}>
              {/* Unit header */}
              <div className="grid grid-cols-[220px_1fr] bg-muted/30 border-b border-border">
                <div className="px-4 py-2.5 flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-primary rounded-[1px]" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">{unit.title}</span>
                </div>
                <div />
              </div>
              {unit.lines.map((line) => (
                <GanttRow key={line.name} line={line} />
              ))}
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  )
}
