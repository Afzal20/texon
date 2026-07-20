"use client"

import * as React from "react"
import { ProcurementWorkspace } from "../procurement-workspace"
import { getPurchaseOrders } from "@/lib/api/procurement"

export default function RawMaterialsRequisitionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getPurchaseOrders().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const approved = items.filter((i: any) => i.status === "approved" || i.status === "Approved" || i.status === "confirmed").length
      setData({
        metrics: [
          { label: "Requisitions raised", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Approved", value: String(approved), note: `${items.length ? Math.round(approved / items.length * 100) : 0}% approval rate`, trend: "up" as const },
          { label: "Pending approval", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending" || i.status === "draft").length), note: "Awaiting manager", trend: "neutral" as const },
          { label: "Rejected", value: String(items.filter((i: any) => i.status === "rejected" || i.status === "Rejected").length), note: "Insufficient stock", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.po_no ?? i.id ?? "-", i.order ?? i.order_no ?? "-", i.material ?? i.item ?? "-", String(i.quantity ?? ""), i.requested_at ?? i.created_at ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProcurementWorkspace module="raw-materials-requisition" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
