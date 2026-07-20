"use client"

import * as React from "react"
import { CRMWorkspace } from "../crm-workspace"
import { getOrderAmendments } from "@/lib/api/crm"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

function amendmentType(reason: string, previous: string, newValue: string) {
  const r = (reason ?? "").toLowerCase()
  const p = (previous ?? "").toLowerCase()
  const n = (newValue ?? "").toLowerCase()
  if (r.includes("quantity") || r.includes("qty") || p.includes("qty") || n.includes("qty")) return "Qty change"
  if (r.includes("delivery") || r.includes("date") || r.includes("schedule")) return "Delivery shift"
  if (r.includes("spec") || r.includes("color") || r.includes("size")) return "Spec change"
  return "Other"
}

function amendmentImpact(previous: string, newValue: string) {
  const prevNum = parseFloat(previous?.replace(/[^0-9.-]/g, "") ?? "0")
  const newNum = parseFloat(newValue?.replace(/[^0-9.-]/g, "") ?? "0")
  if (prevNum && newNum) {
    const diff = newNum - prevNum
    return diff >= 0 ? `+${fmt(diff)}` : fmt(diff)
  }
  return previous && newValue ? `${previous} → ${newValue}` : "-"
}

export default function OrderAmendmentHistoryPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getOrderAmendments().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return

      const qtyChanges = items.filter((i: any) => amendmentType(i.reason, i.previous_value, i.new_value) === "Qty change")
      const delChanges = items.filter((i: any) => amendmentType(i.reason, i.previous_value, i.new_value) === "Delivery shift")

      setData({
        metrics: [
          { label: "Amendments this month", value: fmtCount(items.length), note: "Across all orders", trend: "neutral" as const },
          { label: "Quantity changes", value: fmtCount(qtyChanges.length), note: items.length ? `${Math.round(qtyChanges.length / items.length * 100)}% of amendments` : "0%", trend: "neutral" as const },
          { label: "Delivery shifts", value: fmtCount(delChanges.length), note: items.length ? `${Math.round(delChanges.length / items.length * 100)}% of amendments` : "0%", trend: "down" as const },
          { label: "Avg impact", value: items.reduce((s: number, i: any) => s + Math.abs(parseFloat(i.previous_value?.replace(/[^0-9.-]/g, "") ?? "0") - parseFloat(i.new_value?.replace(/[^0-9.-]/g, "") ?? "0")), 0) / items.length > 0 ? fmt(items.reduce((s: number, i: any) => Math.abs(parseFloat(i.previous_value?.replace(/[^0-9.-]/g, "") ?? "0") - parseFloat(i.new_value?.replace(/[^0-9.-]/g, "") ?? "0")), 0) / items.length) : "-", note: "Per amendment", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `AMD-${i.id}`,
          `PO #${i.purchase_order}`,
          "-",
          amendmentType(i.reason, i.previous_value, i.new_value),
          amendmentImpact(i.previous_value, i.new_value),
          "Completed",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <CRMWorkspace module="order-amendment-history" metrics={data.metrics} rows={data.rows} />
}
