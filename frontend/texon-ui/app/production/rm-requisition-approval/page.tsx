"use client"

import * as React from "react"
import { ProductionWorkspace } from "../production-workspace"
import { getRmRequisitions } from "@/lib/api/inventory"

export default function RmRequisitionApprovalPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getRmRequisitions().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const approved = items.filter((i: any) => i.status === "approved" || i.status === "Approved").length
      setData({
        metrics: [
          { label: "Requisitions", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Approved", value: String(approved), note: `${Math.round(approved / items.length * 100)}% approval`, trend: "up" as const },
          { label: "Pending", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting approval", trend: "neutral" as const },
          { label: "Rejected", value: String(items.filter((i: any) => i.status === "rejected" || i.status === "Rejected").length), note: "No rejections today", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.requisition_no ?? i.id ?? "-", i.line ?? "-", i.material ?? "-", String(i.quantity ?? ""), i.requested_by ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <ProductionWorkspace module="rm-requisition-approval" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
