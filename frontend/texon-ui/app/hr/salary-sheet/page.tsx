"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getSalarySheets } from "@/lib/api/hr"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K"

export default function SalarySheetPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSalarySheets().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalBasic = items.reduce((s: number, i: any) => s + Number(i.basic ?? i.basic_pay ?? 0), 0)
      const totalAllowances = items.reduce((s: number, i: any) => s + Number(i.allowances ?? i.allowance ?? 0), 0)
      const totalDeductions = items.reduce((s: number, i: any) => s + Number(i.deductions ?? i.deduction ?? 0), 0)
      const totalNet = items.reduce((s: number, i: any) => s + Number(i.net ?? i.net_pay ?? 0), 0)
      setData({
        metrics: [
          { label: "Total payroll", value: fmt(totalNet), note: "This month", trend: "neutral" as const },
          { label: "Basic pay", value: fmt(totalBasic), note: `${items.length ? Math.round(totalBasic / totalNet * 100) : 0}% of total`, trend: "neutral" as const },
          { label: "Allowances", value: fmt(totalAllowances), note: `${items.length ? Math.round(totalAllowances / totalNet * 100) : 0}% of total`, trend: "neutral" as const },
          { label: "Deductions", value: fmt(totalDeductions), note: `${items.length ? Math.round(totalDeductions / totalNet * 100) : 0}% of total`, trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.department ?? i.department_name ?? "-", String(i.workers ?? i.worker_count ?? 0), fmt(Number(i.basic ?? i.basic_pay ?? 0)), fmt(Number(i.allowances ?? i.allowance ?? 0)), fmt(Number(i.deductions ?? i.deduction ?? 0)), fmt(Number(i.net ?? i.net_pay ?? 0))]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="salary-sheet" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
