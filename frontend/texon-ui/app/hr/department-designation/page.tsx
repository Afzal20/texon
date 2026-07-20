"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getDepartments } from "@/lib/api/hr"

export default function DepartmentDesignationPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getDepartments().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const totalHeadcount = items.reduce((s: number, i: any) => s + Number(i.headcount ?? i.employee_count ?? 0), 0)
      const totalBudget = items.reduce((s: number, i: any) => s + Number(i.budget ?? i.budgeted_headcount ?? 0), 0)
      const totalVacancies = items.reduce((s: number, i: any) => s + Number(i.vacancies ?? i.open_positions ?? 0), 0)
      setData({
        metrics: [
          { label: "Total departments", value: String(items.length), note: "Active", trend: "neutral" as const },
          { label: "Designations", value: "-", note: "Across departments", trend: "neutral" as const },
          { label: "Headcount budget", value: String(totalBudget), note: "Approved", trend: "neutral" as const },
          { label: "Vacancies", value: String(totalVacancies), note: "Open positions", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.name ?? i.department_name ?? "-", i.head ?? i.department_head ?? "-", String(i.headcount ?? i.employee_count ?? 0), String(i.budget ?? i.budgeted_headcount ?? 0), String(i.vacancies ?? i.open_positions ?? 0), i.status ?? "Active"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="department-designation" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
