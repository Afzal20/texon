"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getProcessWiseTargets } from "@/lib/api/merchandising"

const fmtCount = (n: number) => n.toLocaleString()

export default function ProcessWiseTargetsAchievementsPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProcessWiseTargets().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      const totalTarget = items.reduce((s: number, i: any) => s + (i.target_quantity || 0), 0)
      const totalAchieved = items.reduce((s: number, i: any) => s + (i.achieved_quantity || 0), 0)
      const onTrack = items.filter((i: any) => i.status === "on_track" || i.status === "exceeded")
      const behind = items.filter((i: any) => i.status === "behind")
      const best = items.slice().sort((a: any, b: any) => ((b.achieved_quantity || 0) / (b.target_quantity || 1)) - ((a.achieved_quantity || 0) / (a.target_quantity || 1)))[0]
      setData({
        metrics: [
          { label: "Overall achievement", value: totalTarget ? `${(totalAchieved / totalTarget * 100).toFixed(1)}%` : "—", note: `Target: ${fmtCount(totalTarget)} pcs`, trend: "up" as const },
          { label: "On track", value: `${onTrack.length} / ${items.length}`, note: `${Math.round(onTrack.length / (items.length || 1) * 100)}% of processes`, trend: "up" as const },
          { label: "Behind", value: fmtCount(behind.length), note: "Need intervention", trend: "down" as const },
          { label: "Best performer", value: best?.process_name ?? "—", note: best ? `${((best.achieved_quantity || 0) / (best.target_quantity || 1) * 100).toFixed(0)}% achievement` : "", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => {
          const pct = i.target_quantity ? ((i.achieved_quantity || 0) / i.target_quantity * 100).toFixed(1) : "0.0"
          const variance = (i.achieved_quantity || 0) - (i.target_quantity || 0)
          return [
            i.process_name || "-",
            fmtCount(i.target_quantity || 0),
            fmtCount(i.achieved_quantity || 0),
            pct + "%",
            (variance >= 0 ? "+" : "") + fmtCount(variance),
            i.status?.replace("_", " ") ?? "On track",
            String(i.id),
          ]
        }),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="process-wise-targets-achievements" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/process-wise-targets-achievements/${row[row.length - 1]}`} rawItems={rawItems} />
}
