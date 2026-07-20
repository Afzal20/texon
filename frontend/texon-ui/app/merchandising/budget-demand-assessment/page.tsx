"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getBudgetDemandAssessments, getBuyers } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()
const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function BudgetDemandAssessmentPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getBudgetDemandAssessments(),
      getBuyers(),
    ]).then(([budgetRes, buyerRes]) => {
      const items = Array.isArray(budgetRes.data?.results) ? budgetRes.data.results : Array.isArray(budgetRes.data) ? budgetRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b) => [b.id, b.name]))
      const totalForecast = items.reduce((s: number, i: any) => s + (i.forecast_quantity || 0), 0)
      const totalBooked = items.reduce((s: number, i: any) => s + (i.booked_quantity || 0), 0)
      const totalRevenue = items.reduce((s: number, i: any) => s + Number(i.revenue_estimate || 0), 0)
      const highConf = items.filter((i: any) => i.confidence === "high")
      setData({
        metrics: [
          { label: "Total forecast", value: fmtCount(totalForecast) + " pcs", note: "Across all buyers", trend: "up" as const },
          { label: "Booked", value: fmtCount(totalBooked) + " pcs", note: totalForecast ? `${Math.round(totalBooked / totalForecast * 100)}% utilization` : "0%", trend: "neutral" as const },
          { label: "Gap", value: fmtCount(totalForecast - totalBooked) + " pcs", note: "Needs additional orders", trend: "down" as const },
          { label: "Revenue estimate", value: fmt(totalRevenue), note: `${highConf.length} high-confidence assessments`, trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          fmtCount(i.forecast_quantity || 0),
          fmtCount(i.booked_quantity || 0),
          fmtCount(i.gap_quantity ?? Math.max(0, (i.forecast_quantity || 0) - (i.booked_quantity || 0))),
          fmt(Number(i.revenue_estimate || 0)),
          i.confidence ? i.confidence.charAt(0).toUpperCase() + i.confidence.slice(1) : "Medium",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="budget-demand-assessment" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/budget-demand-assessment/${row[row.length - 1]}`} rawItems={rawItems} />
}
