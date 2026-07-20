"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getSmvRecord } from "@/lib/api/costing"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "SMV", key: "smv", type: "number", icon: "LineChart" },
  { label: "Calculated by", key: "calculated_by", icon: "User" },
  { label: "Calculation date", key: "calculation_date", type: "date", icon: "CalendarDays" },
  { label: "Notes", key: "notes", icon: "FileText" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
]

function SmvDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSmvRecord(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="smv-calculation" title="SMV record" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function SmvDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="smv-calculation" title="SMV record" fields={fields} data={null} isLoading={true} error={null} />}>
      <SmvDetailPageInner />
    </React.Suspense>
  )
}
