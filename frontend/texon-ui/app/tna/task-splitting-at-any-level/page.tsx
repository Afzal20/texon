"use client"

import * as React from "react"
import { TnAWorkspace } from "../tna-workspace"
import { getTasks } from "@/lib/api/tna"

export default function TaskSplittingAtAnyLevelPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getTasks().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (items.length > 0) {
        setData({
          rows: items.slice(0, 4).map((i: any) => [i.task_id ?? i.id?.toString(), i.title ?? "-", i.parent_task ?? "-", i.status ?? "-", i.assigned_to ?? "-", i.due_date ?? "-"]),
        })
      }
    }).catch(() => {})
  }, [])

  return <TnAWorkspace module="task-splitting-at-any-level" metrics={data.metrics} rows={data.rows} />
}
