"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getPurchaseOrders } from "@/lib/api/procurement"
import { getBuyers, getStyles } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function BulkPoManagementPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getPurchaseOrders(),
      getBuyers(),
      getStyles(),
    ]).then(([poRes, buyerRes, styleRes]) => {
      const items = Array.isArray(poRes.data?.results) ? poRes.data.results : Array.isArray(poRes.data) ? poRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b) => [b.id, b.name]))
      const styleArray: any[] = Array.isArray(styleRes.data?.results) ? styleRes.data.results : Array.isArray(styleRes.data) ? styleRes.data : []
      const styleMap = new Map(styleArray.map((s: any) => [s.id, s.style_number ?? s.name ?? `#${s.id}`]))
      const now = new Date()
      const open = items.filter((i: any) => i.status !== "delivered" && i.status !== "cancelled")
      const inProduction = items.filter((i: any) => i.status === "in_production")
      const shipped = items.filter((i: any) => i.status === "shipped")
      const overdue = items.filter((i: any) => i.status !== "delivered" && i.status !== "cancelled" && i.delivery_date && new Date(i.delivery_date) < now)
      const totalValue = items.reduce((s: number, i: any) => s + Number(i.total_value ?? 0), 0)
      setData({
        metrics: [
          { label: "Open POs", value: fmtCount(open.length), note: fmt(totalValue) + " total value", trend: "neutral" as const },
          { label: "POs in production", value: fmtCount(inProduction.length), note: items.length ? `${Math.round(inProduction.length / items.length * 100)}% of total` : "0", trend: "up" as const },
          { label: "Ready to ship", value: fmtCount(shipped.length), note: "Awaiting booking", trend: "up" as const },
          { label: "Overdue POs", value: fmtCount(overdue.length), note: "Past delivery date", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.po_number ?? `#${i.id}`,
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          styleMap.get(i.style) ?? `Style #${i.style}`,
          fmtCount(Number(i.quantity ?? 0)),
          i.delivery_date ?? "-",
          i.status?.replace("_", " ") ?? "Draft",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="bulk-po-management" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/bulk-po-management/${row[row.length - 1]}`} rawItems={rawItems} />
}
