"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getJournalEntries } from "@/lib/api/commercial"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function IntegratedFinancialAccountingSystemPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getJournalEntries().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const totalDebits = items.reduce((s: number, i: any) => s + Number(i.debit ?? 0), 0)
      const totalCredits = items.reduce((s: number, i: any) => s + Number(i.credit ?? 0), 0)
      const netBalance = Math.abs(totalDebits - totalCredits)
      setData({
        metrics: [
          { label: "Journal entries", value: fmtCount(items.length), note: "Current period", trend: "neutral" as const },
          { label: "Total debits", value: fmt(totalDebits), note: "Aggregate debit value", trend: "up" as const },
          { label: "Total credits", value: fmt(totalCredits), note: "Aggregate credit value", trend: "up" as const },
          { label: "Net balance", value: fmt(netBalance), note: totalDebits >= totalCredits ? "Debit balance" : "Credit balance", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.entry_number ?? `JV-${i.id}`,
          i.reference || "Manual journal",
          i.entry_date ?? "-",
          i.description ?? "-",
          fmt(Number(i.debit ?? 0) || Number(i.credit ?? 0)),
          "Posted",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="accounting" metrics={data.metrics} rows={data.rows} />
}
