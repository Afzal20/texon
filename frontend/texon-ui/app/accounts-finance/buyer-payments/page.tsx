"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getAccountsReceivable } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function BuyerPaymentsPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getAccountsReceivable().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalAmount = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      const totalReceived = items.reduce((s: number, i: any) => s + Number(i.received_amount ?? 0), 0)
      const totalBalance = items.reduce((s: number, i: any) => s + Number(i.balance ?? 0), 0)
      const overdue = items.filter((i: any) => i.status === "overdue")
      setData({
        metrics: [
          { label: "Received this month", value: fmt(totalReceived), note: `${items.length} remittances posted`, trend: "up" as const },
          { label: "Total invoiced", value: fmt(totalAmount), note: "Across all buyers", trend: "neutral" as const },
          { label: "Outstanding balance", value: fmt(totalBalance), note: `${items.filter((i: any) => i.status !== "received").length} invoices pending`, trend: "neutral" as const },
          { label: "Overdue amount", value: fmt(overdue.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)), note: `${overdue.length} invoices`, trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `RCPT-${i.id}`,
          `Buyer #${i.buyer}`,
          "-",
          i.due_date ?? "-",
          fmt(Number(i.amount ?? 0)),
          i.status === "received" ? "Allocated" : i.status === "partial" ? "Partially allocated" : "Unapplied",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="buyer-payments" metrics={data.metrics} rows={data.rows} />
}
