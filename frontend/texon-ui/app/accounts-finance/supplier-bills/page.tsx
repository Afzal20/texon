"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getAccountsPayable } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function SupplierBillsPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getAccountsPayable().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const pending = items.filter((i: any) => i.status === "pending")
      const paid = items.filter((i: any) => i.status === "paid")
      const overdue = items.filter((i: any) => i.status === "overdue")
      setData({
        metrics: [
          { label: "Bills received", value: fmtCount(items.length), note: `${items.length} supplier invoices`, trend: "neutral" as const },
          { label: "Pending approval", value: fmtCount(pending.length), note: fmt(pending.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)), trend: "neutral" as const },
          { label: "Approved value", value: fmt(paid.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)), note: "Ready for payment", trend: "up" as const },
          { label: "Overdue bills", value: fmtCount(overdue.length), note: fmt(overdue.reduce((s: number, i: any) => s + Number(i.amount ?? 0), 0)) + " outstanding", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `BILL-${i.id}`,
          `Supplier #${i.supplier}`,
          "-",
          i.invoice_date ?? i.created_at?.slice(0, 10) ?? "-",
          fmt(Number(i.amount ?? 0)),
          i.status === "paid" ? "Matched" : i.status === "partial" ? "Price variance" : "Needs GRN",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="supplier-bills" metrics={data.metrics} rows={data.rows} />
}
