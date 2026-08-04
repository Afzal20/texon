"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getBillsOfExchange } from "@/lib/api/commercial"

export default function BillOfExchangePage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getBillsOfExchange()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const totalValue = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const negotiated = items.filter((i: any) => i.status === "negotiated" || i.status === "paid").length
        const underReview = items.filter((i: any) => i.status === "under_review" || i.status === "submitted").length
        const draft = items.filter((i: any) => i.status === "draft").length
        const rejected = items.filter((i: any) => i.status === "rejected").length

        const statusCounts: Record<string, number> = {}
        items.forEach((i: any) => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1 })

        const bankCounts: Record<string, number> = {}
        items.forEach((i: any) => { if (i.bank_name) bankCounts[i.bank_name] = (bankCounts[i.bank_name] || 0) + 1 })
        const topBank = Object.entries(bankCounts).sort((a, b) => b[1] - a[1])[0]

        setData({
          metrics: [
            { label: "Total documents", value: String(items.length), note: "All bills of exchange", trend: "neutral" as const },
            { label: "Total value", value: totalValue >= 1000000 ? `$${(totalValue / 1000000).toFixed(2)}M` : `$${(totalValue / 1000).toFixed(1)}K`, note: "Across all documents", trend: "up" as const },
            { label: "Negotiated / paid", value: String(negotiated), note: items.length ? `${Math.round((negotiated / items.length) * 100)}% completion rate` : "No data", trend: negotiated > 0 ? "up" as const : "neutral" as const },
            { label: topBank ? `Top bank: ${topBank[0]}` : "Banks used", value: topBank ? String(topBank[1]) : "0", note: `${Object.keys(bankCounts).length} bank(s) total`, trend: "neutral" as const },
          ],
          rows: items.map((i: any) => [
            i.bill_number ?? `-`,
            i.lc_detail?.lc_number ?? `LC-${i.lc ?? "-"}`,
            i.bank_name ?? "-",
            i.amount ? `$${Number(i.amount).toLocaleString()}` : `-`,
            i.issue_date ?? `-`,
            i.status ?? `-`,
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="bill-of-exchange-bank-document"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
