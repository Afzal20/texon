"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getFabricInspections } from "@/lib/api/inventory"

export default function InspectionSchedulePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFabricInspections().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const completed = items.filter((i: any) => i.status === "pass" || i.status === "Pass" || i.status === "complete" || i.status === "Complete").length
      setData({
        metrics: [
          { label: "Inspections scheduled", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Completed", value: String(completed), note: `${items.length ? Math.round(completed / items.length * 100) : 0}% completion`, trend: "up" as const },
          { label: "Pending", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending" || i.status === "scheduled").length), note: "Awaiting", trend: "neutral" as const },
          { label: "Failed", value: String(items.filter((i: any) => i.status === "fail" || i.status === "Fail").length), note: "Needs attention", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.lot_no ?? i.id ?? "-", i.order ?? i.order_no ?? "-", i.stage ?? i.inspection_type ?? "-", i.scheduled_date ?? i.date ?? "-", i.inspector ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="inspection-schedule" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
