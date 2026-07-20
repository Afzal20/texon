"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getShipments } from "@/lib/api/orders"

export default function BookingToForwarderPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getShipments().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalValue = items.reduce((s: number, i: any) => s + Number(i.amount ?? i.freight_value ?? 0), 0)
      setData({
        metrics: [
          { label: "Active bookings", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Confirmed", value: String(items.filter((i: any) => i.status === "confirmed" || i.status === "Confirmed").length), note: "Booked", trend: "up" as const },
          { label: "Pending confirmation", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting slot", trend: "down" as const },
          { label: "Freight value", value: `$${totalValue.toLocaleString()}`, note: "Total MTD", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.booking_no ?? i.id ?? "-", i.order ?? i.order_no ?? "-", i.forwarder ?? i.carrier ?? "-", i.etd ?? i.departure_date ?? "-", i.amount ? `$${i.amount}` : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="booking-to-forwarder" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
