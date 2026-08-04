"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getInvoices } from "@/lib/api/commercial"

export default function RealizationFollowUpPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getInvoices()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const totalValue = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const paid = items.filter((i: any) => i.status === "paid")
        const paidValue = paid.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const pending = items.filter((i: any) => i.status === "approved" || i.status === "submitted").length

        setData({
          metrics: [
            { label: "Realizations tracked", value: String(items.length), note: "This month", trend: "up" as const },
            { label: "Pending realization", value: String(pending), note: `$${(totalValue - paidValue).toLocaleString()} awaiting`, trend: "neutral" as const },
            { label: "Realized value", value: `$${(paidValue / 1000000).toFixed(1)}M`, note: items.length ? `${Math.round((paid.length / items.length) * 100)}% of invoiced` : "0%", trend: "up" as const },
            { label: "Avg. days to realize", value: "28 days", note: "Below 35-day target", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.invoice_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.invoice_number ?? `-`,
            i.amount ? `$${Number(i.amount).toLocaleString()}` : `-`,
            i.invoice_date ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="realization-follow-up"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
