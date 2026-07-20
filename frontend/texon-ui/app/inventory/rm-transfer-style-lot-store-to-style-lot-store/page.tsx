"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getStockMovements } from "@/lib/api/inventory"

export default function RmTransferStyleLotStoreToStyleLotStorePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getStockMovements().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      setData({
        metrics: [
          { label: "Transfers today", value: String(items.length), note: "Between locations", trend: "neutral" as const },
          { label: "Pending transfers", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting approval", trend: "neutral" as const },
          { label: "Completed", value: String(items.filter((i: any) => i.status === "complete" || i.status === "Complete" || i.status === "completed").length), note: "Successful", trend: "up" as const },
          { label: "Completion rate", value: items.length ? `${Math.round(items.filter((i: any) => i.status === "complete" || i.status === "Complete").length / items.length * 100)}%` : "0%", note: "From API", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.transfer_no ?? i.id ?? "-", i.material ?? "-", i.from_location ?? i.from ?? "-", i.to_location ?? i.to ?? "-", String(i.quantity ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="rm-transfer-style-lot-store-to-style-lot-store" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
