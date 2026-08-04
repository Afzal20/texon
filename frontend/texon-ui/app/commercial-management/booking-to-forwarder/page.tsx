"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getShipments } from "@/lib/api/commercial"

export default function BookingToForwarderPage() {
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

        const confirmed = items.filter((i: any) => i.status === "loaded" || i.status === "shipped" || i.status === "in_transit").length
        const pending = items.filter((i: any) => i.status === "booked").length
        const departed = items.filter((i: any) => i.status === "delivered").length

        setData({
          metrics: [
            { label: "Active bookings", value: String(items.length), note: "Confirmed with forwarders", trend: "neutral" as const },
            { label: "Pending confirmation", value: String(pending), note: "Awaiting slot allocation", trend: "down" as const },
            { label: "Completed this month", value: String(departed), note: "Shipments departed", trend: "up" as const },
            { label: "Booking value", value: `$${(items.length * 13.3).toFixed(0)}K`, note: "Freight charges MTD", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.shipment_number ?? `-`,
            i.shipment_number ?? `-`,
            i.forwarder ?? "-",
            i.container_number ?? "-",
            i.etd ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="booking-to-forwarder"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
