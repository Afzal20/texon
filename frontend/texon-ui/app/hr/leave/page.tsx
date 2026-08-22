"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getLeaves } from "@/lib/api/hr"

export default function LeavePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getLeaves().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const onLeave = items.filter((i: any) => (i.status ?? "").toLowerCase() === "approved")
      const pending = items.filter((i: any) => (i.status ?? "").toLowerCase() === "pending")
      const today = new Date().toISOString().slice(0, 10)
      const onLeaveToday = onLeave.filter((i: any) => i.start_date?.startsWith(today) || i.end_date?.startsWith(today) || (i.start_date <= today && i.end_date >= today))
      setData({
        metrics: [
          { label: "On leave today", value: String(onLeaveToday.length || onLeave.length), note: "Approved leaves", trend: "neutral" as const },
          { label: "Pending requests", value: String(pending.length), note: "Awaiting approval", trend: "neutral" as const },
          { label: "Leave balance", value: "-", note: "Avg. remaining", trend: "neutral" as const },
          { label: "Pending approvals", value: String(items.filter((i: any) => String(i.status ?? "").toLowerCase() === "pending").length), note: "Awaiting manager", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.leave_id ?? i.id ?? "-", i.employee ?? i.employee_name ?? "-", i.type ?? i.leave_type ?? "-", String(i.days ?? i.duration ?? 0), i.period ?? `${i.start_date ?? "-"} – ${i.end_date ?? "-"}`, i.status ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="leave" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
