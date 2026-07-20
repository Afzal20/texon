"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getStyles, getBuyers } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()

export default function StyleManagementPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getStyles(),
      getBuyers(),
    ]).then(([styleRes, buyerRes]) => {
      const items = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b) => [b.id, b.name]))
      const active = items.filter((i: any) => i.is_active)
      const categories = new Set(items.map((i: any) => i.category).filter(Boolean))
      setData({
        metrics: [
          { label: "Active styles", value: fmtCount(active.length), note: `Out of ${items.length} total`, trend: "up" as const },
          { label: "In development", value: fmtCount(items.length - active.length), note: "Inactive / archived", trend: "neutral" as const },
          { label: "Categories", value: fmtCount(categories.size), note: "Unique style categories", trend: "neutral" as const },
          { label: "Total styles", value: fmtCount(items.length), note: "Across all buyers", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.style_number ?? `#${i.id}`,
          i.name ?? "-",
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          i.category || "-",
          "-",
          i.is_active ? "Active" : "Inactive",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="style-management" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/style-management/${row[row.length - 1]}`} rawItems={rawItems} />
}
