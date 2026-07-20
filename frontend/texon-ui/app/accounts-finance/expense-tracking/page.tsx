"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getExpenses } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function ExpenseTrackingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getExpenses().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalAmount = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      const pending = items.filter((i: any) => i.status === "pending")
      const approved = items.filter((i: any) => i.status === "approved")
      const draft = items.filter((i: any) => i.status === "draft")
      setData({
        metrics: [
          { label: "Expenses this month", value: fmt(totalAmount), note: `${items.length} records`, trend: "neutral" as const },
          { label: "Pending approval", value: fmtCount(pending.length), note: fmt(pending.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)), trend: "neutral" as const },
          { label: "Approved", value: fmtCount(approved.length), note: fmt(approved.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)), trend: "up" as const },
          { label: "Draft", value: fmtCount(draft.length), note: fmt(draft.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)) + " not submitted", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `EXP-${i.id}`,
          i.cost_center ? `Center #${i.cost_center}` : "-",
          i.category ?? "-",
          i.expense_date ?? "-",
          fmt(Number(i.amount ?? 0)),
          i.status === "approved" ? "Approved" : i.status === "rejected" ? "Policy review" : i.status === "draft" ? "Draft" : "Pending approval",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="expenses" metrics={data.metrics} rows={data.rows} />
}
