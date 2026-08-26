"use client"

import { useEffect, useMemo, useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CalendarClock,
  CircleCheck,
  CircleDashed,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react"
import { restList } from "@/lib/api/rest"
import { cn } from "@/lib/utils"

interface TaskRow {
  id: number
  title: string
  description?: string
  status?: string
  status_display?: string
  priority?: string
  priority_display?: string
  assigned_to?: string
  start_date?: string
  end_date?: string
  progress?: number
  purchase_order_name?: string
  style_name?: string
}

type StatusFilter = "all" | "open" | "delayed" | "completed"

const OPEN_STATUSES = new Set(["not_started", "in_progress"])
const DONE_STATUSES = new Set(["completed", "cancelled"])

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  medium: "bg-sky-100 text-sky-700 border-sky-200",
  low: "bg-muted text-muted-foreground border-border",
}

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delayed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-muted text-muted-foreground line-through border-border",
}

function isOverdue(task: TaskRow): boolean {
  if (!task.end_date || DONE_STATUSES.has(String(task.status))) return false
  const end = new Date(task.end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return end < today
}

interface TaskCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MerchandisingTaskCenter({ open, onOpenChange }: TaskCenterProps) {
  const [tasks, setTasks] = useState<TaskRow[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const res = await restList("tna", "Task")
      setTasks((res.data ?? []) as unknown as TaskRow[])
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const stats = useMemo(() => {
    const rows = tasks ?? []
    return {
      open: rows.filter((t) => OPEN_STATUSES.has(String(t.status)) || t.status === "delayed").length,
      overdue: rows.filter(isOverdue).length,
      completed: rows.filter((t) => t.status === "completed").length,
    }
  }, [tasks])

  const visible = useMemo(() => {
    let rows = tasks ?? []
    if (filter === "open") rows = rows.filter((t) => OPEN_STATUSES.has(String(t.status)))
    else if (filter === "delayed") rows = rows.filter((t) => t.status === "delayed" || isOverdue(t))
    else if (filter === "completed") rows = rows.filter((t) => t.status === "completed")

    const q = query.trim().toLowerCase()
    if (q) {
      rows = rows.filter((t) =>
        [t.title, t.assigned_to, t.purchase_order_name, t.style_name]
          .some((v) => String(v ?? "").toLowerCase().includes(q)),
      )
    }
    const rank = (t: TaskRow) =>
      ({ critical: 0, high: 1, medium: 2, low: 3 })[String(t.priority)] ?? 4
    return [...rows].sort((a, b) => rank(a) - rank(b))
  }, [tasks, filter, query])

  const filters: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: tasks?.length },
    { key: "open", label: "Open", count: stats.open },
    { key: "delayed", label: "Delayed / Overdue", count: stats.overdue },
    { key: "completed", label: "Completed", count: stats.completed },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col gap-0">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between pr-8">
            <div>
              <SheetTitle className="text-base font-bold">Merchandising Task Center</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Tasks from the TnA plan linked to merchandising orders.
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={load} disabled={loading} aria-label="Refresh tasks" title="Refresh">
              <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pr-8">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><CircleDashed className="size-3.5" /> Open</div>
              <p className="mt-1 text-xl font-bold">{loading ? "…" : stats.open}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><AlertTriangle className="size-3.5" /> Overdue</div>
              <p className={cn("mt-1 text-xl font-bold", !loading && stats.overdue > 0 && "text-destructive")}>{loading ? "…" : stats.overdue}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><CircleCheck className="size-3.5" /> Done</div>
              <p className="mt-1 text-xl font-bold">{loading ? "…" : stats.completed}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 pr-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, PO, style, assignee…"
                className="h-9 pl-9 bg-muted/40 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f.label}
                  {typeof f.count === "number" && ` · ${f.count}`}
                </button>
              ))}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
          {loading && tasks === null && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" /> Loading tasks…
            </div>
          )}
          {!loading && visible.length === 0 && (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No tasks match this view.
            </div>
          )}
          {visible.map((task) => {
            const overdue = isOverdue(task)
            const status = String(task.status ?? "")
            return (
              <div key={task.id} className="rounded-lg border p-3.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {[task.purchase_order_name, task.style_name, task.assigned_to ? `Assigned: ${task.assigned_to}` : null]
                        .filter(Boolean)
                        .join(" · ") || "Unlinked"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-[10px] px-1.5", PRIORITY_STYLES[String(task.priority)] ?? PRIORITY_STYLES.low)}>
                      {task.priority_display ?? task.priority ?? "low"}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5", STATUS_STYLES[status] ?? STATUS_STYLES.not_started)}>
                      {task.status_display ?? status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                {typeof task.progress === "number" && (
                  <div className="mt-3 flex items-center gap-2.5">
                    <Progress value={task.progress} className="h-1.5" />
                    <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">{task.progress}%</span>
                  </div>
                )}

                {task.end_date && (
                  <div className={cn("mt-2.5 flex items-center gap-1 text-[11px]", overdue ? "font-semibold text-destructive" : "text-muted-foreground")}>
                    {overdue ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />}
                    Due {new Date(task.end_date).toLocaleDateString()}
                    {overdue && " · overdue"}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
