"use client"

import * as React from "react"
import { TnAWorkspace } from "../tna-workspace"
import { getTimelines } from "@/lib/api/tna"

export default function CriticalPathAnalysisPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getTimelines().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (items.length > 0) {
        setData({
          rows: items.slice(0, 4).map((i: any) => [i.id?.toString(), i.title ?? "-", i.start_date ?? "-", i.end_date ?? "-", i.duration ?? "-", i.status ?? "Active"]),
        })
      }
    }).catch(() => {})
  }, [])

  return <TnAWorkspace module="critical-path-analysis" metrics={data.metrics} rows={data.rows} />
}
