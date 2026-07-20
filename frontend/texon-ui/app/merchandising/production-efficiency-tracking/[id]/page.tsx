"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getPerformanceRecord } from "@/lib/api/performance"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Production line", key: "production_line", icon: "Factory" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Record date", key: "record_date", type: "date", icon: "CalendarDays" },
  { label: "Metric", key: "metric", icon: "LineChart" },
  { label: "Value", key: "value", type: "number", icon: "TrendingUp" },
  { label: "Target", key: "target", type: "number", icon: "ClipboardList" },
  { label: "Unit", key: "unit", icon: "Hash" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function EfficiencyDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getPerformanceRecord(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="production-efficiency-tracking" title="Performance record" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function EfficiencyDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="production-efficiency-tracking" title="Performance record" fields={fields} data={null} isLoading={true} error={null} />}>
      <EfficiencyDetailPageInner />
    </React.Suspense>
  )
}
