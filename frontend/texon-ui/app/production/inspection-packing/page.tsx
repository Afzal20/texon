"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getEndlineQc } from "@/lib/api/quality"

export default function InspectionPackingPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getEndlineQc().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalInspected = items.reduce((s: number, i: any) => s + Number(i.inspected ?? 0), 0)
      const totalPass = items.reduce((s: number, i: any) => s + Number(i.pass ?? i.passed ?? 0), 0)
      setData({
        metrics: [
          { label: "Inspections", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Inspected today", value: `${totalInspected} pcs`, note: "Across orders", trend: "up" as const },
          { label: "Pass rate", value: `${totalInspected ? Math.round(totalPass / totalInspected * 100) : 0}%`, note: "First-time pass", trend: "up" as const },
          { label: "Rejections", value: String(totalInspected - totalPass), note: "Needs rework", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.buyer ?? "-", String(i.inspected ?? ""), i.inspector ?? "-", i.pass ? (i.fail ? (Number(i.fail) > 0 ? "Rework" : "Pass") : "Pass") : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="inspection-packing" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
