"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Shirt } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "style-management"
  | "pre-costing"
  | "sample-order-management"
  | "bulk-po-management"
  | "budget-demand-assessment"
  | "capacity-booking-allocation"
  | "buyer-enquiry-analysis"
  | "rm-collection-consumption-sourcing"
  | "development-monitoring-by-supplier"
  | "sample-monitoring-fit-pp"
  | "smv-calculation"
  | "ie-suggestion-for-pph"
  | "skill-inventory"
  | "production-downtime-analysis"
  | "line-layout"
  | "process-wise-targets-achievements"
  | "production-efficiency-tracking"

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
  "style-management": {
    title: "Style Management",
    eyebrow: "Style master",
    description: "Maintain style library, tech packs, and buyer-specific variants.",
    action: "Add style",
    metrics: [
      { label: "Active styles", value: "342", note: "Across 18 buyers", trend: "up" },
      { label: "In development", value: "48", note: "Awaiting tech pack approval", trend: "neutral" },
      { label: "Approved for production", value: "96", note: "Ready for costing", trend: "up" },
      { label: "Archived styles", value: "1,204", note: "Previous seasons", trend: "neutral" },
    ],
    tableTitle: "Style register",
    tableDescription: "Most recent style submissions and their development stage.",
    columns: ["Style #", "Style name", "Buyer", "Category", "Season", "Status"],
    rows: [
      ["STY-4821", "Relaxed Oxford Shirt", "H&M Group", "Woven top", "SS 2025", "Approved"],
      ["STY-4816", "Stretch Cargo Pant", "Zara (Inditex)", "Bottoms", "SS 2025", "In review"],
      ["STY-4804", "Ribbed Tank Top", "Uniqlo", "Knit top", "FW 2025", "In development"],
      ["STY-4798", "Denim Trucker Jacket", "Levi's", "Outerwear", "FW 2025", "Submitted"],
    ],
    statusIndex: 5,
    sideTitle: "Style pipeline",
    sideDescription: "Current styles by development stage.",
    progress: [
      { label: "Approved for production", value: "96 styles", percent: 28, tone: "bg-emerald-500" },
      { label: "In review / sampling", value: "48 styles", percent: 14, tone: "bg-amber-500" },
      { label: "In development", value: "198 styles", percent: 58, tone: "bg-primary" },
    ],
    notices: [{ title: "48 styles awaiting tech pack review", detail: "Prioritize SS 2025 submissions to meet buyer deadlines.", tone: "amber" }],
  },
  "pre-costing": {
    title: "Pre-Costing",
    eyebrow: "Cost estimation",
    description: "Generate preliminary cost sheets before final costing and buyer approval.",
    action: "New cost sheet",
    metrics: [
      { label: "Cost sheets this month", value: "24", note: "12 awaiting buyer approval", trend: "up" },
      { label: "Average FOB estimate", value: "$8.42", note: "Across active styles", trend: "neutral" },
      { label: "Approved costings", value: "18", note: "Ready for bulk PO", trend: "up" },
      { label: "Pending revisions", value: "6", note: "Buyer feedback received", trend: "down" },
    ],
    tableTitle: "Recent cost sheets",
    tableDescription: "Preliminary FOB estimates with material and labor breakdown.",
    columns: ["Cost sheet", "Style", "Buyer", "FOB estimate", "Fabric cost", "Status"],
    rows: [
      ["CS-2418", "STY-4821 · Relaxed Oxford", "H&M Group", "$8.64", "$3.28", "Approved"],
      ["CS-2415", "STY-4816 · Stretch Cargo", "Zara", "$9.12", "$3.86", "Buyer review"],
      ["CS-2412", "STY-4804 · Ribbed Tank", "Uniqlo", "$5.48", "$1.92", "Approved"],
      ["CS-2408", "STY-4798 · Denim Jacket", "Levi's", "$14.20", "$6.44", "Revision needed"],
    ],
    statusIndex: 5,
    sideTitle: "Cost breakdown",
    sideDescription: "Average FOB composition for approved sheets.",
    progress: [
      { label: "Fabric & trims", value: "$4.18", percent: 50, tone: "bg-primary" },
      { label: "CM (cut & make)", value: "$2.86", percent: 34, tone: "bg-emerald-500" },
      { label: "Overhead & profit", value: "$1.38", percent: 16, tone: "bg-slate-400" },
    ],
    notices: [{ title: "6 cost sheets need revision", detail: "Buyer-requested changes to trim specifications.", tone: "amber" }],
  },
  "sample-order-management": {
    title: "Sample Order Management",
    eyebrow: "Sample tracking",
    description: "Manage sample requests, approvals, and shipment to buyers.",
    action: "Create sample order",
    metrics: [
      { label: "Active sample orders", value: "64", note: "Across 12 buyers", trend: "neutral" },
      { label: "Shipped this month", value: "18", note: "14 awaiting buyer feedback", trend: "up" },
      { label: "Approved samples", value: "22", note: "Ready for bulk transition", trend: "up" },
      { label: "Overdue samples", value: "4", note: "Past committed ship date", trend: "down" },
    ],
    tableTitle: "Sample order tracker",
    tableDescription: "Sample orders ranked by buyer deadline.",
    columns: ["Sample #", "Style", "Buyer", "Type", "Ship date", "Status"],
    rows: [
      ["SMP-8421", "STY-4821 · Relaxed Oxford", "H&M", "Fit sample", "18 Oct 2024", "Shipped"],
      ["SMP-8416", "STY-4816 · Stretch Cargo", "Zara", "Proto sample", "22 Oct 2024", "In production"],
      ["SMP-8404", "STY-4804 · Ribbed Tank", "Uniqlo", "PP sample", "15 Oct 2024", "Approved"],
      ["SMP-8398", "STY-4798 · Denim Jacket", "Levi's", "Fit sample", "12 Oct 2024", "Overdue"],
    ],
    statusIndex: 5,
    sideTitle: "Sample types",
    sideDescription: "Current sample orders by type.",
    progress: [
      { label: "Fit samples", value: "24 orders", percent: 38, tone: "bg-primary" },
      { label: "Proto / PP samples", value: "28 orders", percent: 44, tone: "bg-emerald-500" },
      { label: "Top of production", value: "12 orders", percent: 18, tone: "bg-amber-500" },
    ],
    notices: [{ title: "4 sample orders overdue", detail: "Levi's fit sample SMP-8398 is 6 days past ship date.", tone: "rose" }],
  },
  "bulk-po-management": {
    title: "Bulk PO Management",
    eyebrow: "Purchase orders",
    description: "Track bulk purchase orders from confirmation through shipment.",
    action: "New PO",
    metrics: [
      { label: "Open POs", value: "38", note: "$4.82M total value", trend: "neutral" },
      { label: "POs in production", value: "24", note: "62% of open orders", trend: "up" },
      { label: "Ready to ship", value: "8", note: "Awaiting booking", trend: "up" },
      { label: "Overdue POs", value: "3", note: "$486K at risk", trend: "down" },
    ],
    tableTitle: "Active purchase orders",
    tableDescription: "Bulk POs ordered by shipment date.",
    columns: ["PO #", "Buyer", "Style", "Qty (pcs)", "Ship date", "Status"],
    rows: [
      ["PO-84920", "H&M Group", "STY-4821 · Relaxed Oxford", "12,400", "15 Nov 2024", "In production"],
      ["PO-85107", "Zara", "STY-4816 · Stretch Cargo", "8,600", "22 Nov 2024", "In production"],
      ["PO-85241", "Uniqlo", "STY-4804 · Ribbed Tank", "18,200", "08 Nov 2024", "Ready to ship"],
      ["PO-85322", "Levi's", "STY-4798 · Denim Jacket", "4,800", "01 Nov 2024", "Overdue"],
    ],
    statusIndex: 5,
    sideTitle: "Order value by buyer",
    sideDescription: "Open PO value distribution.",
    progress: [
      { label: "H&M Group", value: "$1.86M", percent: 39, tone: "bg-primary" },
      { label: "Zara / Uniqlo", value: "$2.14M", percent: 44, tone: "bg-emerald-500" },
      { label: "Other buyers", value: "$820K", percent: 17, tone: "bg-slate-400" },
    ],
    notices: [{ title: "3 POs past shipment date", detail: "Levi's PO-85322 is 8 days overdue — follow up with production.", tone: "rose" }],
  },
  "budget-demand-assessment": {
    title: "Budget & Demand Assessment",
    eyebrow: "Demand planning",
    description: "Evaluate buyer demand against factory capacity and financial targets.",
    action: "New assessment",
    metrics: [
      { label: "Forecast demand", value: "1.24M pcs", note: "Next quarter", trend: "up" },
      { label: "Booked capacity", value: "860K pcs", note: "69% utilization", trend: "neutral" },
      { label: "Budget gap", value: "380K pcs", note: "Needs additional orders", trend: "down" },
      { label: "Revenue target", value: "$12.4M", note: "Q1 2025 forecast", trend: "up" },
    ],
    tableTitle: "Buyer demand forecast",
    tableDescription: "Projected order volume by buyer for the upcoming quarter.",
    columns: ["Buyer", "Forecast (pcs)", "Booked (pcs)", "Gap (pcs)", "Revenue est.", "Confidence"],
    rows: [
      ["H&M Group", "320,000", "248,000", "72,000", "$3.2M", "High"],
      ["Zara (Inditex)", "280,000", "214,000", "66,000", "$2.8M", "High"],
      ["Uniqlo", "240,000", "196,000", "44,000", "$2.4M", "Medium"],
      ["Levi's", "180,000", "124,000", "56,000", "$1.8M", "Medium"],
    ],
    statusIndex: 5,
    sideTitle: "Capacity utilization",
    sideDescription: "Quarterly capacity allocation.",
    progress: [
      { label: "Booked orders", value: "860K pcs", percent: 69, tone: "bg-emerald-500" },
      { label: "Tentative bookings", value: "180K pcs", percent: 15, tone: "bg-amber-500" },
      { label: "Available capacity", value: "200K pcs", percent: 16, tone: "bg-slate-400" },
    ],
    notices: [{ title: "380K piece capacity gap", detail: "Need additional buyer commitments to meet revenue target.", tone: "amber" }],
  },
  "capacity-booking-allocation": {
    title: "Capacity & Booking Allocation",
    eyebrow: "Line allocation",
    description: "Allocate production lines to orders and manage booking conflicts.",
    action: "New booking",
    metrics: [
      { label: "Lines allocated", value: "14 / 18", note: "78% utilization", trend: "up" },
      { label: "Booking conflicts", value: "2", note: "Need rescheduling", trend: "down" },
      { label: "Unallocated lines", value: "4", note: "Available next week", trend: "neutral" },
      { label: "Capacity efficiency", value: "82.4%", note: "Monthly average", trend: "up" },
    ],
    tableTitle: "Line allocation schedule",
    tableDescription: "Current week's production line assignments.",
    columns: ["Line", "Order", "Buyer", "Style", "Allocated", "Status"],
    rows: [
      ["Line 1", "PO-84920", "H&M", "Relaxed Oxford", "14–18 Oct", "Running"],
      ["Line 3", "PO-85107", "Zara", "Stretch Cargo", "14–22 Oct", "Running"],
      ["Line 5", "PO-85241", "Uniqlo", "Ribbed Tank", "21–28 Oct", "Scheduled"],
      ["Line 7", "—", "—", "—", "Available", "Unallocated"],
    ],
    statusIndex: 5,
    sideTitle: "Line utilization",
    sideDescription: "Current week allocation status.",
    progress: [
      { label: "Running", value: "10 lines", percent: 56, tone: "bg-emerald-500" },
      { label: "Scheduled", value: "4 lines", percent: 22, tone: "bg-amber-500" },
      { label: "Available", value: "4 lines", percent: 22, tone: "bg-slate-400" },
    ],
    notices: [{ title: "2 booking conflicts detected", detail: "Lines 3 and 5 have overlapping allocation for next week.", tone: "amber" }],
  },
  "buyer-enquiry-analysis": {
    title: "Buyer Enquiry Analysis",
    eyebrow: "Enquiry tracking",
    description: "Track buyer enquiries, conversion rates, and response performance.",
    action: "Log enquiry",
    metrics: [
      { label: "Open enquiries", value: "28", note: "Awaiting response", trend: "neutral" },
      { label: "Converted this month", value: "12", note: "43% conversion rate", trend: "up" },
      { label: "Average response time", value: "2.4 days", note: "Target: 3 days", trend: "up" },
      { label: "Lost opportunities", value: "6", note: "$1.2M estimated value", trend: "down" },
    ],
    tableTitle: "Recent buyer enquiries",
    tableDescription: "Enquiries from initial contact through to order conversion.",
    columns: ["Enquiry #", "Buyer", "Description", "Received", "Value est.", "Status"],
    rows: [
      ["ENQ-2418", "H&M Group", "Summer woven collection", "14 Oct 2024", "$840K", "Quoting"],
      ["ENQ-2415", "Target Corp", "Basic knit program", "12 Oct 2024", "$520K", "Converted"],
      ["ENQ-2412", "Mango", "Denim capsule range", "10 Oct 2024", "$380K", "Lost"],
      ["ENQ-2408", "Primark", "Value basics", "08 Oct 2024", "$1.4M", "In discussion"],
    ],
    statusIndex: 5,
    sideTitle: "Conversion funnel",
    sideDescription: "Enquiry-to-order pipeline.",
    progress: [
      { label: "Converted to PO", value: "12 enquiries", percent: 43, tone: "bg-emerald-500" },
      { label: "In progress", value: "10 enquiries", percent: 36, tone: "bg-primary" },
      { label: "Lost / expired", value: "6 enquiries", percent: 21, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Mango enquiry ENQ-2412 lost", detail: "Competitor offered 8% lower FOB — review pricing strategy.", tone: "rose" }],
  },
  "rm-collection-consumption-sourcing": {
    title: "RM Collection, Consumption & Sourcing",
    eyebrow: "Material sourcing",
    description: "Track raw material requirements, sourcing status, and consumption against orders.",
    action: "New material entry",
    metrics: [
      { label: "Materials tracked", value: "186", note: "Fabrics, trims, accessories", trend: "neutral" },
      { label: "Sourcing pending", value: "24", note: "Awaiting supplier confirmation", trend: "down" },
      { label: "Consumption accuracy", value: "96.8%", note: "Against BOM estimates", trend: "up" },
      { label: "Fabric in stock", value: "$2.4M", note: "Across 3 warehouses", trend: "neutral" },
    ],
    tableTitle: "Material sourcing tracker",
    tableDescription: "Active material requirements linked to purchase orders.",
    columns: ["Material", "Type", "Supplier", "PO qty", "Required by", "Status"],
    rows: [
      ["100% Cotton Poplin", "Fabric", "Envoy Textiles", "24,800 m", "20 Oct 2024", "Delivered"],
      ["YKK Zip #5", "Trim", "YKK Bangladesh", "18,400 pcs", "25 Oct 2024", "In transit"],
      ["Coats Epic 40", "Thread", "Coats Bangladesh", "360 cones", "22 Oct 2024", "Ordered"],
      ["Woven Label 38mm", "Trim", "Pacific Accessories", "42,000 pcs", "28 Oct 2024", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Sourcing status",
    sideDescription: "Material requirement fulfillment.",
    progress: [
      { label: "Delivered / in stock", value: "124 items", percent: 67, tone: "bg-emerald-500" },
      { label: "In transit / ordered", value: "38 items", percent: 20, tone: "bg-amber-500" },
      { label: "Pending sourcing", value: "24 items", percent: 13, tone: "bg-rose-500" },
    ],
    notices: [{ title: "24 materials pending sourcing", detail: "Pacific Accessories labels are 4 days from required date.", tone: "amber" }],
  },
  "development-monitoring-by-supplier": {
    title: "Development Monitoring (by Supplier)",
    eyebrow: "Supplier development",
    description: "Monitor supplier development pipeline from initial sampling through production readiness.",
    action: "Add development order",
    metrics: [
      { label: "Styles in development", value: "48", note: "Across 12 suppliers", trend: "neutral" },
      { label: "On-track deliveries", value: "78%", note: "37 of 48 styles", trend: "up" },
      { label: "At-risk styles", value: "8", note: "Behind schedule", trend: "down" },
      { label: "Completed this month", value: "14", note: "Ready for bulk order", trend: "up" },
    ],
    tableTitle: "Supplier development status",
    tableDescription: "Styles currently in the development pipeline by supplier.",
    columns: ["Style", "Supplier", "Stage", "Deadline", "Days left", "Status"],
    rows: [
      ["STY-4821 · Relaxed Oxford", "Envoy Textiles", "PP sample", "20 Oct 2024", "6", "On track"],
      ["STY-4816 · Stretch Cargo", "DBL Group", "Fit sample", "25 Oct 2024", "11", "On track"],
      ["STY-4804 · Ribbed Tank", "Epic Group", "Proto sample", "22 Oct 2024", "8", "At risk"],
      ["STY-4798 · Denim Jacket", "Noman Group", "Tech pack", "30 Oct 2024", "16", "On track"],
    ],
    statusIndex: 5,
    sideTitle: "Development stages",
    sideDescription: "Styles by current development phase.",
    progress: [
      { label: "Tech pack / proto", value: "18 styles", percent: 38, tone: "bg-primary" },
      { label: "Fit / PP sample", value: "22 styles", percent: 46, tone: "bg-amber-500" },
      { label: "Approved / bulk ready", value: "8 styles", percent: 16, tone: "bg-emerald-500" },
    ],
    notices: [{ title: "8 styles at risk of missing deadline", detail: "Epic Group STY-4804 proto sample is 3 days behind schedule.", tone: "rose" }],
  },
  "sample-monitoring-fit-pp": {
    title: "Sample Monitoring (FIT, PP)",
    eyebrow: "Sample approval",
    description: "Track fit and pre-production sample approval stages across all active styles.",
    action: "Log sample status",
    metrics: [
      { label: "Samples in pipeline", value: "56", note: "FIT and PP combined", trend: "neutral" },
      { label: "FIT approved", value: "32", note: "Moving to PP stage", trend: "up" },
      { label: "PP approved", value: "18", note: "Cleared for production", trend: "up" },
      { label: "Rejection rate", value: "12%", note: "7 samples re-submitted", trend: "down" },
    ],
    tableTitle: "Sample approval tracker",
    tableDescription: "FIT and PP sample status by style and buyer.",
    columns: ["Style", "Buyer", "FIT round", "FIT status", "PP round", "PP status"],
    rows: [
      ["STY-4821 · Relaxed Oxford", "H&M", "FIT-2", "Approved", "PP-1", "Awaiting"],
      ["STY-4816 · Stretch Cargo", "Zara", "FIT-1", "Revisions", "—", "Pending"],
      ["STY-4804 · Ribbed Tank", "Uniqlo", "FIT-2", "Approved", "PP-1", "Approved"],
      ["STY-4798 · Denim Jacket", "Levi's", "FIT-3", "Awaiting", "—", "Pending"],
    ],
    statusIndex: 3,
    sideTitle: "Approval breakdown",
    sideDescription: "Sample approval progress.",
    progress: [
      { label: "FIT approved", value: "32 samples", percent: 57, tone: "bg-emerald-500" },
      { label: "PP approved", value: "18 samples", percent: 32, tone: "bg-primary" },
      { label: "Revisions needed", value: "6 samples", percent: 11, tone: "bg-rose-500" },
    ],
    notices: [{ title: "7 samples re-submitted for approval", detail: "FIT rejection rate is above the 10% target threshold.", tone: "amber" }],
  },
  "smv-calculation": {
    title: "SMV Calculation",
    eyebrow: "Time study",
    description: "Calculate and maintain Standard Minute Values for garment operations.",
    action: "New SMV study",
    metrics: [
      { label: "SMVs calculated", value: "284", note: "Across 48 styles", trend: "up" },
      { label: "Average SMV", value: "12.4 min", note: "Woven tops category", trend: "neutral" },
      { label: "Pending calculation", value: "18", note: "New styles added", trend: "neutral" },
      { label: "Accuracy rate", value: "97.2%", note: "Vs. actual production", trend: "up" },
    ],
    tableTitle: "SMV register",
    tableDescription: "Standard minute values by style and operation.",
    columns: ["Style", "Operation", "SMV (min)", "Method", "Machine", "Category"],
    rows: [
      ["STY-4821 · Oxford", "Front panel attach", "2.40", "SAM study", "SNLS", "Woven top"],
      ["STY-4821 · Oxford", "Collar attach", "1.85", "SAM study", "SNLS", "Woven top"],
      ["STY-4816 · Cargo", "Pocket attach", "3.20", "Time study", "DNLS", "Bottoms"],
      ["STY-4804 · Tank", "Hem cover stitch", "0.95", "Historical", "OL", "Knit top"],
    ],
    statusIndex: 5,
    sideTitle: "SMV by category",
    sideDescription: "Average SMV distribution across garment types.",
    progress: [
      { label: "Woven tops", value: "14.2 min", percent: 40, tone: "bg-primary" },
      { label: "Bottoms", value: "18.6 min", percent: 52, tone: "bg-emerald-500" },
      { label: "Knit tops", value: "8.4 min", percent: 8, tone: "bg-slate-400" },
    ],
    notices: [{ title: "18 styles pending SMV calculation", detail: "New styles added this week need time studies.", tone: "amber" }],
  },
  "ie-suggestion-for-pph": {
    title: "IE Suggestion for PPH",
    eyebrow: "Industrial engineering",
    description: "Generate IE recommendations forPieces Per Hour targets and method improvements.",
    action: "New suggestion",
    metrics: [
      { label: "Active suggestions", value: "32", note: "Open IE recommendations", trend: "neutral" },
      { label: "Implemented", value: "18", note: "This month", trend: "up" },
      { label: "PPH improvement", value: "+8.4%", note: "Average gain implemented", trend: "up" },
      { label: "Pending review", value: "14", note: "Awaiting line supervisor sign-off", trend: "neutral" },
    ],
    tableTitle: "IE suggestions log",
    tableDescription: "Method improvements and PPH target recommendations.",
    columns: ["Suggestion #", "Line / style", "Operation", "Current PPH", "Target PPH", "Status"],
    rows: [
      ["IE-2418", "Line 1 · Oxford", "Sleeve attach", "14.2", "16.8", "Implemented"],
      ["IE-2415", "Line 3 · Cargo", "Pocket set", "11.6", "13.4", "Under review"],
      ["IE-2412", "Line 5 · Tank", "Neck binding", "18.4", "21.2", "Implemented"],
      ["IE-2408", "Line 7 · Jacket", "Front zip", "8.8", "10.6", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "PPH gains by line",
    sideDescription: "Average PPH improvement after IE implementation.",
    progress: [
      { label: "Line 1", value: "+18.3%", percent: 18, tone: "bg-emerald-500" },
      { label: "Line 3", value: "+15.5%", percent: 16, tone: "bg-primary" },
      { label: "Line 5", value: "+12.4%", percent: 12, tone: "bg-amber-500" },
    ],
    notices: [{ title: "14 suggestions awaiting review", detail: "Line supervisors need to sign off on method changes.", tone: "amber" }],
  },
  "skill-inventory": {
    title: "Skill Inventory",
    eyebrow: "Workforce skills",
    description: "Maintain operator skill matrices and track training progress across lines.",
    action: "Update skill matrix",
    metrics: [
      { label: "Operators tracked", value: "342", note: "Across all lines", trend: "neutral" },
      { label: "Multi-skilled operators", value: "128", note: "37% of workforce", trend: "up" },
      { label: "Training pending", value: "42", note: "New operators", trend: "neutral" },
      { label: "Skill gap alerts", value: "6", note: "Lines below threshold", trend: "down" },
    ],
    tableTitle: "Operator skill matrix",
    tableDescription: "Current skill levels by operator and operation type.",
    columns: ["Operator", "Line", "Sewing ops", "Finishing ops", "Multi-skill", "Rating"],
    rows: [
      ["Rahim Uddin", "Line 1", "8 / 12", "3 / 4", "Yes", "Expert"],
      ["Fatima Begum", "Line 3", "6 / 12", "2 / 4", "Yes", "Intermediate"],
      ["Kamal Hossain", "Line 5", "4 / 12", "1 / 4", "No", "Beginner"],
      ["Nasrin Akter", "Line 7", "10 / 12", "4 / 4", "Yes", "Expert"],
    ],
    statusIndex: 5,
    sideTitle: "Skill distribution",
    sideDescription: "Operator skill level breakdown.",
    progress: [
      { label: "Expert", value: "86 operators", percent: 25, tone: "bg-emerald-500" },
      { label: "Intermediate", value: "168 operators", percent: 49, tone: "bg-primary" },
      { label: "Beginner", value: "88 operators", percent: 26, tone: "bg-amber-500" },
    ],
    notices: [{ title: "6 lines below skill threshold", detail: "Line 5 has only 25% multi-skilled operators — schedule cross-training.", tone: "amber" }],
  },
  "production-downtime-analysis": {
    title: "Production Downtime Analysis",
    eyebrow: "Downtime tracking",
    description: "Monitor and analyze production downtime events across all lines.",
    action: "Log downtime",
    metrics: [
      { label: "Total downtime", value: "42.6 hrs", note: "This month", trend: "down" },
      { label: "Downtime incidents", value: "28", note: "Across 18 lines", trend: "neutral" },
      { label: "Availability rate", value: "94.2%", note: "Target: 96%", trend: "down" },
      { label: "Top cause", value: "Machine breakdown", note: "38% of total downtime", trend: "neutral" },
    ],
    tableTitle: "Recent downtime events",
    tableDescription: "Downtime incidents logged with root cause classification.",
    columns: ["Event #", "Line", "Start time", "Duration", "Cause", "Status"],
    rows: [
      ["DT-2418", "Line 1", "14 Oct, 09:42", "2.4 hrs", "Machine breakdown", "Resolved"],
      ["DT-2415", "Line 3", "14 Oct, 11:15", "1.2 hrs", "Material shortage", "Resolved"],
      ["DT-2412", "Line 7", "15 Oct, 08:30", "3.6 hrs", "Quality issue", "Ongoing"],
      ["DT-2408", "Line 5", "13 Oct, 14:20", "0.8 hrs", "Operator absence", "Resolved"],
    ],
    statusIndex: 5,
    sideTitle: "Downtime by cause",
    sideDescription: "Distribution of downtime across root causes.",
    progress: [
      { label: "Machine breakdown", value: "16.2 hrs", percent: 38, tone: "bg-rose-500" },
      { label: "Material shortage", value: "12.4 hrs", percent: 29, tone: "bg-amber-500" },
      { label: "Quality / other", value: "14.0 hrs", percent: 33, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Line 7 downtime ongoing", detail: "Quality issue on STY-4798 denim jacket — 3.6 hours and counting.", tone: "rose" }],
  },
  "line-layout": {
    title: "Line Layout",
    eyebrow: "Line configuration",
    description: "Design and manage production line layouts, machine placement, and operator positioning.",
    action: "New line layout",
    metrics: [
      { label: "Active lines", value: "18", note: "Configured layouts", trend: "neutral" },
      { label: "Avg. line capacity", value: "680 pcs/day", note: "Across all lines", trend: "up" },
      { label: "Lines needing redesign", value: "3", note: "Below efficiency target", trend: "down" },
      { label: "Machine utilization", value: "86.4%", note: "Installed vs. used", trend: "up" },
    ],
    tableTitle: "Line configuration overview",
    tableDescription: "Current line layouts with machine and operator counts.",
    columns: ["Line", "Type", "Machines", "Operators", "Target/day", "Efficiency"],
    rows: [
      ["Line 1", "Woven", "42", "38", "720 pcs", "84.2%"],
      ["Line 3", "Woven", "38", "34", "680 pcs", "79.6%"],
      ["Line 5", "Knit", "32", "28", "580 pcs", "82.1%"],
      ["Line 7", "Denim", "48", "44", "840 pcs", "76.8%"],
    ],
    statusIndex: 5,
    sideTitle: "Line type distribution",
    sideDescription: "Production lines by garment category.",
    progress: [
      { label: "Woven lines", value: "10 lines", percent: 56, tone: "bg-primary" },
      { label: "Knit lines", value: "5 lines", percent: 28, tone: "bg-emerald-500" },
      { label: "Denim lines", value: "3 lines", percent: 16, tone: "bg-slate-400" },
    ],
    notices: [{ title: "3 lines need redesign", detail: "Line 7 efficiency is below 80% — review machine placement.", tone: "amber" }],
  },
  "process-wise-targets-achievements": {
    title: "Process-wise Targets & Achievements",
    eyebrow: "Target tracking",
    description: "Compare process-level production targets against actual achievements.",
    action: "Update targets",
    metrics: [
      { label: "Overall achievement", value: "88.4%", note: "Against monthly target", trend: "up" },
      { label: "Processes on track", value: "8 / 12", note: "Meeting or exceeding target", trend: "up" },
      { label: "Processes behind", value: "4", note: "Need intervention", trend: "down" },
      { label: "Best performer", value: "Cutting", note: "102% achievement", trend: "up" },
    ],
    tableTitle: "Process achievement report",
    tableDescription: "Monthly target vs. actual by production process.",
    columns: ["Process", "Target (pcs)", "Achieved (pcs)", "Achievement %", "Variance", "Status"],
    rows: [
      ["Cutting", "124,000", "126,480", "102.0%", "+2,480", "Exceeded"],
      ["Sewing", "124,000", "116,560", "94.0%", "-7,440", "On track"],
      ["Washing", "120,000", "108,000", "90.0%", "-12,000", "Behind"],
      ["Finishing", "118,000", "103,840", "88.0%", "-14,160", "Behind"],
    ],
    statusIndex: 5,
    sideTitle: "Process breakdown",
    sideDescription: "Achievement distribution by process.",
    progress: [
      { label: "Exceeded target", value: "2 processes", percent: 17, tone: "bg-emerald-500" },
      { label: "On track (90%+)", value: "6 processes", percent: 50, tone: "bg-primary" },
      { label: "Below target", value: "4 processes", percent: 33, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Finishing department behind target", detail: "14,160 piece shortfall — allocate overtime to close the gap.", tone: "rose" }],
  },
  "production-efficiency-tracking": {
    title: "Production Efficiency Tracking",
    eyebrow: "Efficiency metrics",
    description: "Monitor line-level efficiency, identify bottlenecks, and track improvement trends.",
    action: "View report",
    metrics: [
      { label: "Average efficiency", value: "82.4%", note: "All lines combined", trend: "up" },
      { label: "Top line efficiency", value: "91.2%", note: "Line 1 — Relaxed Oxford", trend: "up" },
      { label: "Lines below target", value: "4", note: "Target: 80% minimum", trend: "down" },
      { label: "Efficiency trend", value: "+2.8%", note: "Month-over-month", trend: "up" },
    ],
    tableTitle: "Line efficiency dashboard",
    tableDescription: "Real-time efficiency metrics by production line.",
    columns: ["Line", "Style", "Supervisor", "Efficiency %", "Output (pcs)", "Status"],
    rows: [
      ["Line 1", "Relaxed Oxford", "M. Rahman", "91.2%", "658", "Excellent"],
      ["Line 3", "Stretch Cargo", "S. Ahmed", "84.6%", "576", "On target"],
      ["Line 5", "Ribbed Tank", "F. Islam", "78.4%", "456", "Below target"],
      ["Line 7", "Denim Jacket", "T. Hasan", "72.8%", "612", "At risk"],
    ],
    statusIndex: 5,
    sideTitle: "Efficiency distribution",
    sideDescription: "Lines grouped by efficiency band.",
    progress: [
      { label: "90%+ (Excellent)", value: "4 lines", percent: 22, tone: "bg-emerald-500" },
      { label: "80–89% (On target)", value: "8 lines", percent: 44, tone: "bg-primary" },
      { label: "Below 80%", value: "6 lines", percent: 33, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Line 7 efficiency dropped to 72.8%", detail: "Denim jacket operations need method review — schedule IE analysis.", tone: "rose" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function MerchandisingWorkspace({ module }: { module: ModuleKey }) {
  const config = configs[module]

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/merchandising" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Merchandising
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
          {config.metrics.map((metric) => (
            <Card key={metric.label} className="gap-3 border-border/70 py-4 shadow-none">
              <CardContent className="p-0">
                <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Shirt className="size-4 text-muted-foreground" />}
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
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                    <tr>{config.columns.map((column) => <th key={column} className="px-5 py-3 font-medium">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {config.rows.map((row) => (
                      <tr key={row[0]} className="border-t transition-colors hover:bg-muted/30">
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-medium" : "text-muted-foreground"}`}>
                            {index === config.statusIndex ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${noticeClass(cell as "amber" | "rose" | "emerald")}`}>{cell}</span> : cell}
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
                <CardTitle className="flex items-center gap-2 text-base"><Shirt className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Merchandising attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening merchandising task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Merchandising hub</p><p className="text-xs text-muted-foreground">All module data is synced in real-time across teams.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
