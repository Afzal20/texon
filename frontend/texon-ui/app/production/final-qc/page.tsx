"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getFinalInspections } from "@/lib/api/quality"

export default function FinalQcPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFinalInspections().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalInspected = items.reduce((s: number, i: any) => s + Number(i.inspected ?? i.sample_size ?? 0), 0)
      const totalPass = items.reduce((s: number, i: any) => s + Number(i.pass ?? i.passed ?? 0), 0)
      const totalFail = items.reduce((s: number, i: any) => s + Number(i.fail ?? i.defects ?? 0), 0)
      setData({
        metrics: [
          { label: "Inspected today", value: `${totalInspected} pcs`, note: "From API", trend: "up" as const },
          { label: "Pass rate", value: `${totalInspected ? Math.round(totalPass / totalInspected * 100) : 0}%`, note: "First-time pass", trend: "up" as const },
          { label: "Rejections", value: `${totalFail} pcs`, note: `${totalInspected ? Math.round(totalFail / totalInspected * 100) : 0}% rejection`, trend: "down" as const },
          { label: "Failed checks", value: String(items.filter((i: any) => String(i.result ?? i.status ?? "").toLowerCase().includes("fail")).length), note: "From API", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", String(i.inspected ?? i.sample_size ?? ""), String(i.pass ?? i.passed ?? ""), String(i.fail ?? i.defects ?? ""), i.result ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="final-qc" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
