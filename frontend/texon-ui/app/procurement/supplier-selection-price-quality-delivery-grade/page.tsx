"use client"

import * as React from "react"
import { ProcurementWorkspace } from "../procurement-workspace"
import { getSuppliers } from "@/lib/api/procurement"

export default function SupplierSelectionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSuppliers().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const topRated = items.filter((i: any) => (i.grade === "A" || Number(i.score) >= 8.5)).length
      const avgScore = items.reduce((s: number, i: any) => s + Number(i.score ?? 0), 0) / items.length
      setData({
        metrics: [
          { label: "Suppliers evaluated", value: String(items.length), note: "Active supplier pool", trend: "neutral" as const },
          { label: "Avg. score", value: `${avgScore.toFixed(1)} / 10`, note: "Across all criteria", trend: "up" as const },
          { label: "Top rated", value: String(topRated), note: "Score > 8.5", trend: "up" as const },
          { label: "Under review", value: String(items.filter((i: any) => i.status === "under_review" || i.status === "review").length), note: "Performance decline", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.supplier_name ?? "-", i.price_score ?? i.price ?? "-", i.quality_score ?? i.quality ?? "-", i.delivery_score ?? i.delivery ?? "-", i.grade ?? "-", i.score ? String(i.score) : "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProcurementWorkspace module="supplier-selection-price-quality-delivery-grade" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
