"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createPerformanceRecord } from "@/lib/api/performance"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "production_line", label: "Production line ID", type: "number", required: true, placeholder: "Numeric line ID" },
  { name: "style", label: "Style ID", type: "number", placeholder: "Numeric style ID" },
  { name: "record_date", label: "Record date", type: "date", required: true },
  { name: "metric", label: "Metric", required: true },
  { name: "value", label: "Value", type: "number", required: true },
  { name: "target", label: "Target", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewEfficiencyPage() {
  return <MerchandisingForm module="production-efficiency-tracking" title="performance record" fields={fields} onSubmit={(d) => createPerformanceRecord(d)} />
}
