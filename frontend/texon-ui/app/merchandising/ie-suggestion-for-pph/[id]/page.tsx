"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getIeSuggestion } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Production line", key: "production_line", icon: "Factory" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Operation", key: "operation", icon: "Wrench" },
  { label: "Current PPH", key: "current_pph", type: "number", icon: "LineChart" },
  { label: "Target PPH", key: "target_pph", type: "number", icon: "TrendingUp" },
  { label: "Description", key: "description", icon: "FileText" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
]

function IeSuggestionDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getIeSuggestion(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="ie-suggestion-for-pph" title="IE suggestion" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function IeSuggestionDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="ie-suggestion-for-pph" title="IE suggestion" fields={fields} data={null} isLoading={true} error={null} />}>
      <IeSuggestionDetailPageInner />
    </React.Suspense>
  )
}
