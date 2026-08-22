"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getAttendance } from "@/lib/api/hr"

export default function ShiftSchedulePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getAttendance().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const shifts = new Set(items.map((i: any) => i.shift ?? i.shift_type).filter(Boolean))
      const active = items.filter((i: any) => (i.status ?? "").toLowerCase() === "active" || (i.status ?? "").toLowerCase() === "present")
      setData({
        metrics: [
          { label: "Active shifts", value: String(shifts.size), note: `${[...shifts].join(", ")}`, trend: "neutral" as const },
          { label: "Workers scheduled", value: String(active.length), note: "Today", trend: "neutral" as const },
          { label: "Shift types in use", value: String(new Set(active.map((a: any) => String(a.shift ?? ""))).size), note: "This week", trend: "neutral" as const },
          { label: "Night shift workers", value: String(active.filter((a: any) => String(a.shift ?? "").toLowerCase().includes("night")).length), note: "Extended coverage", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.shift ?? i.shift_type ?? "-", i.time ?? i.shift_time ?? "-", i.line ?? i.line_number ?? "-", String(i.workers ?? i.worker_count ?? 0), i.supervisor ?? "-", i.status ?? "Active"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="shift-schedule" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
