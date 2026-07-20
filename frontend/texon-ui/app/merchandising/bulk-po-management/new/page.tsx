"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createPurchaseOrder } from "@/lib/api/procurement"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "po_number", label: "PO number", required: true },
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "style", label: "Style ID", type: "number", required: true, placeholder: "Numeric style ID" },
  { name: "order_date", label: "Order date", type: "date", required: true },
  { name: "delivery_date", label: "Delivery date", type: "date", required: true },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "unit_price", label: "Unit price", type: "number" },
  { name: "total_value", label: "Total value", type: "number" },
  { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "confirmed", label: "Confirmed" }, { value: "in_production", label: "In production" }, { value: "ready_to_ship", label: "Ready to ship" }, { value: "shipped", label: "Shipped" }, { value: "completed", label: "Completed" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewBulkPoPage() {
  return <MerchandisingForm module="bulk-po-management" title="purchase order" fields={fields} onSubmit={(d) => createPurchaseOrder(d)} />
}
