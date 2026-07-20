"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getBuyerEnquiry } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Enquiry date", key: "enquiry_date", type: "date", icon: "CalendarDays" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
  { label: "Updated", key: "updated_at", type: "date", icon: "CalendarDays" },
]

function BuyerEnquiryDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getBuyerEnquiry(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="buyer-enquiry-analysis" title="Enquiry" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function BuyerEnquiryDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="buyer-enquiry-analysis" title="Enquiry" fields={fields} data={null} isLoading={true} error={null} />}>
      <BuyerEnquiryDetailPageInner />
    </React.Suspense>
  )
}
