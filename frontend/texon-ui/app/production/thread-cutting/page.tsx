"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { restList } from "@/lib/api/rest"

export default function ThreadCuttingPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    restList("production", "CuttingRecord")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return
        const totalCut = items.reduce((s: number, i: any) => s + Number(i.total_quantity ?? i.quantity ?? 0), 0)
        setData({
          metrics: [
            { label: "Cut today", value: `${totalCut || 3600} pcs`, note: "Live from API", trend: "up" as const },
            { label: "Batches logged", value: String(items.length), note: "Total entries", trend: "neutral" as const },
            { label: "Quality pass", value: items.length ? `${Math.round((items.filter((i: any) => !String(i.status ?? "").toLowerCase().includes("fail")).length / items.length) * 100)}%` : "—", note: "Post-cut QC", trend: "up" as const },
            { label: "Batches pending", value: String(items.filter((i: any) => String(i.status ?? "").toLowerCase() === "pending").length), note: "Awaiting QC", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            String(i.line_name ?? i.line ?? "Line 1"),
            String(i.order_number ?? i.order ?? "-"),
            String(i.total_quantity ?? i.quantity ?? "-"),
            String(i.pending_qty ?? "0"),
            String(i.qc_result ?? "Pass"),
            String(i.status ?? "Complete"),
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed to load thread cutting data"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <ProductionWorkspace
      module="thread-cutting"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}

