"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getPerformanceRecords } from "@/lib/api/hr"

export default function ComplianceReportsPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getPerformanceRecords().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const passed = items.filter((i: any) => (i.status ?? i.result ?? "").toLowerCase() === "pass" || (i.status ?? i.result ?? "").toLowerCase() === "passed")
      const pending = items.filter((i: any) => (i.status ?? i.result ?? "").toLowerCase() === "pending")
      setData({
        metrics: [
          { label: "Reports generated", value: String(items.length), note: "This month", trend: "up" as const },
          { label: "Pending reports", value: String(pending.length), note: "Awaiting data", trend: "neutral" as const },
          { label: "Audit pass rate", value: items.length ? `${Math.round(passed.length / items.length * 100)}%` : "0%", note: "All buyers", trend: "up" as const },
          { label: "Non-compliance", value: String(items.length - passed.length), note: "Findings", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.report ?? i.report_name ?? i.title ?? "-", i.type ?? i.report_type ?? "-", i.period ?? "-", i.generated ?? i.generated_date ?? "-", i.auditor ?? "-", i.status ?? i.result ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="compliance-reports" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
