"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getSampleOrder } from "@/lib/api/orders"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Sample type", key: "sample_type", icon: "Shirt" },
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Quantity", key: "quantity", type: "number", icon: "Package" },
  { label: "Request date", key: "request_date", type: "date", icon: "CalendarDays" },
  { label: "Deadline", key: "deadline", type: "date", icon: "CalendarDays" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function SampleMonitoringDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSampleOrder(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="sample-monitoring-fit-pp" title="Sample" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function SampleMonitoringDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="sample-monitoring-fit-pp" title="Sample" fields={fields} data={null} isLoading={true} error={null} />}>
      <SampleMonitoringDetailPageInner />
    </React.Suspense>
  )
}
