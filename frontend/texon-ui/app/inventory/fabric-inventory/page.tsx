"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getFabrics } from "@/lib/api/inventory"

export default function FabricInventoryPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFabrics().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalMeters = items.reduce((s: number, i: any) => s + Number(i.meters ?? i.quantity ?? 0), 0)
      const totalRolls = items.reduce((s: number, i: any) => s + Number(i.rolls ?? 0), 0)
      setData({
        metrics: [
          { label: "Total fabric in stock", value: `${totalMeters.toLocaleString()} m`, note: "From API", trend: "up" as const },
          { label: "Rolls available", value: String(totalRolls), note: "In stock", trend: "up" as const },
          { label: "Fabric types", value: String(items.length), note: "Active SKUs", trend: "neutral" as const },
          { label: "Low-stock SKUs", value: String(items.filter((i: any) => i.status === "low" || i.status === "Low" || i.status === "critical").length), note: "Below reorder point", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.fabric_name ?? "-", i.color ?? "-", String(i.rolls ?? ""), String(i.meters ?? i.quantity ?? ""), i.warehouse ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="fabric-inventory" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
