"use client"

import * as React from "react"
import { ProcurementWorkspace } from "../procurement-workspace"
import { getQuotationAnalyses } from "@/lib/api/procurement"

export default function QuotationVsActualAnalysisPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getQuotationAnalyses().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const favorable = items.filter((i: any) => i.status === "favorable" || i.status === "Favorable").length
      setData({
        metrics: [
          { label: "Analyses completed", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Positive variances", value: String(favorable), note: "Actual below quote", trend: "up" as const },
          { label: "Negative variances", value: String(items.filter((i: any) => i.status === "unfavorable" || i.status === "Unfavorable").length), note: "Actual above quote", trend: "down" as const },
          { label: "Favorable variances", value: String(items.filter((i: any) => i.status === "favorable" || i.status === "Favorable").length), note: "Actual below quote", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.material ?? "-", i.supplier ?? "-", i.quoted_price ? `$${i.quoted_price}` : "-", i.actual_price ? `$${i.actual_price}` : "-", i.variance ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProcurementWorkspace module="quotation-vs-actual-analysis" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
