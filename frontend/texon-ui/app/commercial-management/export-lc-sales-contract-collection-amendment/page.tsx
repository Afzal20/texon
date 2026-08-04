"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getLcs } from "@/lib/api/commercial"

export default function ExportLCSalesContractPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getLcs({ lc_type: "export" })
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const totalValue = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const active = items.filter((i: any) => i.status === "issued").length
        const amended = items.filter((i: any) => i.status === "amended").length
        const expired = items.filter((i: any) => i.status === "expired").length

        setData({
          metrics: [
            { label: "Active LCs", value: String(active), note: `Total LC value $${totalValue.toLocaleString()}`, trend: "neutral" as const },
            { label: "Pending amendment", value: String(amended), note: "Under review", trend: "down" as const },
            { label: "LCs matured", value: String(expired), note: "Ready for negotiation", trend: "up" as const },
            { label: "Compliance rate", value: items.length ? `${Math.round((active / items.length) * 100)}%` : "0%", note: "Documents accepted first time", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.lc_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.amount ? `$${Number(i.amount).toLocaleString()}` : `-`,
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
      module="export-lc-sales-contract-collection-amendment"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
