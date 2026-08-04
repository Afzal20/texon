"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getShipments } from "@/lib/api/commercial"

export default function AcceptanceClearancePage() {
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

        const cleared = items.filter((i: any) => i.status === "delivered").length
        const inProgress = items.filter((i: any) => i.status === "arrived" || i.status === "in_transit").length
        const onHold = items.filter((i: any) => i.status === "booked").length

        setData({
          metrics: [
            { label: "Pending clearance", value: String(inProgress), note: "Awaiting acceptance", trend: "neutral" as const },
            { label: "Cleared this month", value: String(cleared), note: "Completed clearance", trend: "up" as const },
            { label: "On hold", value: String(onHold), note: "Document issues", trend: "down" as const },
            { label: "Clearance rate", value: items.length ? `${Math.round((cleared / items.length) * 100)}%` : "0%", note: "Within target time", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.shipment_number ?? `-`,
            i.shipment_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.container_number ?? "-",
            i.shipment_date ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="acceptance-clearance"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
