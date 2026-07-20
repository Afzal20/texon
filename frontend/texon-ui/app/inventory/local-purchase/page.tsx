"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getPurchaseOrders } from "@/lib/api/procurement"

export default function LocalPurchasePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getPurchaseOrders().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalValue = items.reduce((s: number, i: any) => s + Number(i.amount ?? i.total ?? 0), 0)
      setData({
        metrics: [
          { label: "Active POs", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Delivered", value: String(items.filter((i: any) => i.status === "delivered" || i.status === "Delivered" || i.status === "received").length), note: "Completed", trend: "up" as const },
          { label: "Pending delivery", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending" || i.status === "in_transit").length), note: "Awaiting supply", trend: "neutral" as const },
          { label: "Total spend", value: `$${totalValue.toLocaleString()}`, note: "From API", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.po_no ?? i.id ?? "-", i.supplier ?? "-", i.material ?? i.item ?? "-", String(i.quantity ?? ""), i.amount ? `$${i.amount}` : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="local-purchase" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
