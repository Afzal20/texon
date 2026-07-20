"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createProcessWiseTarget } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "process_name", label: "Process name", required: true },
  { name: "target_quantity", label: "Target quantity", type: "number", required: true },
  { name: "achieved_quantity", label: "Achieved quantity", type: "number", required: true },
  { name: "variance", label: "Variance", type: "number" },
  { name: "target_date", label: "Target date", type: "date" },
  { name: "status", label: "Status", type: "select", options: [{ value: "on_track", label: "On track" }, { value: "behind", label: "Behind" }, { value: "exceeded", label: "Exceeded" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewProcessTargetPage() {
  return <MerchandisingForm module="process-wise-targets-achievements" title="process target" fields={fields} onSubmit={(d) => createProcessWiseTarget(d)} />
}
