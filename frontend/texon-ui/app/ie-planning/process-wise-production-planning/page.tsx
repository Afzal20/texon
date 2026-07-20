"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getProductionPlans } from "@/lib/api/production"

export default function ProcessWiseProductionPlanningPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getProductionPlans().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const onTrack = items.filter((i: any) => (i.status ?? "").toLowerCase() === "complete" || (i.status ?? "").toLowerCase() === "in_progress" || (i.status ?? "").toLowerCase() === "in progress")
      const behind = items.filter((i: any) => (i.status ?? "").toLowerCase() === "behind")
      setData({
        metrics: [
          { label: "Plans created", value: String(items.length), note: "This month", trend: "up" as const },
          { label: "On-track plans", value: String(onTrack.length), note: items.length ? `${Math.round(onTrack.length / items.length * 100)}% completion rate` : "0%", trend: "up" as const },
          { label: "Behind schedule", value: String(behind.length), note: "Need intervention", trend: "down" as const },
          { label: "Avg. plan adherence", value: "-", note: "Across all processes", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.plan_id ?? i.id ?? "-", i.process ?? i.process_name ?? "-", i.order ?? i.order_no ?? "-", String(i.target ?? i.target_qty ?? 0), String(i.achieved ?? i.actual_qty ?? 0), i.status ?? "In progress"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="process-wise-production-planning" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
