"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getAccountsReceivable } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function AccountsReceivablePage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getAccountsReceivable().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalAmount = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      const totalReceived = items.reduce((s: number, i: any) => s + Number(i.received_amount ?? 0), 0)
      const totalBalance = items.reduce((s: number, i: any) => s + Number(i.balance ?? 0), 0)
      const overdue = items.filter((i: any) => i.status === "overdue")
      const overdueAmount = overdue.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      setData({
        metrics: [
          { label: "Open receivables", value: fmt(totalBalance), note: `${items.length} buyer invoices`, trend: "up" as const },
          { label: "Total invoiced", value: fmt(totalAmount), note: "Across all buyers", trend: "neutral" as const },
          { label: "Collected to date", value: fmt(totalReceived), note: totalAmount ? `${Math.round(totalReceived / totalAmount * 100)}% collection rate` : "No invoices", trend: "up" as const },
          { label: "Past due", value: fmt(overdueAmount), note: `${overdue.length} invoices require follow-up`, trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.invoice_number ?? `#${i.id}`,
          `Buyer #${i.buyer}`,
          "-",
          i.due_date ?? "-",
          fmt(Number(i.amount ?? 0)),
          i.status ?? "Open",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="receivable" metrics={data.metrics} rows={data.rows} />
}
