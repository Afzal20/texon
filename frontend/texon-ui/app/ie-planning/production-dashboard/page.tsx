"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getPlans } from "@/lib/api/production"

export default function ProductionDashboardPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getPlans().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const totalOutput = items.reduce((s: number, i: any) => s + Number(i.output ?? i.actual_output ?? 0), 0)
      const efficiencies = items.map((i: any) => Number(i.efficiency ?? i.efficiency_rate ?? 0)).filter(Boolean)
      const avgEfficiency = efficiencies.length ? efficiencies.reduce((s: number, e: number) => s + e, 0) / efficiencies.length : 0
      setData({
        metrics: [
          { label: "Today's output", value: `${totalOutput} pcs`, note: `Across ${items.length} line(s)`, trend: "up" as const },
          { label: "Avg. efficiency", value: avgEfficiency ? `${avgEfficiency.toFixed(1)}%` : "-", note: "Target: 85%", trend: "up" as const },
          { label: "Active orders", value: String(new Set(items.map((i: any) => i.order ?? i.order_no).filter(Boolean)).size), note: "Currently on floor", trend: "neutral" as const },
          { label: "Defect rate", value: "-", note: "Below 3% target", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? i.line_name ?? "-", i.order ?? i.order_no ?? "-", i.style ?? i.style_name ?? "-", String(i.output ?? i.actual_output ?? 0), i.efficiency ?? i.efficiency_rate ? `${i.efficiency ?? i.efficiency_rate}%` : "-", i.status ?? "-"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="production-dashboard" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
