"use client"

import * as React from "react"
import { FinanceWorkspace } from "../finance-workspace"
import { getCostCenters } from "@/lib/api/core"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function CostCenterTrackingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getCostCenters().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      const active = items.filter((i: any) => i.is_active)
      const totalBudget = items.reduce((s: number, i: any) => s + Number(i.budget ?? 0), 0)
      const departments = new Set(items.map((i: any) => i.department).filter(Boolean))
      setData({
        metrics: [
          { label: "Total cost centers", value: fmtCount(items.length), note: `${active.length} active`, trend: "neutral" as const },
          { label: "Active centers", value: fmtCount(active.length), note: `${items.length - active.length} inactive`, trend: "neutral" as const },
          { label: "Total budget", value: fmt(totalBudget), note: "Across all centers", trend: "up" as const },
          { label: "Departments", value: fmtCount(departments.size), note: "Unique departments covered", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `${i.code ?? ""} · ${i.name}`,
          i.department || "-",
          fmt(Number(i.budget ?? 0)),
          "-",
          "-",
          i.is_active ? "Active" : "Inactive",
        ]),
      })
    }).catch(() => {})
  }, [])

  return <FinanceWorkspace module="cost-centers" metrics={data.metrics} rows={data.rows} />
}
