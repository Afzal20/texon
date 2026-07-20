"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getRiskAssessments } from "@/lib/api/compliance"

export default function RiskAssessmentPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getRiskAssessments().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const high = items.filter((i: any) => (i.severity ?? "").toLowerCase() === "high")
      const mitigated = items.filter((i: any) => (i.status ?? "").toLowerCase() === "mitigated" || (i.status ?? "").toLowerCase() === "closed")
      const open = items.filter((i: any) => (i.status ?? "").toLowerCase() === "open")
      setData({
        metrics: [
          { label: "Active risks", value: String(items.length), note: "Across all orders", trend: "neutral" as const },
          { label: "High-severity risks", value: String(high.length), note: "Immediate action needed", trend: "down" as const },
          { label: "Mitigated this month", value: String(mitigated.length), note: "Successfully resolved", trend: "up" as const },
          { label: "Risk score", value: items.length ? `${(high.length / items.length * 10).toFixed(1)} / 10` : "-", note: "Factory average", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.risk_id ?? i.id ?? "-", i.order ?? i.order_no ?? "-", i.category ?? i.risk_category ?? "-", i.severity ?? "-", i.impact ?? `$${i.impact_value ?? 0}`, i.status ?? "Open"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="risk-assessment" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
