"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createStyle } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "style_number", label: "Style number", required: true },
  { name: "name", label: "Style name", required: true },
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "category", label: "Category" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "is_active", label: "Active", type: "select", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
]

export default function NewStylePage() {
  return <MerchandisingForm module="style-management" title="style" fields={fields} onSubmit={(d) => createStyle({ ...d, is_active: d.is_active === "true" })} />
}
