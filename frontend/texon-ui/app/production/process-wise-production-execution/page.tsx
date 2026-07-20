"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getProductionPlans } from "@/lib/api/production"

export default function ProcessWiseProductionExecutionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getProductionPlans().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalAchieved = items.reduce((s: number, i: any) => s + Number(i.achieved ?? i.actual_qty ?? 0), 0)
      setData({
        metrics: [
          { label: "Today's output", value: `${totalAchieved} pcs`, note: "Across all processes", trend: "up" as const },
          { label: "Target achievement", value: `${Math.round(totalAchieved / Math.max(1, items.reduce((s: number, i: any) => s + Number(i.target ?? i.planned_qty ?? 0), 0)) * 100)}%`, note: "Overall", trend: "up" as const },
          { label: "Processes active", value: String(items.length), note: "Running", trend: "neutral" as const },
          { label: "On track", value: String(items.filter((i: any) => i.status === "on_track" || i.status === "exceeded").length), note: "Meeting target", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.process ?? "-", String(i.target ?? i.planned_qty ?? ""), String(i.achieved ?? i.actual_qty ?? ""), i.efficiency ?? "-", i.defects ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="process-wise-production-execution" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
