"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getBudgetDemandAssessment } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Assessment date", key: "assessment_date", type: "date", icon: "CalendarDays" },
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Forecast quantity", key: "forecast_quantity", type: "number", icon: "LineChart" },
  { label: "Booked quantity", key: "booked_quantity", type: "number", icon: "ClipboardList" },
  { label: "Gap quantity", key: "gap_quantity", type: "number", icon: "AlertCircle" },
  { label: "Revenue estimate", key: "revenue_estimate", type: "currency", icon: "DollarSign" },
  { label: "Confidence", key: "confidence", type: "badge", icon: "TrendingUp" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function BudgetDemandDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getBudgetDemandAssessment(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="budget-demand-assessment" title="Assessment" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function BudgetDemandDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="budget-demand-assessment" title="Assessment" fields={fields} data={null} isLoading={true} error={null} />}>
      <BudgetDemandDetailPageInner />
    </React.Suspense>
  )
}
