"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getSampleOrders } from "@/lib/api/orders"
import { getBuyers, getStyles } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()

export default function SampleMonitoringFitPpPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getSampleOrders(),
      getBuyers(),
      getStyles(),
    ]).then(([orderRes, buyerRes, styleRes]) => {
      const items = Array.isArray(orderRes.data?.results) ? orderRes.data.results : Array.isArray(orderRes.data) ? orderRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b: Buyer) => [b.id, b.name]))
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const fitSamples = items.filter((i: any) => i.sample_type === "fit" || i.sample_type === "size_set")
      const ppSamples = items.filter((i: any) => i.sample_type === "pp" || i.sample_type === "pre_production")
      const approved = items.filter((i: any) => i.status === "approved")
      const rejected = items.filter((i: any) => i.status === "rejected")
      setData({
        metrics: [
          { label: "Samples in pipeline", value: fmtCount(items.length), note: "FIT and PP combined", trend: "neutral" as const },
          { label: "FIT / size set", value: fmtCount(fitSamples.length), note: "In approval workflow", trend: "neutral" as const },
          { label: "PP / pre-prod", value: fmtCount(ppSamples.length), note: "Cleared for bulk", trend: "up" as const },
          { label: "Rejection rate", value: items.length ? `${Math.round(rejected.length / items.length * 100)}%` : "0%", note: `${approved.length} approved`, trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          styleMap.get(i.style) ?? `Style #${i.style}`,
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          i.sample_type === "fit" ? "FIT" : i.sample_type === "pp" ? "PP" : i.sample_type?.replace("_", " ") ?? "-",
          i.status === "approved" ? "Approved" : i.status === "rejected" ? "Rejected" : i.status === "submitted" ? "Awaiting" : "In progress",
          "-",
          "-",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="sample-monitoring-fit-pp" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/sample-monitoring-fit-pp/${row[row.length - 1]}`} rawItems={rawItems} />
}
