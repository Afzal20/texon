"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { getEndlineQc } from "@/lib/api/quality"

export default function EndLineQCPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getEndlineQc().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalInspected = items.reduce((s: number, i: any) => s + Number(i.inspected ?? 0), 0)
      const totalPass = items.reduce((s: number, i: any) => s + Number(i.pass ?? i.passed ?? 0), 0)
      setData({
        metrics: [
          { label: "Inspected today", value: `${totalInspected} pcs`, note: "From API", trend: "up" as const },
          { label: "First-pass rate", value: totalInspected ? `${Math.round(totalPass / totalInspected * 100)}%` : "0%", note: "From API", trend: "up" as const },
          { label: "Rejections", value: String(totalInspected - totalPass), note: "Needs rework", trend: "down" as const },
          { label: "Rework pending", value: String(items.filter((i: any) => i.status === "fail" || i.status === "Fail" || i.status === "rework").length), note: "Awaiting rework", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.line ?? "-", String(i.inspected ?? ""), String(i.pass ?? i.passed ?? ""), String(i.fail ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <QualityControlWorkspace module="end-line-qc" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
