"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getShipments } from "@/lib/api/commercial"

export default function ShipmentMonitoringPage() {
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

        const onSchedule = items.filter((i: any) => i.status !== "arrived" && i.status !== "delivered").length
        const delayed = items.filter((i: any) => i.status === "arrived").length
        const arrived = items.filter((i: any) => i.status === "delivered").length

        setData({
          metrics: [
            { label: "Shipments tracked", value: String(items.length), note: "Active shipments", trend: "neutral" as const },
            { label: "On schedule", value: String(onSchedule), note: "En route", trend: "up" as const },
            { label: "Delayed shipments", value: String(delayed), note: "Needs attention", trend: "down" as const },
            { label: "ETA accuracy", value: items.length ? `${Math.round(((items.length - delayed) / items.length) * 100)}%` : "0%", note: "Forecast vs actual", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.shipment_number ?? `-`,
            i.port_of_loading ?? `-`,
            `${i.port_of_loading ?? "?"} → ${i.port_of_discharge ?? "?"}`,
            i.forwarder ?? `-`,
            i.eta ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="shipment-monitoring-eta-updates"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
