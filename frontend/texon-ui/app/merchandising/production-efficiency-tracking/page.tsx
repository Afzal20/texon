"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getPerformanceRecords } from "@/lib/api/performance"
import { getProductionLines } from "@/lib/api/production"

export default function ProductionEfficiencyTrackingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getPerformanceRecords(),
      getProductionLines(),
    ]).then(([perfRes, lineRes]) => {
      const items = Array.isArray(perfRes.data?.results) ? perfRes.data.results : Array.isArray(perfRes.data) ? perfRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const lineList = Array.isArray(lineRes.data?.results) ? lineRes.data.results : Array.isArray(lineRes.data) ? lineRes.data : []
      const lineMap = new Map(lineList.map((l: any) => [l.id, l.name ?? l.code ?? `Line #${l.id}`]))
      const efficiencyRecords = items.filter((i: any) => i.metric?.toLowerCase().includes("efficiency"))
      const avgEfficiency = efficiencyRecords.length
        ? efficiencyRecords.reduce((s: number, i: any) => s + Number(i.value ?? 0), 0) / efficiencyRecords.length
        : 0
      const linesBelowTarget = efficiencyRecords.filter((i: any) => i.target && Number(i.value ?? 0) < Number(i.target)).length
      setData({
        metrics: [
          { label: "Performance records", value: String(items.length), note: "All metrics", trend: "neutral" as const },
          { label: "Avg. efficiency", value: avgEfficiency.toFixed(1) + "%", note: "Across all records", trend: "up" as const },
          { label: "Lines below target", value: String(linesBelowTarget), note: "Needs attention", trend: "down" as const },
          { label: "Metrics tracked", value: String(new Set(items.map((i: any) => i.metric)).size), note: "Unique metric types", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          lineMap.get(i.production_line) ?? `Line #${i.production_line}`,
          i.style ? `Style #${i.style}` : "General",
          "-",
          i.target ? `${Math.round(Number(i.value ?? 0) / Number(i.target) * 100)}%` : "-",
          String(i.value ?? 0),
          i.target && Number(i.value ?? 0) >= Number(i.target) ? "On target" : "Below target",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="production-efficiency-tracking" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/production-efficiency-tracking/${row[row.length - 1]}`} rawItems={rawItems} />
}
