"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getProductionLine } from "@/lib/api/production"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Line name", key: "name", icon: "Factory" },
  { label: "Code", key: "code", icon: "Hash" },
  { label: "Location", key: "location", icon: "Building" },
  { label: "Capacity", key: "capacity", type: "number", icon: "TrendingUp" },
  { label: "Status", key: "is_active", type: "badge", formatter: (v) => v ? "Active" : "Inactive", icon: "CheckCircle2" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
  { label: "Updated", key: "updated_at", type: "date", icon: "CalendarDays" },
]

function LineLayoutDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProductionLine(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="line-layout" title="Line" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function LineLayoutDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="line-layout" title="Line" fields={fields} data={null} isLoading={true} error={null} />}>
      <LineLayoutDetailPageInner />
    </React.Suspense>
  )
}
