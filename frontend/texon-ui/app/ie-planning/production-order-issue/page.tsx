"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getProductionOrders } from "@/lib/api/production"

export default function ProductionOrderIssuePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getProductionOrders().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const issued = items.filter((i: any) => (i.status ?? "").toLowerCase() === "issued")
      const pending = items.filter((i: any) => (i.status ?? "").toLowerCase() === "pending")
      setData({
        metrics: [
          { label: "Orders issued", value: String(issued.length), note: "This month", trend: "up" as const },
          { label: "Pending issuance", value: String(pending.length), note: "Awaiting material confirmation", trend: "neutral" as const },
          { label: "Issued value", value: "-", note: "Total order value", trend: "up" as const },
          { label: "Avg. issuance time", value: "-", note: "From PO to shop floor", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.po ?? i.purchase_order ?? "-", i.buyer ?? "-", i.style ?? i.style_name ?? "-", String(i.qty ?? i.quantity ?? 0), i.status ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="production-order-issue" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
