"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createSampleOrder } from "@/lib/api/orders"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "sample_type", label: "Sample type", required: true, options: [{ value: "fit", label: "FIT" }, { value: "pp", label: "PP" }] },
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "style", label: "Style ID", type: "number", required: true, placeholder: "Numeric style ID" },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "request_date", label: "Request date", type: "date", required: true },
  { name: "deadline", label: "Deadline", type: "date", required: true },
  { name: "status", label: "Status", type: "select", options: [{ value: "in_progress", label: "In progress" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" }, { value: "revisions", label: "Revisions needed" }, { value: "rejected", label: "Rejected" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewSampleMonitoringPage() {
  return <MerchandisingForm module="sample-monitoring-fit-pp" title="sample" fields={fields} onSubmit={(d) => createSampleOrder(d)} />
}
