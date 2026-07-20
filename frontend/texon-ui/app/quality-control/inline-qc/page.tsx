"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { getInlineQc } from "@/lib/api/quality"

export default function InlineQCPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getInlineQc().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const passed = items.filter((i: any) => i.status === "pass" || i.status === "Pass").length
      setData({
        metrics: [
          { label: "Inspections today", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Pass rate", value: items.length ? `${Math.round(passed / items.length * 100)}%` : "0%", note: "Above 95% target", trend: "up" as const },
          { label: "Defects found", value: String(items.reduce((s: number, i: any) => s + Number(i.defects ?? i.defect_count ?? 0), 0)), note: "From API", trend: "down" as const },
          { label: "Open CARs", value: "3", note: "Corrective actions", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.inspection_no ?? i.id ?? "-", i.line ?? "-", i.checkpoint ?? i.stage ?? "-", String(i.sample ?? i.sample_size ?? ""), String(i.defects ?? i.defect_count ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <QualityControlWorkspace module="inline-qc" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
