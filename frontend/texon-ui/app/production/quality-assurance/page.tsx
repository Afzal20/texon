"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getDefectCategories } from "@/lib/api/quality"

export default function QualityAssurancePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getDefectCategories().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalDefects = items.reduce((s: number, i: any) => s + Number(i.count ?? i.defect_count ?? 0), 0)
      setData({
        metrics: [
          { label: "Defect categories", value: String(items.length), note: "Tracked", trend: "neutral" as const },
          { label: "Total defects", value: String(totalDefects), note: "From API", trend: "down" as const },
          { label: "Major defects", value: String(items.filter((i: any) => i.severity === "major" || i.severity === "Major").reduce((s: number, i: any) => s + Number(i.count ?? i.defect_count ?? 0), 0)), note: "Needs attention", trend: "down" as const },
          { label: "Minor defects", value: String(items.filter((i: any) => ["minor", "Minor"].includes(String(i.severity ?? ""))).reduce((s: number, i: any) => s + Number(i.count ?? i.defect_count ?? 1), 0)), note: "Low severity", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.category ?? i.name ?? "-", i.line ?? "-", String(i.count ?? i.defect_count ?? ""), i.severity ?? "-", i.order ?? "-", i.trend ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="quality-assurance" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
