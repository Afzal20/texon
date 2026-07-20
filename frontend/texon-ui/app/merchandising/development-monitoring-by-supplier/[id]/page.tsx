"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getDevelopmentMonitor } from "@/lib/api/production"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Supplier", key: "supplier", icon: "Building" },
  { label: "Stage", key: "stage", icon: "Layers" },
  { label: "Start date", key: "start_date", type: "date", icon: "CalendarDays" },
  { label: "Completion date", key: "completion_date", type: "date", icon: "CalendarDays" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
  { label: "Updated", key: "updated_at", type: "date", icon: "CalendarDays" },
]

function DevMonitoringDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getDevelopmentMonitor(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="development-monitoring-by-supplier" title="Development" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function DevMonitoringDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="development-monitoring-by-supplier" title="Development" fields={fields} data={null} isLoading={true} error={null} />}>
      <DevMonitoringDetailPageInner />
    </React.Suspense>
  )
}
