"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getCuttingRecords } from "@/lib/api/production"

export default function CuttingSendingToLinePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getCuttingRecords().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalCut = items.reduce((s: number, i: any) => s + Number(i.cut_qty ?? i.quantity ?? 0), 0)
      const totalSent = items.reduce((s: number, i: any) => s + Number(i.sent_qty ?? i.sent ?? 0), 0)
      setData({
        metrics: [
          { label: "Cut today", value: `${totalCut} pcs`, note: "From API", trend: "up" as const },
          { label: "Sent to line", value: `${totalSent} pcs`, note: `${totalCut ? Math.round(totalSent / totalCut * 100) : 0}% dispatch rate`, trend: "up" as const },
          { label: "Pending dispatch", value: `${totalCut - totalSent} pcs`, note: "Awaiting bundling", trend: "neutral" as const },
          { label: "Sent to line", value: `${totalSent} pcs`, note: "Dispatched", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.style ?? "-", String(i.cut_qty ?? i.quantity ?? ""), String(i.sent_qty ?? i.sent ?? ""), String((i.cut_qty ?? i.quantity ?? 0) - (i.sent_qty ?? i.sent ?? 0)), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="cutting-sending-to-line" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
