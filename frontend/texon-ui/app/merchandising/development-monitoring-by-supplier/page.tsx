"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getDevelopmentMonitoring } from "@/lib/api/production"
import { getBuyers, getStyles } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()

export default function DevelopmentMonitoringBySupplierPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getDevelopmentMonitoring(),
      getBuyers(),
      getStyles(),
    ]).then(([devRes, buyerRes, styleRes]) => {
      const items = Array.isArray(devRes.data?.results) ? devRes.data.results : Array.isArray(devRes.data) ? devRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const onTrack = items.filter((i: any) => i.status === "completed" || i.status === "in_progress")
      const atRisk = items.filter((i: any) => i.status === "pending")
      const completed = items.filter((i: any) => i.status === "completed")
      setData({
        metrics: [
          { label: "Styles in development", value: fmtCount(items.length), note: "Total monitoring records", trend: "neutral" as const },
          { label: "On track / in progress", value: fmtCount(onTrack.length), note: items.length ? `${Math.round(onTrack.length / items.length * 100)}% of total` : "0%", trend: "up" as const },
          { label: "At risk (pending)", value: fmtCount(atRisk.length), note: "Not yet started", trend: "down" as const },
          { label: "Completed", value: fmtCount(completed.length), note: "Fully delivered", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => {
          const deadline = i.completion_date || i.start_date || ""
          let daysLeft = "-"
          if (deadline) {
            const parsed = new Date(deadline)
            if (!isNaN(parsed.getTime())) {
              const diff = Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              daysLeft = diff > 0 ? String(diff) : "0"
            }
          }
          return [
            styleMap.get(i.style) ?? `Style #${i.style}`,
            i.supplier ?? "-",
            i.stage ?? "-",
            deadline || "-",
            daysLeft,
            i.status === "completed" ? "Completed" : i.status === "in_progress" ? "On track" : "At risk",
            String(i.id),
          ]
        }),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="development-monitoring-by-supplier" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/development-monitoring-by-supplier/${row[row.length - 1]}`} rawItems={rawItems} />
}
