"use client"

import * as React from "react"
import { HRWorkspace } from "../hr-workspace"
import { getAttendance } from "@/lib/api/hr"

export default function AttendancePage() {
  const [data, setData] = React.useState<{metrics?: any[]; rows?: string[][]}>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getAttendance().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (!items.length) return
      const present = items.filter((i: any) => (i.status ?? "").toLowerCase() === "present")
      const absent = items.filter((i: any) => (i.status ?? "").toLowerCase() === "absent")
      const late = items.filter((i: any) => (i.status ?? "").toLowerCase() === "late")
      const onLeave = items.filter((i: any) => (i.status ?? "").toLowerCase() === "on_leave" || (i.status ?? "").toLowerCase() === "leave")
      setData({
        metrics: [
          { label: "Present today", value: String(present.length), note: items.length ? `${Math.round(present.length / items.length * 100)}% attendance` : "0%", trend: "up" as const },
          { label: "Absent", value: String(absent.length), note: items.length ? `${Math.round(absent.length / items.length * 100)}% absence` : "0%", trend: "down" as const },
          { label: "Late arrivals", value: String(late.length), note: items.length ? `${Math.round(late.length / items.length * 100)}% late` : "0%", trend: "neutral" as const },
          { label: "On leave", value: String(onLeave.length), note: "Approved", trend: "neutral" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [i.department ?? i.department_name ?? "-", String(i.total ?? i.total_workers ?? 0), String(i.present ?? 0), String(i.absent ?? 0), String(i.late ?? 0), i.rate ?? i.attendance_rate ?? "-"]),
      })
    }).catch(() => {})
  }, [])

  return <HRWorkspace module="attendance" metrics={data.metrics} rows={data.rows} rawItems={rawItems} />
}
