"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getProductionDowntimes } from "@/lib/api/merchandising"
import { getProductionLines } from "@/lib/api/production"

const fmtCount = (n: number) => n.toLocaleString()

export default function ProductionDowntimeAnalysisPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getProductionDowntimes(),
      getProductionLines(),
    ]).then(([dtRes, lineRes]) => {
      const items = Array.isArray(dtRes.data?.results) ? dtRes.data.results : Array.isArray(dtRes.data) ? dtRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const lineList: any[] = Array.isArray(lineRes.data?.results) ? lineRes.data.results : Array.isArray(lineRes.data) ? lineRes.data : []
      const lineMap = new Map(lineList.map((l: any) => [l.id, l.name]))
      const totalHrs = items.reduce((s: number, i: any) => s + Number(i.duration_hours || 0), 0)
      const resolved = items.filter((i: any) => i.status === "resolved")
      const ongoing = items.filter((i: any) => i.status === "ongoing")
      const causeCounts: Record<string, number> = {}
      items.forEach((i: any) => { const c = i.cause || "Other"; causeCounts[c] = (causeCounts[c] || 0) + Number(i.duration_hours || 0) })
      const topCause = Object.entries(causeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—"
      setData({
        metrics: [
          { label: "Total downtime", value: totalHrs.toFixed(1) + " hrs", note: `Across ${items.length} incidents`, trend: "down" as const },
          { label: "Incidents", value: fmtCount(items.length), note: `${ongoing.length} ongoing`, trend: "neutral" as const },
          { label: "Resolved", value: fmtCount(resolved.length), note: items.length ? `${Math.round(resolved.length / items.length * 100)}%` : "0%", trend: "up" as const },
          { label: "Top cause", value: topCause, note: `${((causeCounts[topCause] || 0) / (totalHrs || 1) * 100).toFixed(0)}% of total`, trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `DT-${i.id}`,
          lineMap.get(i.production_line) ?? `Line #${i.production_line ?? "—"}`,
          i.start_datetime ? new Date(i.start_datetime).toLocaleString() : "-",
          Number(i.duration_hours || 0).toFixed(1) + " hrs",
          i.cause || "-",
          i.status ? i.status.charAt(0).toUpperCase() + i.status.slice(1) : "Ongoing",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="production-downtime-analysis" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/production-downtime-analysis/${row[row.length - 1]}`} rawItems={rawItems} />
}
