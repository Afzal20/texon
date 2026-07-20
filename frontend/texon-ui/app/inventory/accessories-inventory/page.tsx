"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getAccessories } from "@/lib/api/inventory"

export default function AccessoriesInventoryPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getAccessories().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const lowStock = items.filter((i: any) => i.status === "low" || i.status === "Low" || i.status === "critical").length
      setData({
        metrics: [
          { label: "Total SKUs", value: String(items.length), note: "Active accessories", trend: "neutral" as const },
          { label: "In stock", value: String(items.reduce((s: number, i: any) => s + Number(i.in_stock ?? i.quantity ?? 0), 0)), note: "Total units", trend: "up" as const },
          { label: "Categories", value: String(new Set(items.map((i: any) => i.category)).size), note: "Distinct", trend: "neutral" as const },
          { label: "Low-stock items", value: String(lowStock), note: "Below reorder point", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.item_name ?? "-", i.category ?? "-", String(i.in_stock ?? i.quantity ?? ""), i.unit ?? "-", String(i.reorder_point ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="accessories-inventory" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
