"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createSmvRecord } from "@/lib/api/costing"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "style", label: "Style ID", type: "number", required: true, placeholder: "Numeric style ID" },
  { name: "smv", label: "SMV", type: "number", required: true },
  { name: "calculated_by", label: "Calculated by" },
  { name: "calculation_date", label: "Calculation date", type: "date", required: true },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewSmvPage() {
  return <MerchandisingForm module="smv-calculation" title="SMV record" fields={fields} onSubmit={(d) => createSmvRecord(d)} />
}
