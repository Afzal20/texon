"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getPurchaseOrder } from "@/lib/api/procurement"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "PO number", key: "po_number", icon: "Hash" },
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Order date", key: "order_date", type: "date", icon: "CalendarDays" },
  { label: "Delivery date", key: "delivery_date", type: "date", icon: "CalendarDays" },
  { label: "Quantity", key: "quantity", type: "number", icon: "Package" },
  { label: "Unit price", key: "unit_price", type: "currency", icon: "DollarSign" },
  { label: "Total value", key: "total_value", type: "currency", icon: "DollarSign" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function BulkPoDetailInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getPurchaseOrder(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="bulk-po-management" title="Purchase order" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function BulkPoDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="bulk-po-management" title="Purchase order" fields={fields} data={null} isLoading={true} error={null} />}>
      <BulkPoDetailInner />
    </React.Suspense>
  )
}
