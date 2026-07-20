"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createBudgetDemandAssessment } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "assessment_date", label: "Assessment date", type: "date", required: true },
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "forecast_quantity", label: "Forecast quantity", type: "number", required: true },
  { name: "booked_quantity", label: "Booked quantity", type: "number", required: true },
  { name: "gap_quantity", label: "Gap quantity", type: "number" },
  { name: "revenue_estimate", label: "Revenue estimate", type: "number" },
  { name: "confidence", label: "Confidence", type: "select", options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewBudgetDemandPage() {
  return <MerchandisingForm module="budget-demand-assessment" title="assessment" fields={fields} onSubmit={(d) => createBudgetDemandAssessment(d)} />
}
