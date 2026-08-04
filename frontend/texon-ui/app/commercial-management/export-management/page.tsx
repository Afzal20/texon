"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getShipments } from "@/lib/api/commercial"

export default function ExportManagementPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getShipments()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const totalValue = items.reduce((s: number, i: any) => s + Number(i.gross_weight ?? 0), 0)
        const shipped = items.filter((i: any) => i.status === "shipped" || i.status === "delivered").length
        const pending = items.filter((i: any) => i.status === "booked" || i.status === "loaded").length

        setData({
          metrics: [
            { label: "Active exports", value: String(items.length), note: `Across all buyers`, trend: "neutral" as const },
            { label: "Shipped this month", value: String(shipped), note: "Departed shipments", trend: "up" as const },
            { label: "Pending shipment", value: String(pending), note: "Awaiting departure", trend: "neutral" as const },
            { label: "On-time rate", value: items.length ? `${Math.round((shipped / items.length) * 100)}%` : "0%", note: "Against committed dates", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.shipment_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.purchase_order?.po_no ?? i.purchase_order ?? `-`,
            i.shipment_date ?? `-`,
            i.gross_weight ? `${i.gross_weight} kg` : `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="export-management"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
