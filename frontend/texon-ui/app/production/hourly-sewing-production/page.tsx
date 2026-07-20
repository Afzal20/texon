"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getSewingRecords } from "@/lib/api/production"

export default function HourlySewingProductionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSewingRecords().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalOutput = items.reduce((s: number, i: any) => s + Number(i.output_qty ?? i.quantity ?? 0), 0)
      setData({
        metrics: [
          { label: "Today's output", value: `${totalOutput} pcs`, note: "From API", trend: "up" as const },
          { label: "Hourly avg.", value: `${Math.round(totalOutput / Math.max(1, items.length))} pcs`, note: "Per line average", trend: "up" as const },
          { label: "Target", value: `${items.reduce((s: number, i: any) => s + Number(i.target ?? 0), 0)} pcs`, note: "From API", trend: "neutral" as const },
          { label: "Efficiency", value: `${items.length > 0 ? Math.round(items.filter((i: any) => i.status === "on_target" || i.status === "On target").length / items.length * 100) : 0}%`, note: "Lines on target", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? "-", i.hour ?? i.time_range ?? "-", String(i.target ?? ""), String(i.output_qty ?? i.actual ?? i.quantity ?? ""), i.efficiency ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="hourly-sewing-production" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
