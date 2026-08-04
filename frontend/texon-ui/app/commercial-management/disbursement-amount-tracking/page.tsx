"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getInvoices, getAccountsPayable } from "@/lib/api/commercial"

export default function DisbursementTrackingPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    Promise.all([getInvoices(), getAccountsPayable()])
      .then(([invoicesRes, apRes]) => {
        const invoices = Array.isArray(invoicesRes.data?.results) ? invoicesRes.data.results : Array.isArray(invoicesRes.data) ? invoicesRes.data : []
        const ap = Array.isArray(apRes.data?.results) ? apRes.data.results : Array.isArray(apRes.data) ? apRes.data : []
        const items = [...invoices, ...ap] as Record<string, unknown>[]
        setRawItems(items)

        const totalValue = invoices.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
        const disbursed = invoices.filter((i: any) => i.status === "paid").length
        const pending = invoices.filter((i: any) => i.status === "draft" || i.status === "submitted").length

        setData({
          metrics: [
            { label: "Disbursements tracked", value: String(invoices.length), note: "This month", trend: "up" as const },
            { label: "Pending approval", value: String(pending), note: "Awaiting approval", trend: "neutral" as const },
            { label: "Disbursed value", value: `$${(totalValue / 1000000).toFixed(1)}M`, note: "Total MTD", trend: "up" as const },
            { label: "Budget utilization", value: invoices.length ? `${Math.round((disbursed / invoices.length) * 100)}%` : "0%", note: "Against monthly budget", trend: "up" as const },
          ],
          rows: invoices.slice(0, 4).map((i: any) => [
            i.invoice_number ?? `-`,
            i.notes ?? "General",
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
      module="disbursement-amount-tracking"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
