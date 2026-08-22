"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { getDefectCategories } from "@/lib/api/quality"

export default function DefectCategoryTrackingPage() {
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
      const majorDefects = items.filter((i: any) => i.severity === "major" || i.severity === "Major").reduce((s: number, i: any) => s + Number(i.count ?? i.defect_count ?? 0), 0)
      setData({
        metrics: [
          { label: "Total defects today", value: String(totalDefects), note: "From API", trend: "down" as const },
          { label: "Major defects", value: String(majorDefects), note: `${totalDefects ? Math.round(majorDefects / totalDefects * 100) : 0}% of total`, trend: "down" as const },
          { label: "Minor defects", value: String(totalDefects - majorDefects), note: "Remaining", trend: "neutral" as const },
          { label: "Categories tracked", value: String(new Set(items.map((i: any) => String(i.category ?? i.defect_category ?? ""))).size), note: "Distinct types", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.category ?? i.name ?? "-", i.line ?? "-", String(i.count ?? i.defect_count ?? ""), i.severity ?? "-", i.order ?? "-", i.trend ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <QualityControlWorkspace module="defect-category-tracking" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
