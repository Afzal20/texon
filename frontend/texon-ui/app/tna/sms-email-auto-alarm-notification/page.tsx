"use client"

import * as React from "react"
import { TnAWorkspace } from "../tna-workspace"
import { getAlarmNotifications } from "@/lib/api/tna"

export default function SmsEmailAutoAlarmPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    getAlarmNotifications().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      if (items.length > 0) {
        setData({
          metrics: [
            { label: "Total notifications", value: String(items.length), note: "All alarm types", trend: "neutral" as const },
          ],
          rows: items.slice(0, 4).map((i: any) => [i.id?.toString(), i.subject ?? i.title ?? "-", i.alarm_type ?? "-", i.scheduled_date ?? "-", i.status ?? "Scheduled"]),
        })
      }
    }).catch(() => {})
  }, [])

  return <TnAWorkspace module="sms-email-auto-alarm-notification" metrics={data.metrics} rows={data.rows} />
}
