"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getCapacityBooking } from "@/lib/api/production"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Line", key: "line", icon: "Factory" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Capacity per day", key: "capacity_per_day", type: "number", icon: "TrendingUp" },
  { label: "Booking date", key: "booking_date", type: "date", icon: "CalendarDays" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
  { label: "Created", key: "created_at", type: "date", icon: "CalendarDays" },
]

function CapacityBookingDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getCapacityBooking(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="capacity-booking-allocation" title="Capacity booking" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function CapacityBookingDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="capacity-booking-allocation" title="Capacity booking" fields={fields} data={null} isLoading={true} error={null} />}>
      <CapacityBookingDetailPageInner />
    </React.Suspense>
  )
}
