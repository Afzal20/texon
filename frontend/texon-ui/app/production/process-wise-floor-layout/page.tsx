"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getProductionLines } from "@/lib/api/production"

export default function ProcessWiseFloorLayoutPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getProductionLines().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const machines = items.reduce((s: number, i: any) => s + Number(i.machines ?? i.machine_count ?? 0), 0)
      setData({
        metrics: [
          { label: "Active layouts", value: String(items.length), note: "Configured lines", trend: "neutral" as const },
          { label: "Machines placed", value: String(machines), note: "Across all lines", trend: "neutral" as const },
          { label: "Lines covered", value: String(new Set(items.map((i: any) => String(i.line ?? ""))).size), note: "With placements", trend: "neutral" as const },
          { label: "Lines optimized", value: String(items.filter((i: any) => i.status === "optimized" || i.status === "Optimized").length), note: "From API", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.line_name ?? "-", i.process ?? "-", String(i.machines ?? i.machine_count ?? ""), String(i.operators ?? ""), i.capacity_per_day ?? i.capacity ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="process-wise-floor-layout" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
