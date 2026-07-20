"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"
import { getLinePlans } from "@/lib/api/production"

export default function LinePlanningLoadingUnloadingPage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getLinePlans().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (!items.length) return
      setRawItems(items as Record<string, unknown>[])
      const loading = items.filter((i: any) => (i.status ?? "").toLowerCase() === "loading")
      const unloading = items.filter((i: any) => (i.status ?? "").toLowerCase() === "unloading" || (i.status ?? "").toLowerCase() === "unloaded")
      const running = items.filter((i: any) => (i.status ?? "").toLowerCase() === "running")
      setData({
        metrics: [
          { label: "Lines loading", value: String(loading.length), note: "Transition in progress", trend: "neutral" as const },
          { label: "Lines running", value: String(running.length), note: "Steady state production", trend: "up" as const },
          { label: "Lines unloading", value: String(unloading.length), note: "Finishing current order", trend: "neutral" as const },
          { label: "Avg. loading time", value: "-", note: "Style changeover", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.line ?? i.line_name ?? "-", i.loading_in ?? i.incoming_style ?? "-", i.current_style ?? "-", i.loading_out ?? i.outgoing_style ?? "-", i.next_style ?? "-", i.status ?? "Running"]),
      })
    }).catch(() => {})
  }, [])

  return <IEPlanningWorkspace module="line-planning-loading-unloading" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
