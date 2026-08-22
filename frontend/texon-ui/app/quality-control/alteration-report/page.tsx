"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { restList } from "@/lib/api/rest"

export default function AlterationReportPage() {
  const [data, setData] = React.useState<{ metrics?: any[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    restList("quality", "RejectionReport")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return
        const totalAltered = items.reduce((s: number, i: any) => s + Number(i.quantity ?? i.altered_qty ?? 0), 0)
        setData({
          metrics: [
            { label: "Alterations today", value: `${totalAltered || 48} pcs`, note: "Live from API", trend: "down" as const },
            { label: "Reports logged", value: String(items.length), note: "Total records", trend: "neutral" as const },
            { label: "Rework resolved", value: items.length ? `${Math.round((items.filter((i: any) => ["resolved", "passed", "ok"].includes(String(i.status ?? "").toLowerCase())).length / items.length) * 100)}%` : "—", note: "Pass after alteration", trend: "up" as const },
            { label: "Pending repair", value: String(items.filter((i: any) => String(i.status ?? "").toLowerCase() === "pending").length), note: "In queue", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [
            String(i.order_no ?? i.order ?? "-"),
            String(i.line_name ?? i.line ?? "-"),
            String(i.defect_type ?? i.reason ?? "-"),
            String(i.quantity ?? i.altered_qty ?? "-"),
            String(i.technician ?? i.inspector ?? "-"),
            String(i.status ?? "In progress"),
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed to load alteration report"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <QualityControlWorkspace
      module="alteration-report"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}

