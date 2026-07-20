"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getIeSuggestions } from "@/lib/api/merchandising"
import { getProductionLines } from "@/lib/api/production"

const fmtCount = (n: number) => n.toLocaleString()

export default function IeSuggestionForPphPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getIeSuggestions(),
      getProductionLines(),
    ]).then(([sugRes, lineRes]) => {
      const items = Array.isArray(sugRes.data?.results) ? sugRes.data.results : Array.isArray(sugRes.data) ? sugRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const lineList: any[] = Array.isArray(lineRes.data?.results) ? lineRes.data.results : Array.isArray(lineRes.data) ? lineRes.data : []
      const lineMap = new Map(lineList.map((l: any) => [l.id, l.name]))
      const implemented = items.filter((i: any) => i.status === "implemented")
      const pending = items.filter((i: any) => i.status === "pending")
      const underReview = items.filter((i: any) => i.status === "under_review")
      const avgGain = implemented.length
        ? implemented.reduce((s: number, i: any) => s + (Number(i.target_pph) - Number(i.current_pph)), 0) / implemented.length
        : 0
      setData({
        metrics: [
          { label: "Active suggestions", value: fmtCount(items.length), note: `${pending.length} pending`, trend: "neutral" as const },
          { label: "Implemented", value: fmtCount(implemented.length), note: "This month", trend: "up" as const },
          { label: "Under review", value: fmtCount(underReview.length), note: "Awaiting sign-off", trend: "neutral" as const },
          { label: "Avg PPH gain", value: avgGain ? `+${avgGain.toFixed(1)}` : "—", note: implemented.length ? `Across ${implemented.length} suggestions` : "No data", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `IE-${i.id}`,
          lineMap.get(i.production_line) ?? `Line #${i.production_line ?? "—"}`,
          i.operation || "-",
          Number(i.current_pph || 0).toFixed(1),
          Number(i.target_pph || 0).toFixed(1),
          i.status?.replace("_", " ") ?? "Pending",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="ie-suggestion-for-pph" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/ie-suggestion-for-pph/${row[row.length - 1]}`} rawItems={rawItems} />
}
