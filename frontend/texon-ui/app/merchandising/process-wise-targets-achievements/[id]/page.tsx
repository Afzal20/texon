"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getProcessWiseTarget } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Process name", key: "process_name", icon: "Layers" },
  { label: "Target quantity", key: "target_quantity", type: "number", icon: "TrendingUp" },
  { label: "Achieved quantity", key: "achieved_quantity", type: "number", icon: "CheckCircle2" },
  { label: "Variance", key: "variance", type: "number", icon: "AlertCircle" },
  { label: "Target date", key: "target_date", type: "date", icon: "CalendarDays" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function ProcessTargetDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProcessWiseTarget(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="process-wise-targets-achievements" title="Process target" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function ProcessTargetDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="process-wise-targets-achievements" title="Process target" fields={fields} data={null} isLoading={true} error={null} />}>
      <ProcessTargetDetailPageInner />
    </React.Suspense>
  )
}
