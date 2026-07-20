"use client"

import * as React from "react"
import { ProcurementWorkspace } from "../procurement-workspace"
import { getPurchaseOrders } from "@/lib/api/procurement"

export default function ProcurementManagementPage() {
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
          { label: "Active POs", value: String(items.length), note: `Total value $${totalValue.toLocaleString()}`, trend: "neutral" as const },
          { label: "POs issued", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Pending approval", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending" || i.status === "draft").length), note: `$${items.filter((i: any) => i.status === "pending" || i.status === "draft").reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0).toLocaleString()} value`, trend: "down" as const },
          { label: "PO completion", value: items.length ? `${Math.round(items.filter((i: any) => i.status === "delivered" || i.status === "received" || i.status === "complete").length / items.length * 100)}%` : "0%", note: "On-time delivery", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.po_no ?? i.id ?? "-", i.supplier ?? "-", i.material ?? i.item ?? "-", i.amount ? `$${i.amount}` : "-", i.delivery_date ?? i.expected_date ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProcurementWorkspace module="procurement-management" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
