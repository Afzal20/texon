"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createIeSuggestion } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "production_line", label: "Production line ID", type: "number", required: true, placeholder: "Numeric line ID" },
  { name: "style", label: "Style ID", type: "number", placeholder: "Numeric style ID" },
  { name: "operation", label: "Operation", required: true },
  { name: "current_pph", label: "Current PPH", type: "number", required: true },
  { name: "target_pph", label: "Target PPH", type: "number", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "under_review", label: "Under review" }, { value: "implemented", label: "Implemented" }, { value: "rejected", label: "Rejected" }] },
]

export default function NewIeSuggestionPage() {
  return <MerchandisingForm module="ie-suggestion-for-pph" title="IE suggestion" fields={fields} onSubmit={(d) => createIeSuggestion(d)} />
}
