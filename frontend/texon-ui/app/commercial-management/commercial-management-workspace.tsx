"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Ship } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "import-management"
  | "export-management"
  | "export-lc-sales-contract-collection-amendment"
  | "btb-lc-opening-amendment"
  | "shipment-monitoring-eta-updates"
  | "supplier-document-receive-acceptance"
  | "acceptance-clearance"
  | "booking-to-forwarder"
  | "invoice-preparation"
  | "bill-of-exchange-bank-document"
  | "realization-follow-up"
  | "short-realization-cause-tracking"
  | "sod-fc-transfer-acknowledgement"
  | "disbursement-amount-tracking"

type WorkspaceConfig = {
  title: string
  eyebrow: string
  description: string
  action: string
  metrics: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]
  tableTitle: string
  tableDescription: string
  columns: string[]
  rows: string[][]
  statusIndex?: number
  sideTitle: string
  sideDescription: string
  progress: { label: string; value: string; percent: number; tone: string }[]
  notices: { title: string; detail: string; tone: "amber" | "rose" | "emerald" }[]
}

const configs: Record<ModuleKey, WorkspaceConfig> = {
  "import-management": {
    title: "Import Management",
    eyebrow: "Import tracking",
    description: "Track and manage all import activities including LC, shipments, and customs clearance.",
    action: "New import",
    metrics: [
      { label: "Active imports", value: "18", note: "Across 8 suppliers", trend: "neutral" },
      { label: "In transit", value: "6", note: "ETA within 7 days", trend: "up" },
      { label: "Pending clearance", value: "4", note: "Awaiting documents", trend: "down" },
      { label: "Value this month", value: "$2.4M", note: "Total import value", trend: "up" },
    ],
    tableTitle: "Import register",
    tableDescription: "Active import shipments with status tracking.",
    columns: ["Import #", "Supplier", "LC number", "ETD", "ETA", "Status"],
    rows: [
      ["IMP-2418", "Envoy Textiles", "LC-8842", "08 Oct 2024", "18 Oct 2024", "In transit"],
      ["IMP-2415", "Coats Bangladesh", "LC-8836", "10 Oct 2024", "20 Oct 2024", "In transit"],
      ["IMP-2412", "YKK Bangladesh", "LC-8830", "05 Oct 2024", "15 Oct 2024", "Cleared"],
      ["IMP-2408", "Pacific Accessories", "LC-8824", "01 Oct 2024", "12 Oct 2024", "Pending docs"],
    ],
    statusIndex: 5,
    sideTitle: "Import pipeline",
    sideDescription: "Current import status distribution.",
    progress: [
      { label: "Cleared / received", value: "8 imports", percent: 44, tone: "bg-emerald-500" },
      { label: "In transit", value: "6 imports", percent: 33, tone: "bg-primary" },
      { label: "Pending clearance", value: "4 imports", percent: 22, tone: "bg-amber-500" },
    ],
    notices: [{ title: "4 imports pending documents", detail: "Pacific Accessories IMP-2408 needs B/L and invoice.", tone: "amber" }],
  },
  "export-management": {
    title: "Export Management",
    eyebrow: "Export tracking",
    description: "Manage export orders, shipment documentation, and buyer delivery schedules.",
    action: "New export",
    metrics: [
      { label: "Active exports", value: "12", note: "Across 6 buyers", trend: "neutral" },
      { label: "Shipped this month", value: "4", note: "$1.8M total value", trend: "up" },
      { label: "Pending shipment", value: "5", note: "Awaiting inspection", trend: "neutral" },
      { label: "On-time rate", value: "92%", note: "Against committed dates", trend: "up" },
    ],
    tableTitle: "Export shipment tracker",
    tableDescription: "Active export orders with shipment milestones.",
    columns: ["Export #", "Buyer", "PO #", "Shipment date", "Value", "Status"],
    rows: [
      ["EXP-2418", "H&M Group", "PO-84920", "15 Nov 2024", "$428K", "In production"],
      ["EXP-2415", "Zara", "PO-85107", "22 Nov 2024", "$356K", "In production"],
      ["EXP-2412", "Uniqlo", "PO-85241", "08 Nov 2024", "$284K", "Ready to ship"],
      ["EXP-2408", "Levi's", "PO-85322", "01 Nov 2024", "$196K", "Inspection due"],
    ],
    statusIndex: 5,
    sideTitle: "Export value by buyer",
    sideDescription: "Current month export distribution.",
    progress: [
      { label: "H&M Group", value: "$428K", percent: 36, tone: "bg-primary" },
      { label: "Zara / Uniqlo", value: "$640K", percent: 54, tone: "bg-emerald-500" },
      { label: "Other buyers", value: "$120K", percent: 10, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Levi's export inspection due", detail: "EXP-2408 needs final inspection before Nov 1 shipment.", tone: "amber" }],
  },
  "export-lc-sales-contract-collection-amendment": {
    title: "Export LC / Sales Contract Collection & Amendment",
    eyebrow: "LC management",
    description: "Manage export letter of credit collections, amendments, and compliance.",
    action: "New LC",
    metrics: [
      { label: "Active LCs", value: "24", note: "Total LC value $8.6M", trend: "neutral" },
      { label: "Pending amendment", value: "4", note: "$1.2M under review", trend: "down" },
      { label: "LCs matured", value: "8", note: "Ready for negotiation", trend: "up" },
      { label: "Compliance rate", value: "94%", note: "Documents accepted first time", trend: "up" },
    ],
    tableTitle: "LC register",
    tableDescription: "Export LCs and sales contracts with status tracking.",
    columns: ["LC #", "Buyer", "Value", "Issue date", "Expiry", "Status"],
    rows: [
      ["LC-8842", "H&M Group", "$428,600", "01 Oct 2024", "30 Nov 2024", "Active"],
      ["LC-8836", "Zara", "$356,240", "28 Sep 2024", "25 Nov 2024", "Active"],
      ["LC-8830", "Uniqlo", "$284,900", "25 Sep 2024", "20 Nov 2024", "Amendment"],
      ["LC-8824", "Levi's", "$196,800", "20 Sep 2024", "15 Nov 2024", "Matured"],
    ],
    statusIndex: 5,
    sideTitle: "LC status",
    sideDescription: "Current LC pipeline status.",
    progress: [
      { label: "Active / compliant", value: "18 LCs", percent: 75, tone: "bg-emerald-500" },
      { label: "Amendment pending", value: "4 LCs", percent: 17, tone: "bg-amber-500" },
      { label: "Matured / negotiation", value: "2 LCs", percent: 8, tone: "bg-primary" },
    ],
    notices: [{ title: "4 LCs pending amendment", detail: "Uniqlo LC-8830 quantity amendment needs buyer approval.", tone: "amber" }],
  },
  "btb-lc-opening-amendment": {
    title: "BTB LC Opening & Amendment",
    eyebrow: "Back-to-back LC",
    description: "Manage back-to-back letter of credit opening, amendments, and tracking.",
    action: "Open BTB LC",
    metrics: [
      { label: "Active BTB LCs", value: "16", note: "Total value $4.2M", trend: "neutral" },
      { label: "Pending opening", value: "3", note: "Awaiting bank approval", trend: "down" },
      { label: "Amendments pending", value: "2", note: "$680K value change", trend: "neutral" },
      { label: "Utilization rate", value: "88%", note: "LC vs. actual import", trend: "up" },
    ],
    tableTitle: "BTB LC register",
    tableDescription: "Back-to-back LCs linked to export orders.",
    columns: ["BTB LC #", "Supplier", "Export LC", "Value", "Validity", "Status"],
    rows: [
      ["BTB-2418", "Envoy Textiles", "LC-8842", "$186,420", "30 Nov 2024", "Active"],
      ["BTB-2415", "Coats Bangladesh", "LC-8836", "$94,800", "25 Nov 2024", "Active"],
      ["BTB-2412", "YKK Bangladesh", "LC-8830", "$22,760", "20 Nov 2024", "Amendment"],
      ["BTB-2408", "Pacific Accessories", "LC-8824", "$54,980", "15 Nov 2024", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "BTB LC pipeline",
    sideDescription: "LC status distribution.",
    progress: [
      { label: "Active / drawn", value: "12 LCs", percent: 75, tone: "bg-emerald-500" },
      { label: "Amendment pending", value: "2 LCs", percent: 13, tone: "bg-amber-500" },
      { label: "Pending opening", value: "2 LCs", percent: 12, tone: "bg-primary" },
    ],
    notices: [{ title: "BTB-2412 amendment pending", detail: "YKK LC amount needs $4,200 increase for additional trims.", tone: "amber" }],
  },
  "shipment-monitoring-eta-updates": {
    title: "Shipment Monitoring & ETA Updates",
    eyebrow: "Shipment tracking",
    description: "Monitor incoming and outgoing shipments with real-time ETA tracking.",
    action: "Add shipment",
    metrics: [
      { label: "Shipments tracked", value: "28", note: "Active shipments", trend: "neutral" },
      { label: "On schedule", value: "22", note: "79% on-time rate", trend: "up" },
      { label: "Delayed shipments", value: "4", note: "Avg. 3.2 days delay", trend: "down" },
      { label: "ETA accuracy", value: "94%", note: "Forecast vs actual", trend: "up" },
    ],
    tableTitle: "Shipment tracker",
    tableDescription: "Active shipments with ETA monitoring.",
    columns: ["Shipment #", "Type", "Origin / Destination", "Carrier", "ETA", "Status"],
    rows: [
      ["SHP-2418", "Import", "Dhaka → Chittagong", "MAERSK", "18 Oct 2024", "On schedule"],
      ["SHP-2415", "Export", "Chittagong → Rotterdam", "MSC", "02 Nov 2024", "On schedule"],
      ["SHP-2412", "Import", "Shanghai → Chittagong", "COSCO", "22 Oct 2024", "Delayed"],
      ["SHP-2408", "Export", "Chittagong → Long Beach", "Hapag-Lloyd", "15 Nov 2024", "On schedule"],
    ],
    statusIndex: 5,
    sideTitle: "Shipment status",
    sideDescription: "Current shipment pipeline.",
    progress: [
      { label: "On schedule", value: "22 shipments", percent: 79, tone: "bg-emerald-500" },
      { label: "Delayed", value: "4 shipments", percent: 14, tone: "bg-amber-500" },
      { label: "Arrived", value: "2 shipments", percent: 7, tone: "bg-primary" },
    ],
    notices: [{ title: "SHP-2412 delayed 3 days", detail: "COSCO vessel rerouted — new ETA Oct 22.", tone: "amber" }],
  },
  "supplier-document-receive-acceptance": {
    title: "Supplier Document Receive & Acceptance",
    eyebrow: "Document tracking",
    description: "Track supplier document submissions and acceptance status for imports.",
    action: "Log document",
    metrics: [
      { label: "Documents received", value: "42", note: "This month", trend: "up" },
      { label: "Pending review", value: "6", note: "Awaiting acceptance", trend: "neutral" },
      { label: "Rejected documents", value: "2", note: "Need resubmission", trend: "down" },
      { label: "Acceptance rate", value: "95%", note: "First-time acceptance", trend: "up" },
    ],
    tableTitle: "Document register",
    tableDescription: "Supplier documents received with acceptance tracking.",
    columns: ["Document #", "Supplier", "PO #", "Type", "Received", "Status"],
    rows: [
      ["DOC-2418", "Envoy Textiles", "PO-84920", "B/L + Invoice", "14 Oct 2024", "Accepted"],
      ["DOC-2415", "Coats Bangladesh", "PO-85107", "B/L + Packing list", "13 Oct 2024", "Accepted"],
      ["DOC-2412", "YKK Bangladesh", "PO-85241", "Invoice only", "12 Oct 2024", "Pending B/L"],
      ["DOC-2408", "Pacific Accessories", "PO-85322", "B/L + Invoice", "10 Oct 2024", "Rejected"],
    ],
    statusIndex: 5,
    sideTitle: "Document status",
    sideDescription: "Monthly document processing.",
    progress: [
      { label: "Accepted", value: "34 documents", percent: 81, tone: "bg-emerald-500" },
      { label: "Pending review", value: "6 documents", percent: 14, tone: "bg-amber-500" },
      { label: "Rejected", value: "2 documents", percent: 5, tone: "bg-rose-500" },
    ],
    notices: [{ title: "DOC-2408 rejected", detail: "Pacific Accessories invoice has pricing discrepancy — request correction.", tone: "rose" }],
  },
  "acceptance-clearance": {
    title: "Acceptance Clearance",
    eyebrow: "Clearance tracking",
    description: "Manage document acceptance and customs clearance for imported goods.",
    action: "New clearance",
    metrics: [
      { label: "Pending clearance", value: "6", note: "Awaiting acceptance", trend: "neutral" },
      { label: "Cleared this month", value: "12", note: "Avg. 2.4 days", trend: "up" },
      { label: "On hold", value: "2", note: "Document issues", trend: "down" },
      { label: "Clearance rate", value: "86%", note: "Within target time", trend: "up" },
    ],
    tableTitle: "Clearance register",
    tableDescription: "Import clearance status by shipment.",
    columns: ["Clearance #", "Shipment", "Supplier", "Documents", "Submitted", "Status"],
    rows: [
      ["CLR-2418", "SHP-2418", "Envoy Textiles", "B/L, Invoice, PL", "15 Oct 2024", "In progress"],
      ["CLR-2415", "SHP-2415", "Coats Bangladesh", "B/L, Invoice", "14 Oct 2024", "Cleared"],
      ["CLR-2412", "SHP-2412", "YKK Bangladesh", "Invoice, B/L", "13 Oct 2024", "On hold"],
      ["CLR-2408", "SHP-2408", "Pacific Accessories", "B/L, Invoice", "12 Oct 2024", "Cleared"],
    ],
    statusIndex: 5,
    sideTitle: "Clearance pipeline",
    sideDescription: "Current clearance status.",
    progress: [
      { label: "Cleared", value: "12 shipments", percent: 60, tone: "bg-emerald-500" },
      { label: "In progress", value: "6 shipments", percent: 30, tone: "bg-primary" },
      { label: "On hold", value: "2 shipments", percent: 10, tone: "bg-rose-500" },
    ],
    notices: [{ title: "CLR-2412 on hold", detail: "YKK B/L not received — follow up with supplier.", tone: "rose" }],
  },
  "booking-to-forwarder": {
    title: "Booking to Forwarder",
    eyebrow: "Freight booking",
    description: "Manage freight bookings with shipping lines and forwarders for imports and exports.",
    action: "New booking",
    metrics: [
      { label: "Active bookings", value: "14", note: "Confirmed with forwarders", trend: "neutral" },
      { label: "Pending confirmation", value: "3", note: "Awaiting slot allocation", trend: "down" },
      { label: "Completed this month", value: "8", note: "Shipments departed", trend: "up" },
      { label: "Booking value", value: "$186K", note: "Freight charges MTD", trend: "neutral" },
    ],
    tableTitle: "Booking register",
    tableDescription: "Freight bookings with shipping lines and forwarders.",
    columns: ["Booking #", "Shipment", "Forwarder", "Vessel/Flight", "ETD", "Status"],
    rows: [
      ["BK-2418", "SHP-2418", "DHL Global", "MAERSK SEALAND", "16 Oct 2024", "Confirmed"],
      ["BK-2415", "SHP-2415", "Flexport", "MSC ANNA", "28 Oct 2024", "Confirmed"],
      ["BK-2412", "SHP-2412", "Expeditors", "COSCO SHIPPING", "19 Oct 2024", "Pending"],
      ["BK-2408", "SHP-2408", "Kuehne+Nagel", "Hapag-Lloyd", "10 Nov 2024", "Tentative"],
    ],
    statusIndex: 5,
    sideTitle: "Booking status",
    sideDescription: "Current booking pipeline.",
    progress: [
      { label: "Confirmed", value: "11 bookings", percent: 79, tone: "bg-emerald-500" },
      { label: "Pending", value: "2 bookings", percent: 14, tone: "bg-amber-500" },
      { label: "Tentative", value: "1 booking", percent: 7, tone: "bg-slate-400" },
    ],
    notices: [{ title: "2 bookings pending confirmation", detail: "BK-2412 awaiting vessel slot from COSCO.", tone: "amber" }],
  },
  "invoice-preparation": {
    title: "Invoice Preparation",
    eyebrow: "Invoice management",
    description: "Prepare, review, and manage commercial invoices for exports and imports.",
    action: "Create invoice",
    metrics: [
      { label: "Invoices prepared", value: "36", note: "This month", trend: "up" },
      { label: "Pending review", value: "4", note: "Awaiting approval", trend: "neutral" },
      { label: "Invoiced value", value: "$4.8M", note: "Total invoiced MTD", trend: "up" },
      { label: "Error rate", value: "2.8%", note: "Below 5% target", trend: "up" },
    ],
    tableTitle: "Invoice register",
    tableDescription: "Commercial invoices with approval status.",
    columns: ["Invoice #", "Buyer/Supplier", "PO #", "Amount", "Prepared", "Status"],
    rows: [
      ["INV-2418", "H&M Group", "PO-84920", "$428,600", "14 Oct 2024", "Approved"],
      ["INV-2415", "Zara", "PO-85107", "$356,240", "13 Oct 2024", "Approved"],
      ["INV-2412", "Uniqlo", "PO-85241", "$284,900", "12 Oct 2024", "Pending review"],
      ["INV-2408", "Levi's", "PO-85322", "$196,800", "10 Oct 2024", "Draft"],
    ],
    statusIndex: 5,
    sideTitle: "Invoice pipeline",
    sideDescription: "Monthly invoice processing status.",
    progress: [
      { label: "Approved / sent", value: "28 invoices", percent: 78, tone: "bg-emerald-500" },
      { label: "Pending review", value: "6 invoices", percent: 17, tone: "bg-amber-500" },
      { label: "Draft", value: "2 invoices", percent: 5, tone: "bg-slate-400" },
    ],
    notices: [{ title: "4 invoices pending review", detail: "Uniqlo INV-2412 needs amount verification before approval.", tone: "amber" }],
  },
  "bill-of-exchange-bank-document": {
    title: "Bill of Exchange / Bank Document",
    eyebrow: "Bank documents",
    description: "Manage bills of exchange, bank documents, and trade finance paperwork.",
    action: "New document",
    metrics: [
      { label: "Documents processed", value: "28", note: "This month", trend: "up" },
      { label: "Pending bank action", value: "4", note: "Awaiting negotiation", trend: "neutral" },
      { label: "Document value", value: "$3.6M", note: "Total processed MTD", trend: "up" },
      { label: "Processing time", value: "2.1 days", note: "Avg. bank processing", trend: "up" },
    ],
    tableTitle: "Bank document register",
    tableDescription: "Bills of exchange and trade finance documents.",
    columns: ["Document #", "LC #", "Bank", "Amount", "Submitted", "Status"],
    rows: [
      ["BDE-2418", "LC-8842", "Citibank", "$428,600", "15 Oct 2024", "Negotiated"],
      ["BDE-2415", "LC-8836", "HSBC", "$356,240", "14 Oct 2024", "Under review"],
      ["BDE-2412", "LC-8830", "Standard Chartered", "$284,900", "12 Oct 2024", "Negotiated"],
      ["BDE-2408", "LC-8824", "Citibank", "$196,800", "10 Oct 2024", "Pending docs"],
    ],
    statusIndex: 5,
    sideTitle: "Document pipeline",
    sideDescription: "Bank document processing status.",
    progress: [
      { label: "Negotiated / settled", value: "20 documents", percent: 71, tone: "bg-emerald-500" },
      { label: "Under review", value: "6 documents", percent: 21, tone: "bg-amber-500" },
      { label: "Pending docs", value: "2 documents", percent: 7, tone: "bg-rose-500" },
    ],
    notices: [{ title: "BDE-2408 pending documents", detail: "Citibank needs additional supporting documents.", tone: "amber" }],
  },
  "realization-follow-up": {
    title: "Realization Follow-up",
    eyebrow: "Realization tracking",
    description: "Track export realization status and follow up on pending payments from buyers.",
    action: "Log realization",
    metrics: [
      { label: "Realizations tracked", value: "24", note: "This month", trend: "up" },
      { label: "Pending realization", value: "6", note: "$1.2M awaiting", trend: "neutral" },
      { label: "Realized value", value: "$3.8M", note: "89% of invoiced", trend: "up" },
      { label: "Avg. days to realize", value: "28 days", note: "Below 35-day target", trend: "up" },
    ],
    tableTitle: "Realization tracker",
    tableDescription: "Export realization status with payment follow-up.",
    columns: ["Realization #", "Buyer", "Invoice #", "Amount", "Due date", "Status"],
    rows: [
      ["RLZ-2418", "H&M Group", "INV-2418", "$428,600", "15 Nov 2024", "Expected"],
      ["RLZ-2415", "Zara", "INV-2415", "$356,240", "12 Nov 2024", "Expected"],
      ["RLZ-2412", "Uniqlo", "INV-2412", "$284,900", "08 Nov 2024", "Overdue"],
      ["RLZ-2408", "Levi's", "INV-2408", "$196,800", "01 Nov 2024", "Follow-up"],
    ],
    statusIndex: 5,
    sideTitle: "Realization status",
    sideDescription: "Current realization pipeline.",
    progress: [
      { label: "Realized", value: "18 payments", percent: 75, tone: "bg-emerald-500" },
      { label: "Expected", value: "4 payments", percent: 17, tone: "bg-primary" },
      { label: "Overdue / follow-up", value: "2 payments", percent: 8, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Uniqlo payment overdue", detail: "RLZ-2412 $284,900 is 5 days past due — escalate.", tone: "rose" }],
  },
  "short-realization-cause-tracking": {
    title: "Short Realization Cause Tracking",
    eyebrow: "Shortfall tracking",
    description: "Track and analyze causes of short realization amounts against invoiced values.",
    action: "Log shortfall",
    metrics: [
      { label: "Shortfalls tracked", value: "8", note: "This month", trend: "down" },
      { label: "Total shortfall", value: "$42.6K", note: "Across 4 buyers", trend: "down" },
      { label: "Resolved", value: "5", note: "Amount recovered", trend: "up" },
      { label: "Recovery rate", value: "78%", note: "Of total shortfall", trend: "up" },
    ],
    tableTitle: "Short realization register",
    tableDescription: "Shortfalls between invoiced and realized amounts.",
    columns: ["Shortfall #", "Buyer", "Invoice #", "Short amount", "Cause", "Status"],
    rows: [
      ["SRT-2418", "H&M Group", "INV-2418", "$8,420", "Quality deduction", "Resolved"],
      ["SRT-2415", "Zara", "INV-2415", "$12,640", "Rate dispute", "Under review"],
      ["SRT-2412", "Uniqlo", "INV-2412", "$6,280", "Quantity variance", "Resolved"],
      ["SRT-2408", "Levi's", "INV-2408", "$15,260", "Delayed delivery penalty", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Shortfall by cause",
    sideDescription: "Monthly shortfall distribution.",
    progress: [
      { label: "Quality deductions", value: "$18.2K", percent: 43, tone: "bg-rose-500" },
      { label: "Rate disputes", value: "$12.6K", percent: 30, tone: "bg-amber-500" },
      { label: "Quantity / other", value: "$11.8K", percent: 27, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Levi's penalty pending resolution", detail: "SRT-2408 $15,260 delay penalty needs management review.", tone: "rose" }],
  },
  "sod-fc-transfer-acknowledgement": {
    title: "SOD / FC Transfer Acknowledgement",
    eyebrow: "Transfer tracking",
    description: "Track SOD (Statement of Deficiency) and FC (Foreign Currency) transfers with acknowledgements.",
    action: "Log transfer",
    metrics: [
      { label: "Transfers tracked", value: "18", note: "This month", trend: "neutral" },
      { label: "Pending acknowledgement", value: "3", note: "$680K awaiting", trend: "down" },
      { label: "Acknowledged", value: "15", note: "83% completion", trend: "up" },
      { label: "Transfer value", value: "$2.8M", note: "Total MTD", trend: "up" },
    ],
    tableTitle: "Transfer register",
    tableDescription: "SOD and FC transfers with acknowledgement status.",
    columns: ["Transfer #", "Type", "Bank", "Amount", "Date", "Status"],
    rows: [
      ["TRF-2418", "FC Transfer", "Citibank", "$428,600", "15 Oct 2024", "Acknowledged"],
      ["TRF-2415", "SOD", "HSBC", "$186,420", "14 Oct 2024", "Acknowledged"],
      ["TRF-2412", "FC Transfer", "Standard Chartered", "$356,240", "12 Oct 2024", "Pending"],
      ["TRF-2408", "SOD", "Citibank", "$94,800", "10 Oct 2024", "Acknowledged"],
    ],
    statusIndex: 5,
    sideTitle: "Transfer status",
    sideDescription: "Current transfer pipeline.",
    progress: [
      { label: "Acknowledged", value: "15 transfers", percent: 83, tone: "bg-emerald-500" },
      { label: "Pending", value: "3 transfers", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "3 transfers pending acknowledgement", detail: "TRF-2412 FC transfer needs bank confirmation.", tone: "amber" }],
  },
  "disbursement-amount-tracking": {
    title: "Disbursement Amount Tracking",
    eyebrow: "Disbursement tracking",
    description: "Track and reconcile disbursement amounts against approved budgets and POs.",
    action: "Log disbursement",
    metrics: [
      { label: "Disbursements tracked", value: "32", note: "This month", trend: "up" },
      { label: "Pending approval", value: "4", note: "$280K awaiting", trend: "neutral" },
      { label: "Disbursed value", value: "$4.2M", note: "Total MTD", trend: "up" },
      { label: "Budget utilization", value: "78%", note: "Against monthly budget", trend: "up" },
    ],
    tableTitle: "Disbursement register",
    tableDescription: "Disbursement amounts with approval and reconciliation status.",
    columns: ["Disbursement #", "Category", "PO / Invoice", "Amount", "Date", "Status"],
    rows: [
      ["DIS-2418", "Material purchase", "PO-84920", "$186,420", "15 Oct 2024", "Disbursed"],
      ["DIS-2415", "Freight charges", "BK-2415", "$42,800", "14 Oct 2024", "Disbursed"],
      ["DIS-2412", "Customs duty", "CLR-2412", "$28,600", "13 Oct 2024", "Pending approval"],
      ["DIS-2408", "Supplier payment", "PO-85241", "$94,800", "12 Oct 2024", "Disbursed"],
    ],
    statusIndex: 5,
    sideTitle: "Disbursement by category",
    sideDescription: "Monthly disbursement distribution.",
    progress: [
      { label: "Material purchases", value: "$2.8M", percent: 67, tone: "bg-primary" },
      { label: "Freight & logistics", value: "$840K", percent: 20, tone: "bg-emerald-500" },
      { label: "Duties & other", value: "$560K", percent: 13, tone: "bg-slate-400" },
    ],
    notices: [{ title: "4 disbursements pending approval", detail: "Customs duty DIS-2412 needs finance approval.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function CommercialManagementWorkspace({
  module,
  metrics,
  rows,
  isLoading,
  error,
  rawItems,
}: {
  module: ModuleKey
  metrics?: WorkspaceConfig["metrics"]
  rows?: string[][]
  isLoading?: boolean
  error?: string | null
  rawItems?: Record<string, unknown>[]
}) {
  const config = configs[module]
  const displayMetrics = metrics || config.metrics
  const displayRows = rows || config.rows

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/commercial-management" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Commercial Management
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{config.eyebrow}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.success(`${config.title} exported`)}><Download className="size-4" /> Export</Button>
            <Button className="gap-2" onClick={() => toast.info(`${config.action} form opened`)}><Plus className="size-4" /> {config.action}</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {displayMetrics.map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Ship className="size-4 text-muted-foreground" />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="gap-0 py-0 xl:col-span-2">
            <CardHeader className="border-b px-5 py-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <CardTitle>{config.tableTitle}</CardTitle>
                  <CardDescription>{config.tableDescription}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Advanced filters are ready to configure")}><Filter className="size-3.5" /> Filter</Button>
              </div>
              <div className="relative mt-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-9 text-sm" placeholder={`Search ${config.tableTitle.toLowerCase()}...`} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full text-xs sm:text-[13px]">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-3 py-2.5 font-semibold whitespace-nowrap">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-3 py-2.5 whitespace-nowrap ${index === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${noticeClass(cell as "amber" | "rose" | "emerald")}`}>{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
                <span>Showing 4 of 24 records</span>
                <button className="flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => toast.info("Opening full register")}>View all <ArrowUpRight className="size-3" /></button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><Ship className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
                <CardDescription>{config.sideDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                {config.progress.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-muted-foreground">{item.label}</span><span className="font-medium text-foreground">{item.value}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.percent}%` }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="gap-4">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Commercial attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening commercial task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Commercial hub</p><p className="text-xs text-muted-foreground">All trade finance data syncs across modules.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
