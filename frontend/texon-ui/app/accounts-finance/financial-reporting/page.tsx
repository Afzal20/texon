"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getReports } from "@/lib/api/reports"

const fmtCount = (n: number) => n.toLocaleString()

export default function FinancialReportingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getReports().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const ready = items.filter((i: any) => i.status === "ready")
      const generating = items.filter((i: any) => i.status === "generating")
      const failed = items.filter((i: any) => i.status === "failed")
      setData({
        metrics: [
          { label: "Total reports", value: fmtCount(items.length), note: `${ready.length} ready`, trend: "neutral" as const },
          { label: "Ready", value: fmtCount(ready.length), note: "Available for download", trend: "up" as const },
          { label: "Generating", value: fmtCount(generating.length), note: "In progress", trend: "neutral" as const },
          { label: "Failed", value: fmtCount(failed.length), note: "Needs attention", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.title ?? `Report #${i.id}`,
          i.generated_at?.slice(0, 7) ?? "-",
          i.generated_by ?? "-",
          i.generated_at?.slice(0, 10) ?? "-",
          i.report_type?.replace("_", " ").toUpperCase() ?? "PDF",
          i.status === "ready" ? "Ready" : i.status === "generating" ? "Generating" : i.status === "failed" ? "Failed" : "Draft",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="reports" metrics={data.metrics} rows={data.rows} />
}
