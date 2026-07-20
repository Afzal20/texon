"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createProductionLine } from "@/lib/api/production"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "name", label: "Line name", required: true },
  { name: "code", label: "Code" },
  { name: "location", label: "Location" },
  { name: "capacity", label: "Capacity", type: "number", required: true },
  { name: "is_active", label: "Active", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
]

export default function NewLineLayoutPage() {
  return <MerchandisingForm module="line-layout" title="line" fields={fields} onSubmit={(d) => createProductionLine({ ...d, is_active: d.is_active === "true" })} />
}
