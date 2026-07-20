"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getSmvRecords } from "@/lib/api/costing"
import { getStyles } from "@/lib/api/merchandising"

export default function SmvCalculationPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getSmvRecords(),
      getStyles(),
    ]).then(([smvRes, styleRes]) => {
      const items = Array.isArray(smvRes.data?.results) ? smvRes.data.results : Array.isArray(smvRes.data) ? smvRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const avgSMV = items.length ? items.reduce((s: number, i: any) => s + Number(i.smv ?? 0), 0) / items.length : 0
      const stylesWithSMV = new Set(items.map((i: any) => i.style))
      setData({
        metrics: [
          { label: "SMV records", value: String(items.length), note: `Across ${stylesWithSMV.size} styles`, trend: "up" as const },
          { label: "Average SMV", value: avgSMV.toFixed(2) + " min", note: "Across all records", trend: "neutral" as const },
          { label: "Pending calculation", value: String((styleArray.length - stylesWithSMV.size)), note: "Styles without SMV", trend: "neutral" as const },
          { label: "Styles covered", value: String(stylesWithSMV.size), note: `${styleArray.length} total styles`, trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          styleMap.get(i.style) ?? `Style #${i.style}`,
          "General",
          String(i.smv ?? 0),
          i.calculated_by ?? "-",
          i.calculation_date ?? "-",
          "-",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="smv-calculation" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/smv-calculation/${row[row.length - 1]}`} rawItems={rawItems} />
}
