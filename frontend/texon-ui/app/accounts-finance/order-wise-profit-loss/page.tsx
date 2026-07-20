"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getOrders } from "@/lib/api/orders"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

function orderHealth(status: string) {
  if (status === "cancelled" || status === "pending") return "At risk"
  if (status === "in_production") return "Healthy"
  return "Watch"
}

export default function OrderwiseProfitLossPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getOrders().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalValue = items.reduce((s: number, i: any) => s + Number(i.total_value ?? 0), 0)
      const active = items.filter((i: any) => i.status !== "cancelled" && i.status !== "delivered")
      const inProduction = items.filter((i: any) => i.status === "in_production")
      setData({
        metrics: [
          { label: "Active orders", value: fmtCount(active.length), note: `Out of ${items.length} total`, trend: "neutral" as const },
          { label: "Portfolio value", value: fmt(totalValue), note: "Total order value", trend: "up" as const },
          { label: "In production", value: fmtCount(inProduction.length), note: fmt(inProduction.reduce((s: number, i: any) => s + Number(i.total_value ?? 0), 0)), trend: "up" as const },
          { label: "Avg order value", value: items.length ? fmt(totalValue / items.length) : "$0", note: "Per order average", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `${i.order_number ?? `#${i.id}`} · Buyer #${i.buyer}`,
          fmt(Number(i.total_value ?? 0)),
          "-",
          "-",
          "-",
          orderHealth(i.status),
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="profit-loss" metrics={data.metrics} rows={data.rows} />
}
