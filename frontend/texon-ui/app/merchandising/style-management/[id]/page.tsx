"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getStyle } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Style number", key: "style_number", icon: "Hash" },
  { label: "Style name", key: "name", icon: "Shirt" },
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Category", key: "category", icon: "Layers" },
  { label: "Description", key: "description", icon: "FileText" },
  { label: "Status", key: "is_active", type: "badge", formatter: (v) => v ? "Active" : "Inactive", icon: "CheckCircle2" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
  { label: "Updated", key: "updated_at", type: "date", icon: "CalendarDays" },
]

function StyleDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getStyle(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="style-management" title="Style" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function StyleDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="style-management" title="Style" fields={fields} data={null} isLoading={true} error={null} />}>
      <StyleDetailPageInner />
    </React.Suspense>
  )
}
