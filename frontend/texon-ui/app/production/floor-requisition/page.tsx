"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getFloorRequisitions } from "@/lib/api/inventory"

export default function FloorRequisitionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFloorRequisitions().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const fulfilled = items.filter((i: any) => i.status === "fulfilled" || i.status === "Fulfilled").length
      setData({
        metrics: [
          { label: "Requisitions today", value: String(items.length), note: "From shop floor", trend: "neutral" as const },
          { label: "Fulfilled", value: String(fulfilled), note: `${Math.round(fulfilled / items.length * 100)}% fulfillment`, trend: "up" as const },
          { label: "Pending", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting store dispatch", trend: "neutral" as const },
          { label: "Rejected", value: String(items.filter((i: any) => i.status === "rejected" || i.status === "Rejected").length), note: "Insufficient stock", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.requisition_no ?? i.id ?? "-", i.line ?? "-", i.material ?? "-", String(i.quantity ?? ""), i.requested_at ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="floor-requisition" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
