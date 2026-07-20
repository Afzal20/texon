"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createProductionDowntime } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "production_line", label: "Production line ID", type: "number", required: true, placeholder: "Numeric line ID" },
  { name: "style", label: "Style ID", type: "number", placeholder: "Numeric style ID" },
  { name: "start_datetime", label: "Start date/time", type: "date", required: true },
  { name: "duration_hours", label: "Duration (hours)", type: "number", required: true },
  { name: "cause", label: "Cause", required: true, options: [{ value: "machine_breakdown", label: "Machine breakdown" }, { value: "material_shortage", label: "Material shortage" }, { value: "operator_absence", label: "Operator absence" }, { value: "quality_issue", label: "Quality issue" }, { value: "power_outage", label: "Power outage" }, { value: "other", label: "Other" }] },
  { name: "description", label: "Description", type: "textarea" },
  { name: "status", label: "Status", type: "select", options: [{ value: "ongoing", label: "Ongoing" }, { value: "resolved", label: "Resolved" }] },
]

export default function NewDowntimePage() {
  return <MerchandisingForm module="production-downtime-analysis" title="downtime" fields={fields} onSubmit={(d) => createProductionDowntime(d)} />
}
