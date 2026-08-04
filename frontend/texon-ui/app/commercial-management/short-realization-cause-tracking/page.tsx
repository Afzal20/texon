"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getInvoices } from "@/lib/api/commercial"

export default function ShortRealizationPage() {
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
        const shortfalls = items.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").length

        setData({
          metrics: [
            { label: "Shortfalls tracked", value: String(shortfalls), note: "This month", trend: "down" as const },
            { label: "Total shortfall", value: `$${((totalValue - paidValue) / 1000).toFixed(1)}K`, note: "Across buyers", trend: "down" as const },
            { label: "Resolved", value: String(paid.length), note: "Amount recovered", trend: "up" as const },
            { label: "Recovery rate", value: totalValue > 0 ? `${Math.round((paidValue / totalValue) * 100)}%` : "0%", note: "Of total invoiced", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.invoice_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.invoice_number ?? `-`,
            i.amount ? `$${Number(i.amount).toLocaleString()}` : `-`,
            i.notes ?? "-",
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="short-realization-cause-tracking"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
