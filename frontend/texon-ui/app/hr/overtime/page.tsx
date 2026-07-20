"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getOvertime } from "@/lib/api/hr"

export default function OvertimePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getOvertime().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalHours = items.reduce((s: number, i: any) => s + Number(i.hours ?? i.ot_hours ?? 0), 0)
      const pending = items.filter((i: any) => (i.status ?? "").toLowerCase() === "pending")
      const approved = items.filter((i: any) => (i.status ?? "").toLowerCase() === "approved")
      setData({
        metrics: [
          { label: "OT hours today", value: `${totalHours} hrs`, note: `${items.length} workers`, trend: "up" as const },
          { label: "OT cost today", value: "-", note: "Calculated at 2× rate", trend: "neutral" as const },
          { label: "Pending approval", value: String(pending.length), note: "Requests awaiting", trend: "neutral" as const },
          { label: "OT this month", value: `${totalHours} hrs`, note: `${approved.length} approved`, trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.ot_id ?? i.id ?? "-", i.worker ?? i.worker_name ?? "-", i.line ?? i.line_number ?? "-", `${i.hours ?? i.ot_hours ?? 0} hrs`, i.reason ?? i.ot_reason ?? "-", i.status ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="overtime" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
