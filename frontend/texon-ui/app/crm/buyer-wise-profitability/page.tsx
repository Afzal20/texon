"use client"

import * as React from "react"
import { CRMWorkspace } from "../crm-workspace"
import { getBuyerProfitabilities } from "@/lib/api/crm"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function trendLabel(margin: number) {
  if (margin >= 20) return "Increasing"
  if (margin >= 15) return "Stable"
  return "Decreasing"
}

export default function BuyerWiseProfitabilityPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getBuyerProfitabilities().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])

      const totalRevenue = items.reduce((s: number, i: any) => s + Number(i.total_revenue ?? 0), 0)
      const totalCost = items.reduce((s: number, i: any) => s + Number(i.total_cost ?? 0), 0)
      const margins = items.map((i: any) => Number(i.profit_margin ?? 0))
      const avgMargin = margins.length ? margins.reduce((s: number, m: number) => s + m, 0) / margins.length : 0
      const bestMargin = Math.max(...margins)
      const worstMargin = Math.min(...margins)

      setData({
        metrics: [
          { label: "Overall margin", value: `${avgMargin.toFixed(1)}%`, note: `Across ${items.length} record(s)`, trend: "up" as const },
          { label: "Best margin", value: `${bestMargin.toFixed(1)}%`, note: "Highest profitability", trend: "up" as const },
          { label: "Lowest margin", value: `${worstMargin.toFixed(1)}%`, note: "Needs attention", trend: "down" as const },
          { label: "Total revenue", value: fmt(totalRevenue), note: "Aggregate across periods", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `Buyer #${i.buyer}`,
          fmt(Number(i.total_revenue ?? 0)),
          fmt(Number(i.total_cost ?? 0)),
          `${Number(i.profit_margin ?? 0).toFixed(1)}%`,
          "-",
          trendLabel(Number(i.profit_margin ?? 0)),
        ]),
      })
    }).catch(() => {})
  }, [])

  return <CRMWorkspace module="buyer-wise-profitability" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
