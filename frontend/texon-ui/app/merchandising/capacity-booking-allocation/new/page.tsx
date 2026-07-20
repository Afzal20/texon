"use client"

import { MerchandisingForm } from "../../merchandising-form"
import { createCapacityBooking } from "@/lib/api/production"
import type { FormField } from "../../merchandising-form"

const fields: FormField[] = [
  { name: "line", label: "Line", required: true },
  { name: "style", label: "Style ID", type: "number", placeholder: "Numeric style ID" },
  { name: "capacity_per_day", label: "Capacity per day", type: "number", required: true },
  { name: "booking_date", label: "Booking date", type: "date", required: true },
  { name: "status", label: "Status", type: "select", options: [{ value: "scheduled", label: "Scheduled" }, { value: "in_use", label: "In use" }, { value: "released", label: "Released" }] },
  { name: "notes", label: "Notes", type: "textarea" },
]

export default function NewCapacityBookingPage() {
  return <MerchandisingForm module="capacity-booking-allocation" title="booking" fields={fields} onSubmit={(d) => createCapacityBooking(d)} />
}
