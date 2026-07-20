"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getTrims } from "@/lib/api/inventory"

export default function TrimsInventoryPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getTrims().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const lowStock = items.filter((i: any) => i.status === "low" || i.status === "Low" || i.status === "critical").length
      setData({
        metrics: [
          { label: "Total trims SKUs", value: String(items.length), note: "Active items", trend: "neutral" as const },
          { label: "In stock", value: String(items.reduce((s: number, i: any) => s + Number(i.in_stock ?? i.quantity ?? 0), 0)), note: "Total units", trend: "neutral" as const },
          { label: "Categories", value: String(new Set(items.map((i: any) => i.type ?? i.category)).size), note: "Distinct", trend: "neutral" as const },
          { label: "Low-stock items", value: String(lowStock), note: "Below reorder point", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.trim_name ?? "-", i.type ?? i.category ?? "-", String(i.in_stock ?? i.quantity ?? ""), i.unit ?? "-", String(i.reorder_point ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="trims-inventory" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
