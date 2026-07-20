"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getPreCosting } from "@/lib/api/costing"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Cost date", key: "cost_date", type: "date", icon: "CalendarDays" },
  { label: "Buyer", key: "buyer", icon: "Building" },
  { label: "Style", key: "style", icon: "Shirt" },
  { label: "Fabric cost", key: "estimated_fabric_cost", type: "currency", icon: "DollarSign" },
  { label: "Accessory cost", key: "estimated_accessory_cost", type: "currency", icon: "DollarSign" },
  { label: "Trim cost", key: "estimated_trim_cost", type: "currency", icon: "DollarSign" },
  { label: "Labor cost", key: "estimated_labor_cost", type: "currency", icon: "DollarSign" },
  { label: "Overhead", key: "estimated_overhead", type: "currency", icon: "DollarSign" },
  { label: "Total cost", key: "total_estimated_cost", type: "currency", icon: "DollarSign" },
  { label: "Target price", key: "target_price", type: "currency", icon: "DollarSign" },
  { label: "Expected margin", key: "expected_margin", type: "currency", icon: "Percent" },
  { label: "Status", key: "status", type: "badge", icon: "Info" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function PreCostingDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getPreCosting(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="pre-costing" title="Cost sheet" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function PreCostingDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="pre-costing" title="Cost sheet" fields={fields} data={null} isLoading={true} error={null} />}>
      <PreCostingDetailPageInner />
    </React.Suspense>
  )
}
