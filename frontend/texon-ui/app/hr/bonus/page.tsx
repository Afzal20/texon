"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getBonuses } from "@/lib/api/hr"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K"

export default function BonusPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getBonuses().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalPool = items.reduce((s: number, i: any) => s + Number(i.pool ?? i.bonus_pool ?? i.total_amount ?? 0), 0)
      const totalEligible = items.reduce((s: number, i: any) => s + Number(i.eligible ?? i.eligible_workers ?? 0), 0)
      const avgBonus = totalEligible ? totalPool / totalEligible : 0
      const pending = items.filter((i: any) => (i.status ?? "").toLowerCase() === "pending")
      setData({
        metrics: [
          { label: "Bonus pool", value: fmt(totalPool), note: "This quarter", trend: "neutral" as const },
          { label: "Eligible workers", value: String(totalEligible), note: `${items.length ? `${Math.round(totalEligible / (totalEligible || 1) * 100)}%` : "0%"} of total`, trend: "up" as const },
          { label: "Avg. bonus", value: avgBonus > 0 ? `$${Math.round(avgBonus)}` : "-", note: "Per worker", trend: "neutral" as const },
          { label: "Pending approval", value: String(pending.length), note: "Exception cases", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.period ?? "-", i.type ?? i.bonus_type ?? "-", String(i.eligible ?? i.eligible_workers ?? 0), fmt(Number(i.pool ?? i.bonus_pool ?? i.total_amount ?? 0)), i.average ?? i.avg_bonus ? `$${i.average ?? i.avg_bonus}` : "-", i.status ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="bonus" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
