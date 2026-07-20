"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getCapacityBookings } from "@/lib/api/production"
import { getStyles } from "@/lib/api/merchandising"

const fmtCount = (n: number) => n.toLocaleString()

export default function CapacityBookingAllocationPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getCapacityBookings(),
      getStyles(),
    ]).then(([bookRes, styleRes]) => {
      const items = Array.isArray(bookRes.data?.results) ? bookRes.data.results : Array.isArray(bookRes.data) ? bookRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const allocated = items.filter((i: any) => i.status === "allocated")
      const inUse = items.filter((i: any) => i.status === "in_use")
      const released = items.filter((i: any) => i.status === "released")
      const lines = new Set(items.map((i: any) => i.line))
      setData({
        metrics: [
          { label: "Total bookings", value: fmtCount(items.length), note: `Across ${lines.size} lines`, trend: "neutral" as const },
          { label: "In use", value: fmtCount(inUse.length), note: "Lines currently active", trend: "up" as const },
          { label: "Allocated", value: fmtCount(allocated.length), note: "Scheduled but not started", trend: "neutral" as const },
          { label: "Released", value: fmtCount(released.length), note: "Capacity freed", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.line ?? "-",
          `Booking #${i.id}`,
          styleMap.get(i.style) ?? `Style #${i.style}`,
          `${i.capacity_per_day ?? 0} pcs`,
          i.booking_date ?? "-",
          i.status === "in_use" ? "Running" : i.status === "released" ? "Released" : "Scheduled",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="capacity-booking-allocation" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/capacity-booking-allocation/${row[row.length - 1]}`} rawItems={rawItems} />
}
