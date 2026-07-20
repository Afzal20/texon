"use client"

import * as React from "react"
import { CRMWorkspace } from "../crm-workspace"
import { getBuyerCommunications } from "@/lib/api/crm"

const fmtCount = (n: number) => n.toLocaleString()

function statusClass(status: string) {
  if (status === "pending_follow_up") return "Pending"
  if (status === "completed") return "Replied"
  if (status === "closed") return "Completed"
  return status
}

export default function BuyerCommunicationRecordsPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getBuyerCommunications().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])

      const today = new Date().toISOString().slice(0, 10)
      const todayCount = items.filter((i: any) => i.communication_date?.startsWith(today)).length
      const pending = items.filter((i: any) => i.status === "pending_follow_up")
      const completed = items.filter((i: any) => i.status === "completed" || i.status === "closed")
      const meetings = items.filter((i: any) => i.communication_type === "meeting" || i.communication_type === "site_visit")

      setData({
        metrics: [
          { label: "Communications today", value: fmtCount(todayCount), note: "Across all buyers", trend: "up" as const },
          { label: "Pending responses", value: fmtCount(pending.length), note: "Awaiting follow-up", trend: "neutral" as const },
          { label: "Meetings scheduled", value: fmtCount(meetings.length), note: "Total logged", trend: "neutral" as const },
          { label: "Completed rate", value: items.length ? `${Math.round(completed.length / items.length * 100)}%` : "0%", note: "Of all communications", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.communication_date?.slice(0, 10) ?? "-",
          `Buyer #${i.buyer}`,
          i.communication_type?.replace("_", " ") ?? "-",
          i.subject ?? "-",
          i.created_by ?? "-",
          statusClass(i.status),
        ]),
      })
    }).catch(() => {})
  }, [])

  return <CRMWorkspace module="buyer-communication-records" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
