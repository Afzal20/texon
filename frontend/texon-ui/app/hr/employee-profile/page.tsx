"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getEmployees } from "@/lib/api/hr"

export default function EmployeeProfilePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getEmployees().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const active = items.filter((i: any) => (i.status ?? i.employment_status ?? "").toLowerCase() === "active")
      const newMonth = items.filter((i: any) => {
        const d = i.join_date ?? i.date_joined
        if (!d) return false
        const now = new Date(); const join = new Date(d)
        return join.getMonth() === now.getMonth() && join.getFullYear() === now.getFullYear()
      })
      setData({
        metrics: [
          { label: "Total employees", value: String(items.length), note: "Across all departments", trend: "neutral" as const },
          { label: "New this month", value: String(newMonth.length), note: "Onboarded", trend: "up" as const },
          { label: "Active contracts", value: String(active.length), note: `${items.length ? Math.round(active.length / items.length * 100) : 0}% of total`, trend: "up" as const },
          { label: "Pending verification", value: String(items.length - active.length), note: "Documents incomplete", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.employee_id ?? i.id ?? "-", i.name ?? i.full_name ?? "-", i.department ?? i.department_name ?? "-", i.designation ?? i.job_title ?? "-", i.join_date ?? i.date_joined ?? "-", i.status ?? i.employment_status ?? "Active"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="employee-profile" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
