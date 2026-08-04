"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getLcs, getShipments } from "@/lib/api/commercial"

export default function ImportManagementPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    Promise.all([getLcs({ lc_type: "import" }), getShipments()])
      .then(([lcsRes, shipmentsRes]) => {
        const lcs = Array.isArray(lcsRes.data?.results) ? lcsRes.data.results : Array.isArray(lcsRes.data) ? lcsRes.data : []
        const shipments = Array.isArray(shipmentsRes.data?.results) ? shipmentsRes.data.results : Array.isArray(shipmentsRes.data) ? shipmentsRes.data : []
        const items = [...lcs, ...shipments] as Record<string, unknown>[]
        setRawItems(items)

        const totalValue = lcs.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const inTransit = shipments.filter((i: any) => i.status === "in_transit" || i.status === "shipped").length
        const pendingClearance = shipments.filter((i: any) => i.status === "arrived").length

        setData({
          metrics: [
            { label: "Active imports", value: String(lcs.length), note: `Total LC value $${totalValue.toLocaleString()}`, trend: "neutral" as const },
            { label: "In transit", value: String(inTransit), note: "Shipments en route", trend: "up" as const },
            { label: "Pending clearance", value: String(pendingClearance), note: "Awaiting documents", trend: "down" as const },
            { label: "Value this month", value: `$${(totalValue / 1000).toFixed(1)}K`, note: "Total import value", trend: "up" as const },
          ],
          rows: lcs.slice(0, 4).map((i: any) => [
            i.lc_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.lc_number ?? `-`,
            i.issue_date ?? `-`,
            i.expiry_date ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="import-management"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
