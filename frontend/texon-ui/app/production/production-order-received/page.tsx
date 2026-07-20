"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getProductionOrders } from "@/lib/api/production"

export default function ProductionOrderReceivedPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getProductionOrders().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const pending = items.filter((i: any) => i.status === "pending" || i.status === "Pending").length
      const executing = items.filter((i: any) => i.status === "in_execution" || i.status === "allocated").length
      setData({
        metrics: [
          { label: "Orders received", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Pending allocation", value: String(pending), note: "Awaiting line assignment", trend: "neutral" as const },
          { label: "In execution", value: String(executing), note: "On shop floor", trend: "up" as const },
          { label: "Completed", value: String(items.filter((i: any) => i.status === "completed" || i.status === "Complete").length), note: "From API", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.po_number ?? "-", i.buyer ?? "-", i.style ?? "-", String(i.quantity ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="production-order-received" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
