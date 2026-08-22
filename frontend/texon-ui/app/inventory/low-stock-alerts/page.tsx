"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getAccessories } from "@/lib/api/inventory"

export default function LowStockAlertsPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getAccessories({ status: "low" }).then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const critical = items.filter((i: any) => i.status === "critical" || i.status === "Critical").length
      setData({
        metrics: [
          { label: "Active alerts", value: String(items.length), note: "Below reorder point", trend: "down" as const },
          { label: "Critical alerts", value: String(critical), note: "Below safety stock", trend: "down" as const },
          { label: "Resolved", value: String(items.filter((i: any) => i.status === "resolved" || i.status === "Resolved").length), note: "Restocked", trend: "up" as const },
          { label: "Pending alerts", value: String(items.filter((i: any) => String(i.status ?? "").toLowerCase() === "pending").length), note: "Awaiting restock", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.alert_no ?? i.id ?? "-", i.name ?? i.item_name ?? "-", i.category ?? "-", String(i.in_stock ?? i.quantity ?? ""), String(i.reorder_point ?? ""), i.severity ?? i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="low-stock-alerts" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
