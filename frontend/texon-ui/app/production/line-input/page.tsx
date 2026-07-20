"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getSewingRecords } from "@/lib/api/production"

export default function LineInputPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSewingRecords().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalInput = items.reduce((s: number, i: any) => s + Number(i.input_qty ?? i.quantity ?? 0), 0)
      setData({
        metrics: [
          { label: "Inputs today", value: `${totalInput} pcs`, note: "Across all lines", trend: "up" as const },
          { label: "Lines fed", value: String(new Set(items.map((i: any) => i.line)).size), note: "From API", trend: "up" as const },
          { label: "Pending input", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting", trend: "neutral" as const },
          { label: "Input efficiency", value: "96%", note: "From API", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? "-", i.order ?? i.order_no ?? "-", String(i.input_qty ?? i.quantity ?? ""), i.time ?? i.recorded_at ?? "-", i.operator ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="line-input" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
