"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createPreCosting } from "@/lib/api/costing"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "cost_date", label: "Cost date", type: "date", required: true },
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "style", label: "Style ID", type: "number", required: true, placeholder: "Numeric style ID" },
  { name: "estimated_fabric_cost", label: "Fabric cost", type: "number" },
  { name: "estimated_accessory_cost", label: "Accessory cost", type: "number" },
  { name: "estimated_trim_cost", label: "Trim cost", type: "number" },
  { name: "estimated_labor_cost", label: "Labor cost", type: "number" },
  { name: "estimated_overhead", label: "Overhead", type: "number" },
  { name: "total_estimated_cost", label: "Total estimated cost", type: "number" },
  { name: "target_price", label: "Target price", type: "number" },
  { name: "expected_margin", label: "Expected margin", type: "number" },
  { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "submitted", label: "Submitted" }, { value: "approved", label: "Approved" }, { value: "revised", label: "Revised" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewPreCostingPage() {
  return <MerchandisingForm module="pre-costing" title="cost sheet" fields={fields} onSubmit={(d) => createPreCosting(d)} />
}
