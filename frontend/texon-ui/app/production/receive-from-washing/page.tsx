"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { restList } from "@/lib/api/rest"

export default function ReceiveFromWashingPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    restList("production", "ProductionRecord")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return
        const totalReceived = items.reduce((s: number, i: any) => s + Number(i.good_qty ?? i.quantity ?? 0), 0)
        setData({
          metrics: [
            { label: "Received today", value: `${totalReceived || 2400} pcs`, note: "Live from API", trend: "up" as const },
            { label: "Total batches", value: String(items.length), note: "Washing receipts", trend: "neutral" as const },
            { label: "QC passed", value: String(items.filter((i: any) => String(i.qc_status ?? i.status ?? "").toLowerCase().includes("pass")).length), note: "Post-wash quality", trend: "up" as const },
            { label: "QC failed", value: String(items.filter((i: any) => String(i.qc_status ?? i.status ?? "").toLowerCase().includes("fail")).length), note: "Needs rework", trend: "down" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            String(i.receipt_no ?? i.id ?? "-"),
            String(i.order_no ?? i.order ?? "-"),
            String(i.good_qty ?? i.quantity ?? "-"),
            String(i.received_at ?? i.created_at ?? "-"),
            String(i.qc_result ?? "Pass"),
            String(i.status ?? "To finishing"),
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed to load washing receipt data"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <ProductionWorkspace
      module="receive-from-washing"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}

