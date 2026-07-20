"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getPhysicalInventories } from "@/lib/api/inventory"

export default function PhysicalInventoryWithPiBookingPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getPhysicalInventories().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const discrepancies = items.filter((i: any) => i.status === "discrepancy" || i.status === "Discrepancy").length
      setData({
        metrics: [
          { label: "Pending PI counts", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Scheduled", trend: "neutral" as const },
          { label: "Completed counts", value: String(items.filter((i: any) => i.status === "verified" || i.status === "Verified" || i.status === "complete").length), note: "This month", trend: "up" as const },
          { label: "Discrepancies found", value: String(discrepancies), note: "Qty mismatch", trend: "down" as const },
          { label: "Accuracy rate", value: items.length ? `${Math.round((1 - discrepancies / items.length) * 100)}%` : "0%", note: "Physical vs system", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.pi_no ?? i.id ?? "-", i.location ?? "-", i.date ?? i.count_date ?? "-", i.variance ?? "-", i.value ? `$${i.value}` : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="physical-inventory-with-pi-booking" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
