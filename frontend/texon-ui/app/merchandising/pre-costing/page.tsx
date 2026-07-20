"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getPreCostings } from "@/lib/api/costing"
import { getBuyers, getStyles } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PreCostingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getPreCostings(),
      getBuyers(),
      getStyles(),
    ]).then(([costRes, buyerRes, styleRes]) => {
      const items = Array.isArray(costRes.data?.results) ? costRes.data.results : Array.isArray(costRes.data) ? costRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b: Buyer) => [b.id, b.name]))
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const approved = items.filter((i: any) => i.status === "approved")
      const revised = items.filter((i: any) => i.status === "revised")
      const avgFOB = items.length ? items.reduce((s: number, i: any) => s + Number(i.total_estimated_cost ?? 0), 0) / items.length : 0
      const avgFabric = items.length ? items.reduce((s: number, i: any) => s + Number(i.estimated_fabric_cost ?? 0), 0) / items.length : 0
      setData({
        metrics: [
          { label: "Cost sheets this month", value: String(items.length), note: `${approved.length} approved`, trend: "up" as const },
          { label: "Average FOB estimate", value: fmt(avgFOB), note: "Across active styles", trend: "neutral" as const },
          { label: "Approved costings", value: String(approved.length), note: "Ready for bulk PO", trend: "up" as const },
          { label: "Pending revisions", value: String(revised.length), note: "Revise status", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `CS-${i.id}`,
          styleMap.get(i.style) ?? `Style #${i.style}`,
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          fmt(Number(i.total_estimated_cost ?? 0)),
          fmt(Number(i.estimated_fabric_cost ?? 0)),
          i.status === "approved" ? "Approved" : i.status === "revised" ? "Revision needed" : "Buyer review",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="pre-costing" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/pre-costing/${row[row.length - 1]}`} rawItems={rawItems} />
}
