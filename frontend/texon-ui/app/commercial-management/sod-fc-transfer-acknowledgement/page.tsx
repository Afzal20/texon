"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getSodFcTransfers } from "@/lib/api/commercial"

export default function SODFCTransferPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSodFcTransfers()
      .then((res) => {
        const items = (Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []) as Record<string, unknown>[]
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const pending = items.filter((i: Record<string, unknown>) => i.status === "pending")
        const acknowledged = items.filter((i: Record<string, unknown>) => i.status === "acknowledged").length
        const totalValue = items.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.amount ?? 0) || 0), 0)
        const fmtMoney = (v: number) => `$${Math.round(v).toLocaleString()}`

        setData({
          metrics: [
            { label: "Transfers tracked", value: String(items.length), note: "All records", trend: "neutral" as const },
            { label: "Pending acknowledgement", value: String(pending.length), note: `${fmtMoney(pending.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.amount ?? 0) || 0), 0))} awaiting`, trend: "down" as const },
            { label: "Acknowledged", value: `${items.length ? Math.round((acknowledged / items.length) * 100) : 0}%`, note: `${acknowledged} of ${items.length} transfers`, trend: "up" as const },
            { label: "Transfer value", value: totalValue >= 1e6 ? `$${(totalValue / 1e6).toFixed(1)}M` : fmtMoney(totalValue), note: "Total recorded", trend: "up" as const },
          ],
          rows: items.slice(0, 8).map((i: Record<string, unknown>) => [
            String(i.transfer_number ?? "-"),
            String(i.transfer_type_display ?? i.transfer_type ?? "-"),
            String(i.bank_name ?? "-"),
            fmtMoney(Number(i.amount ?? 0)),
            String(i.transfer_date ?? "-"),
            String(i.status_display ?? i.status ?? "-"),
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="sod-fc-transfer-acknowledgement"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
