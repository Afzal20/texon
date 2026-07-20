"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createBuyerEnquiry } from "@/lib/api/merchandising"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "buyer", label: "Buyer ID", type: "number", required: true, placeholder: "Numeric buyer ID" },
  { name: "style", label: "Style ID", type: "number", placeholder: "Numeric style ID" },
  { name: "enquiry_date", label: "Enquiry date", type: "date", required: true },
  { name: "status", label: "Status", type: "select", options: [{ value: "received", label: "Received" }, { value: "in_discussion", label: "In discussion" }, { value: "quoting", label: "Quoting" }, { value: "converted", label: "Converted" }, { value: "lost", label: "Lost" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewBuyerEnquiryPage() {
  return <MerchandisingForm module="buyer-enquiry-analysis" title="enquiry" fields={fields} onSubmit={(d) => createBuyerEnquiry(d)} />
}
