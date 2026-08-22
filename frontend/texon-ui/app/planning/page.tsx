"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { getPlans } from "@/lib/api/production"

type PlanRow = Record<string, unknown>

const DAY_MS = 86400000

const BAR_COLORS = [
  "bg-gradient-to-r from-slate-600 to-slate-700 text-white",
  "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
  "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
]

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  const day = (copy.getDay() + 6) % 7 // Monday-first
  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export default function ProductionPlanning() {
  const [plans, setPlans] = React.useState<PlanRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const weekStart = React.useMemo(() => startOfWeek(new Date()), [])
  const weekDays = React.useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart.getTime() + i * DAY_MS)
        return {
          day: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i],
          date: String(d.getDate()).padStart(2, "0"),
          isToday: new Date().toDateString() === d.toDateString(),
        }
      }),
    [weekStart],
  )
  const todayIndex = weekDays.findIndex((d) => d.isToday)

  React.useEffect(() => {
    getPlans()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setPlans(items as PlanRow[])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  // Group plans by plan_type; position bars within the current week window.
  const groups = React.useMemo(() => {
    const map = new Map<string, { name: string; plans: { row: PlanRow; startDay: number; spanDays: number; color: string }[] }>()
    for (const p of plans) {
      const start = new Date(String(p.start_date ?? ""))
      const end = new Date(String(p.end_date ?? String(p.start_date ?? "")))
      if (Number.isNaN(start.getTime())) continue
      const endSafe = Number.isNaN(end.getTime()) ? start : end
      const startDay = (start.getTime() - weekStart.getTime()) / DAY_MS
      const spanDays = Math.max(0.5, (endSafe.getTime() - start.getTime()) / DAY_MS + 1)
      if (startDay > 7 || startDay + spanDays < 0) continue // outside this week
      const type = String(p.plan_type_display ?? p.plan_type ?? "plan")
      if (!map.has(type)) map.set(type, { name: type, plans: [] })
      const group = map.get(type)!
      group.plans.push({
        row: p,
        startDay,
        spanDays,
        color: BAR_COLORS[(type.length + group.plans.length) % BAR_COLORS.length],
      })
    }
    return [...map.values()]
  }, [plans, weekStart])

  const fmtRange = (p: PlanRow) => `${String(p.start_date ?? "")} → ${String(p.end_date ?? "")}`

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
              <h2 className="text-lg font-bold text-foreground">Weekly Plan</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {weekDays[0].date} – {weekDays[6].date}
            </Badge>
            <div className="h-5 w-px bg-border" />
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Filter panel coming soon")}>
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <div className="flex items-center gap-3 text-xs font-medium">
              {[...new Set(groups.map((g) => g.name))].slice(0, 3).map((type, i) => (
                <span key={type} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm inline-block ${BAR_COLORS[i % BAR_COLORS.length]}`} />
                  {type.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            {groups.some((g) => g.plans.some((b) => b.startDay < 0 && b.startDay + b.spanDays > 0)) && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" /> Overlapping plans
              </Badge>
            )}
          </div>
        </div>

        {/* Day strip */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d, i) => (
            <div key={d.day} className={`rounded-lg border px-3 py-2 text-center text-xs ${d.isToday ? "border-primary bg-primary/5 text-primary font-bold" : "text-muted-foreground"}`}>
              <span className="font-semibold">{d.day}</span> · {d.date}
              {todayIndex === i && <span className="block text-[10px] uppercase tracking-wide">Today</span>}
            </div>
          ))}
        </div>

        {/* Gantt */}
        {isLoading && <div className="py-12 text-center text-sm text-muted-foreground">Loading plans…</div>}
        {!isLoading && groups.length === 0 && (
          <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">No production plans for this week.</div>
        )}
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.name}>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{group.name.replace(/_/g, " ")}</div>
              <div className="space-y-1.5">
                {group.plans.map(({ row, startDay, spanDays, color }, idx) => {
                  const left = Math.max(0, Math.min(startDay, 7)) / 7 * 100
                  const width = Math.min(spanDays - Math.max(0, -startDay), 7 - Math.max(0, startDay)) / 7 * 100
                  return (
                    <div key={String(row.id ?? idx)} className="relative h-9 rounded-md border bg-muted/30 overflow-hidden">
                      <div
                        className={`absolute inset-y-1 rounded px-2 py-1 overflow-hidden ${color}`}
                        style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                      >
                        <div className="text-[10px] font-semibold truncate">{String(row.title ?? "Plan")}</div>
                        {width > 14 && <div className="text-[10px] opacity-80 truncate">{fmtRange(row)}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
