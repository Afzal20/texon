"use client"

import * as React from "react"
import { TnAWorkspace } from "../tna-workspace"
import { getTasks } from "@/lib/api/tna"

export default function GraphicViewTaskJobOrderStatusPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getTasks().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (items.length > 0) {
        setData({
          metrics: [
            { label: "Active tasks", value: String(items.length), note: "Graphic view", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [i.task_id ?? i.id?.toString(), i.title ?? "-", i.status ?? "-", i.progress ?? "0%", i.due_date ?? "-", i.priority ?? "Normal"]),
        })
      }
    }).catch(() => {})
  }, [])

  return <TnAWorkspace module="graphic-view-of-task-job-order-status" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
