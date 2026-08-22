"use client"

import * as React from "react"
import { QualityControlWorkspace } from "../quality-control-workspace"
import { getRejectionReports } from "@/lib/api/quality"

export default function RejectionReportPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getRejectionReports().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalRejected = items.reduce((s: number, i: any) => s + Number(i.rejected ?? i.quantity ?? 0), 0)
      const totalReworked = items.reduce((s: number, i: any) => s + Number(i.reworked ?? 0), 0)
      setData({
        metrics: [
          { label: "Rejections today", value: `${totalRejected} pcs`, note: "From API", trend: "down" as const },
          { label: "Open rejections", value: String(items.filter((i: any) => ["pending", "open"].includes(String(i.status ?? "").toLowerCase())).length), note: "Awaiting action", trend: "neutral" as const },
          { label: "Reworked", value: String(totalReworked), note: `${totalRejected ? Math.round(totalReworked / totalRejected * 100) : 0}% rework success`, trend: "up" as const },
          { label: "Scrapped", value: String(totalRejected - totalReworked), note: "Irrecoverable", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.order_no ?? i.id ?? "-", i.stage ?? "-", String(i.rejected ?? i.quantity ?? ""), i.cause ?? "-", String(i.reworked ?? ""), i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <QualityControlWorkspace module="rejection-report" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
