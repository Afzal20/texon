"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getCapacityBookings } from "@/lib/api/production"

export default function CapacityBookingAllocationPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getCapacityBookings().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const allocated = items.filter((i: any) => (i.status ?? "").toLowerCase() !== "unallocated" && (i.status ?? "").toLowerCase() !== "available")
      const conflicts = items.filter((i: any) => (i.status ?? "").toLowerCase() === "conflict")
      const totalLines = new Set(items.map((i: any) => i.line ?? i.line_number ?? i.line_name).filter(Boolean))
      setData({
        metrics: [
          { label: "Lines allocated", value: `${allocated.length} / ${totalLines.size || items.length}`, note: `${items.length ? Math.round(allocated.length / items.length * 100) : 0}% utilization`, trend: "up" as const },
          { label: "Booking conflicts", value: String(conflicts.length), note: "Need rescheduling", trend: "down" as const },
          { label: "Unallocated lines", value: String(items.length - allocated.length), note: "Available next week", trend: "neutral" as const },
          { label: "Capacity efficiency", value: "-", note: "Monthly average", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? i.line_name ?? i.line_number ?? "-", i.order ?? i.order_no ?? i.po ?? "-", i.buyer ?? "-", i.style ?? i.style_name ?? "-", i.allocated ?? i.allocated_date ?? "-", i.status ?? "Unallocated"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="capacity-booking-allocation" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
