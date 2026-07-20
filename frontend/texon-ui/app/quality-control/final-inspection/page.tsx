"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { getFinalInspections } from "@/lib/api/quality"

export default function FinalInspectionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFinalInspections().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const passed = items.filter((i: any) => i.status === "pass" || i.status === "Pass").length
      setData({
        metrics: [
          { label: "Inspections scheduled", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Completed", value: String(passed + items.filter((i: any) => i.status === "fail" || i.status === "Fail").length), note: "Done", trend: "up" as const },
          { label: "AQL pass rate", value: items.length ? `${Math.round(passed / items.length * 100)}%` : "0%", note: "From API", trend: "up" as const },
          { label: "Pending sign-off", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending" || i.status === "scheduled").length), note: "Awaiting buyer", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.buyer ?? "-", String(i.sample ?? i.sample_size ?? ""), String(i.defects ?? i.defect_count ?? ""), i.aql ?? i.aql_level ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <QualityControlWorkspace module="final-inspection" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
