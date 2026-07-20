"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getSampleOrders } from "@/lib/api/orders"
import { getBuyers, getStyles } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()

export default function SampleOrderManagementPage() {
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
      const buyerMap = new Map(buyerList.map((b) => [b.id, b.name]))
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const now = new Date()
      const approved = items.filter((i: any) => i.status === "approved")
      const overdue = items.filter((i: any) => i.status !== "approved" && i.status !== "rejected" && i.deadline && new Date(i.deadline) < now)
      const inProgress = items.filter((i: any) => i.status === "in_progress" || i.status === "requested")
      setData({
        metrics: [
          { label: "Active sample orders", value: fmtCount(inProgress.length), note: `${items.length} total`, trend: "neutral" as const },
          { label: "Approved samples", value: fmtCount(approved.length), note: "Cleared for next stage", trend: "up" as const },
          { label: "Overdue samples", value: fmtCount(overdue.length), note: "Past deadline", trend: "down" as const },
          { label: "Total this period", value: fmtCount(items.length), note: "All sample orders", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `SMP-${i.id}`,
          styleMap.get(i.style) ?? `Style #${i.style}`,
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          i.sample_type?.replace("_", " ") ?? "-",
          i.deadline ?? "-",
          i.status === "approved" ? "Approved" : i.status === "rejected" ? "Rejected" : i.status === "in_progress" ? "In production" : i.status === "submitted" ? "Submitted" : "Requested",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="sample-order-management" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/sample-order-management/${row[row.length - 1]}`} rawItems={rawItems} />
}
