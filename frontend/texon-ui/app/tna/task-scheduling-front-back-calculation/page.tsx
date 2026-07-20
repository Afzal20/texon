"use client"

import * as React from "react"
import { TnAWorkspace } from "../tna-workspace"
import { getSchedules } from "@/lib/api/tna"

export default function TaskSchedulingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSchedules().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (items.length > 0) {
        setData({
          metrics: [
            { label: "Active schedules", value: String(items.length), note: "Planned tasks", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [i.id?.toString(), i.title ?? "-", i.start_date ?? "-", i.end_date ?? "-", i.status ?? "Scheduled"]),
        })
      }
    }).catch(() => {})
  }, [])

  return <TnAWorkspace module="task-scheduling-front-back-calculation" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
