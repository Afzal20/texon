"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getEmployees } from "@/lib/api/hr"

export default function WorkerIdPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getEmployees().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const active = items.filter((i: any) => (i.status ?? i.employment_status ?? "").toLowerCase() === "active")
      const expired = items.filter((i: any) => {
        const exp = i.id_expiry ?? i.expiry_date
        return exp && new Date(exp) < new Date()
      })
      setData({
        metrics: [
          { label: "IDs issued", value: String(items.length), note: "Active workers", trend: "neutral" as const },
          { label: "Pending issue", value: String(items.length - active.length), note: "Awaiting photo/biometric", trend: "neutral" as const },
          { label: "Expired IDs", value: String(expired.length), note: "Need renewal", trend: "down" as const },
          { label: "Replacement requests", value: "0", note: "This week", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.worker_id ?? i.employee_id ?? i.id ?? "-", i.name ?? i.full_name ?? "-", i.department ?? i.department_name ?? "-", i.id_issued ?? i.join_date ?? "-", i.id_expiry ?? i.expiry_date ?? "-", i.status ?? i.employment_status ?? "Active"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="worker-id" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
