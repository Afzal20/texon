"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getDevelopmentMonitoring } from "@/lib/api/production"

export default function ArtworkPrintingEmbroideryMonitoringPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getDevelopmentMonitoring().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalQty = items.reduce((s: number, i: any) => s + Number(i.quantity ?? i.qty ?? 0), 0)
      const totalCompleted = items.reduce((s: number, i: any) => s + Number(i.completed ?? i.completed_qty ?? 0), 0)
      setData({
        metrics: [
          { label: "Operations active", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Completed today", value: String(totalCompleted), note: `${totalQty ? Math.round(totalCompleted / totalQty * 100) : 0}% done`, trend: "up" as const },
          { label: "Pending", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting material", trend: "neutral" as const },
          { label: "In progress", value: String(items.filter((i: any) => String(i.status ?? "").toLowerCase() === "in_progress").length), note: "On floor now", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.style ?? "-", i.type ?? i.operation_type ?? "-", String(i.quantity ?? i.qty ?? ""), String(i.completed ?? i.completed_qty ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="artwork-printing-embroidery-monitoring" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
