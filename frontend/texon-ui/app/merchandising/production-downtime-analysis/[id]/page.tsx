"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getProductionDowntime } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Production line", key: "production_line", icon: "Factory" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Start time", key: "start_datetime", type: "date", icon: "CalendarDays" },
  { label: "Duration (hrs)", key: "duration_hours", type: "number", icon: "Clock" },
  { label: "Cause", key: "cause", icon: "AlertCircle" },
  { label: "Description", key: "description", icon: "FileText" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
]

function DowntimeDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProductionDowntime(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="production-downtime-analysis" title="Downtime" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function DowntimeDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="production-downtime-analysis" title="Downtime" fields={fields} data={null} isLoading={true} error={null} />}>
      <DowntimeDetailPageInner />
    </React.Suspense>
  )
}
