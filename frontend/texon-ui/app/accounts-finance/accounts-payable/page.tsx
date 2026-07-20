"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getAccountsPayable } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function AccountsPayablePage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getAccountsPayable().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalAmount = items.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      const totalPaid = items.reduce((s: number, i: any) => s + Number(i.paid_amount ?? 0), 0)
      const totalBalance = items.reduce((s: number, i: any) => s + Number(i.balance ?? 0), 0)
      const overdue = items.filter((i: any) => i.status === "overdue")
      const overdueAmount = overdue.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)
      setData({
        metrics: [
          { label: "Outstanding payables", value: fmt(totalBalance), note: `${items.length} supplier invoices`, trend: "neutral" as const },
          { label: "Total invoiced", value: fmt(totalAmount), note: "Gross invoice value", trend: "neutral" as const },
          { label: "Paid to date", value: fmt(totalPaid), note: totalAmount ? `${Math.round(totalPaid / totalAmount * 100)}% of total` : "No invoices", trend: "up" as const },
          { label: "Overdue balance", value: fmt(overdueAmount), note: `${overdue.length} invoices need review`, trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.invoice_number ?? `#${i.id}`,
          `Supplier #${i.supplier}`,
          i.due_date ?? "-",
          fmt(Number(i.amount ?? 0)),
          i.status === "paid" ? "Approved" : i.status === "partial" ? "Partial" : "Pending",
          i.status ?? "Open",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="payable" metrics={data.metrics} rows={data.rows} />
}
