"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getLinePlans } from "@/lib/api/production"

export default function LadderPlanningPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getLinePlans().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const onTrack = items.filter((i: any) => {
        const target = Number(i.day_target ?? i.target_qty ?? 0)
        const actual = Number(i.day_actual ?? i.actual_qty ?? 0)
        return actual >= target
      })
      const behind = items.length - onTrack.length
      setData({
        metrics: [
          { label: "Active ladders", value: String(items.length), note: "Currently running", trend: "neutral" as const },
          { label: "On track", value: String(onTrack.length), note: items.length ? `${Math.round(onTrack.length / items.length * 100)}% adherence` : "0%", trend: "up" as const },
          { label: "Behind ladder", value: String(behind), note: "Need catch-up plan", trend: "down" as const },
          { label: "Avg. daily target", value: items.length ? `${Math.round(items.reduce((s: number, i: any) => s + Number(i.day_target ?? i.target_qty ?? 0), 0) / items.length)} pcs` : "-", note: "Per line average", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? i.line_name ?? "-", i.style ?? i.style_name ?? "-", String(i.day_target ?? i.target_qty ?? 0), String(i.day_actual ?? i.actual_qty ?? 0), String(i.cum_target ?? i.cumulative_target ?? 0), String(i.cum_actual ?? i.cumulative_actual ?? 0)]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="ladder-planning" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
