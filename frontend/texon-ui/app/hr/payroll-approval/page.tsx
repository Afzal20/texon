"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getSalarySheets } from "@/lib/api/hr"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K"

export default function PayrollApprovalPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSalarySheets().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const pending = items.filter((i: any) => (i.status ?? "").toLowerCase() === "pending")
      const approved = items.filter((i: any) => (i.status ?? "").toLowerCase() === "approved")
      const totalNet = items.reduce((s: number, i: any) => s + Number(i.net ?? i.net_pay ?? 0), 0)
      const gross = items.reduce((s: number, i: any) => s + Number(i.gross ?? i.gross_pay ?? i.basic ?? 0) + Number(i.allowances ?? i.allowance ?? 0), 0)
      const deductions = items.reduce((s: number, i: any) => s + Number(i.deductions ?? i.deduction ?? 0), 0)
      setData({
        metrics: [
          { label: "Pending approval", value: String(pending.length), note: "Awaiting sign-off", trend: "neutral" as const },
          { label: "Approved this month", value: String(approved.length), note: "Completed runs", trend: "up" as const },
          { label: "Total disbursed", value: fmt(totalNet), note: "Across all periods", trend: "neutral" as const },
          { label: "Approval SLA", value: "-", note: "Avg. turnaround", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.period ?? "-", fmt(gross), fmt(deductions), fmt(totalNet), i.submitted ?? i.submitted_date ?? "-", i.status ?? "Pending"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="payroll-approval" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
