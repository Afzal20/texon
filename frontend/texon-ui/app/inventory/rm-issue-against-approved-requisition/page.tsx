"use client"

import * as React from "react"
import { InventoryWorkspace } from "../inventory-workspace"
import { getRmRequisitions } from "@/lib/api/inventory"

export default function RmIssueAgainstApprovedRequisitionPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getRmRequisitions().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const issued = items.filter((i: any) => i.status === "issued" || i.status === "Issued" || i.status === "approved").length
      setData({
        metrics: [
          { label: "Issues today", value: String(issued), note: "Against requisitions", trend: "up" as const },
          { label: "Pending issues", value: String(items.filter((i: any) => i.status === "pending" || i.status === "Pending").length), note: "Awaiting approval", trend: "neutral" as const },
          { label: "Total requisitions", value: String(items.length), note: "From API", trend: "neutral" as const },
          { label: "Rejection rate", value: items.length ? `${Math.round(items.filter((i: any) => i.status === "rejected" || i.status === "Rejected").length / items.length * 100)}%` : "0%", note: "Qty mismatch", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.issue_no ?? i.id ?? "-", i.requisition_no ?? "-", i.material ?? "-", String(i.quantity ?? ""), i.line ?? "-", i.status ?? "-"]),
      })
    }).catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return <InventoryWorkspace module="rm-issue-against-approved-requisition" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rawItems={rawItems} />
}
