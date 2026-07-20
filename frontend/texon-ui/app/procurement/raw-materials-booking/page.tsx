"use client"

import * as React from "react"
import { ProcurementWorkspace } from "../procurement-workspace"
import { getSuppliers } from "@/lib/api/procurement"

export default function RawMaterialsBookingPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSuppliers().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const topRated = items.filter((i: any) => (i.grade === "A" || i.score >= 8.5)).length
      setData({
        metrics: [
          { label: "Active bookings", value: String(items.length), note: "Across suppliers", trend: "neutral" as const },
          { label: "Suppliers", value: String(items.length), note: "Registered", trend: "neutral" as const },
          { label: "Top rated", value: String(topRated), note: "Grade A", trend: "up" as const },
          { label: "Pending confirmation", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting supplier", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.supplier_code ?? i.id ?? "-", i.name ?? i.supplier_name ?? "-", i.material ?? i.category ?? "-", i.contact_person ?? "-", i.delivery_lead_time ? `${i.delivery_lead_time} days` : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProcurementWorkspace module="raw-materials-booking" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
