"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getFabricInspections } from "@/lib/api/inventory"

export default function FabricInspectionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getFabricInspections().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const passed = items.filter((i: any) => i.status === "pass" || i.status === "Pass").length
      setData({
        metrics: [
          { label: "Inspections today", value: String(items.length), note: "From API", trend: "up" as const },
          { label: "Pass rate", value: items.length ? `${Math.round(passed / items.length * 100)}%` : "0%", note: "Supplier quality", trend: "up" as const },
          { label: "Rejections", value: String(items.filter((i: any) => i.status === "fail" || i.status === "Fail").length), note: "Rolls rejected", trend: "down" as const },
          { label: "Avg. grade", value: items.length ? `${(items.reduce((s: number, i: any) => s + Number(i.grade ?? 0), 0) / items.length).toFixed(1)}/5` : "-", note: "Supplier quality", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.lot_no ?? i.id ?? "-", i.fabric ?? i.fabric_name ?? "-", i.supplier ?? "-", String(i.rolls ?? ""), i.grade ? `${i.grade}/5` : "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="fabric-inspection" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
