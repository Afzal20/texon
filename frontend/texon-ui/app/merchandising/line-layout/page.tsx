"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getProductionLines } from "@/lib/api/production"

const fmtCount = (n: number) => n.toLocaleString()

export default function LineLayoutPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProductionLines().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      const active = items.filter((i: any) => i.is_active)
      const totalCapacity = items.reduce((s: number, i: any) => s + Number(i.capacity ?? 0), 0)
      const avgCapacity = items.length ? Math.round(totalCapacity / items.length) : 0
      setData({
        metrics: [
          { label: "Active lines", value: String(active.length), note: `Out of ${items.length} total`, trend: "neutral" as const },
          { label: "Avg. line capacity", value: fmtCount(avgCapacity) + " pcs/day", note: "Across all lines", trend: "up" as const },
          { label: "Total capacity", value: fmtCount(totalCapacity) + " pcs/day", note: "Factory-wide", trend: "up" as const },
          { label: "Inactive lines", value: String(items.length - active.length), note: "Not in use", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.name ?? i.code ?? `Line #${i.id}`,
          i.location ?? "-",
          fmtCount(Number(i.capacity ?? 0)),
          "-",
          "-",
          i.is_active ? "Active" : "Inactive",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="line-layout" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/line-layout/${row[row.length - 1]}`} rawItems={rawItems} />
}
