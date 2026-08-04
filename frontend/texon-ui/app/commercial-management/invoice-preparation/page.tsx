"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getInvoices } from "@/lib/api/commercial"

export default function InvoicePreparationPage() {
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
        const approved = items.filter((i: any) => i.status === "approved" || i.status === "paid").length
        const pending = items.filter((i: any) => i.status === "submitted").length
        const draft = items.filter((i: any) => i.status === "draft").length

        setData({
          metrics: [
            { label: "Invoices prepared", value: String(items.length), note: "This month", trend: "up" as const },
            { label: "Pending review", value: String(pending), note: "Awaiting approval", trend: "neutral" as const },
            { label: "Invoiced value", value: `$${(totalValue / 1000000).toFixed(1)}M`, note: "Total invoiced MTD", trend: "up" as const },
            { label: "Error rate", value: items.length ? `${Math.round((draft / items.length) * 100)}%` : "0%", note: "Draft ratio", trend: "up" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            i.invoice_number ?? `-`,
            i.buyer?.name ?? i.buyer ?? `-`,
            i.purchase_order?.po_no ?? i.purchase_order ?? `-`,
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
      module="invoice-preparation"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
