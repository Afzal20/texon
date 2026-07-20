"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getStyles } from "@/lib/api/merchandising"

export default function StyleAnalysisPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getStyles().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const complex = items.filter((i: any) => Number(i.smv ?? i.smv_value ?? 0) > 15)
      const avgSmv = items.reduce((s: number, i: any) => s + Number(i.smv ?? i.smv_value ?? 0), 0) / items.length
      setData({
        metrics: [
          { label: "Styles analyzed", value: String(items.length), note: "Active styles", trend: "up" as const },
          { label: "Avg. SMV", value: avgSmv ? `${avgSmv.toFixed(1)} min` : "-", note: "Across analyzed styles", trend: "neutral" as const },
          { label: "Complex styles", value: String(complex.length), note: "SMV > 15 min", trend: "neutral" as const },
          { label: "Costing accuracy", value: "-", note: "Estimate vs. actual", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.style_no ?? i.id ?? "-", i.name ?? i.style_name ?? "-", String(i.smv ?? i.smv_value ?? 0), String(i.target_pph ?? i.target_output ?? 0), String(i.actual_pph ?? i.actual_output ?? 0), i.accuracy ?? i.costing_accuracy ? `${i.accuracy ?? i.costing_accuracy}%` : "-"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="style-analysis" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
