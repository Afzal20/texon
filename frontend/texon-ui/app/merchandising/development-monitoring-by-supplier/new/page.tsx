"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createDevelopmentMonitor } from "@/lib/api/production"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "style", label: "Style ID", type: "number", required: true, placeholder: "Numeric style ID" },
  { name: "supplier", label: "Supplier", required: true },
  { name: "stage", label: "Stage", required: true, options: [{ value: "tech_pack", label: "Tech pack" }, { value: "proto", label: "Proto sample" }, { value: "fit_sample", label: "Fit sample" }, { value: "pp_sample", label: "PP sample" }, { value: "bulk_ready", label: "Bulk ready" }] },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "completion_date", label: "Completion date", type: "date" },
  { name: "status", label: "Status", type: "select", options: [{ value: "in_progress", label: "In progress" }, { value: "completed", label: "Completed" }, { value: "at_risk", label: "At risk" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewDevMonitoringPage() {
  return <MerchandisingForm module="development-monitoring-by-supplier" title="development" fields={fields} onSubmit={(d) => createDevelopmentMonitor(d)} />
}
