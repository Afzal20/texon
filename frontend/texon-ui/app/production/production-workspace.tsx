"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Factory } from "lucide-react"
import { toast } from "sonner"

type ModuleKey =
  | "production-order-received"
  | "process-wise-floor-layout"
  | "floor-requisition"
  | "process-wise-production-execution"
  | "quality-assurance"
  | "inspection-packing"
  | "rm-requisition-approval"
  | "cutting-sending-to-line"
  | "artwork-printing-embroidery-monitoring"
  | "line-input"
  | "hourly-sewing-production"
  | "send-to-washing"
  | "receive-from-washing"
  | "thread-cutting"
  | "final-qc"
  | "carton-packing"
  | "packing-list-preparation"
  | "booking-to-forwarder"
  | "inspection-schedule"
  | "ex-factory"

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
  "production-order-received": {
    title: "Production Order Received",
    eyebrow: "Order intake",
    description: "Track production orders received from merchandising for shop floor execution.",
    action: "Log order",
    metrics: [
      { label: "Orders received", value: "42", note: "This month", trend: "up" },
      { label: "Pending allocation", value: "8", note: "Awaiting line assignment", trend: "neutral" },
      { label: "In execution", value: "28", note: "On shop floor", trend: "up" },
      { label: "Completed", value: "6", note: "This month", trend: "up" },
    ],
    tableTitle: "Received orders register",
    tableDescription: "Production orders received from merchandising.",
    columns: ["Order #", "PO #", "Buyer", "Style", "Qty", "Status"],
    rows: [
      ["WO-2418", "PO-84920", "H&M", "Relaxed Oxford", "12,400", "Allocated"],
      ["WO-2415", "PO-85107", "Zara", "Stretch Cargo", "8,600", "In execution"],
      ["WO-2412", "PO-85241", "Uniqlo", "Ribbed Tank", "18,200", "Pending"],
      ["WO-2408", "PO-85322", "Levi's", "Denim Jacket", "4,800", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Order pipeline",
    sideDescription: "Monthly order intake status.",
    progress: [
      { label: "In execution", value: "28 orders", percent: 67, tone: "bg-emerald-500" },
      { label: "Pending allocation", value: "8 orders", percent: 19, tone: "bg-amber-500" },
      { label: "Completed", value: "6 orders", percent: 14, tone: "bg-primary" },
    ],
    notices: [{ title: "8 orders pending allocation", detail: "WO-2412 and WO-2408 need line assignment.", tone: "amber" }],
  },
  "process-wise-floor-layout": {
    title: "Process-wise Floor Layout",
    eyebrow: "Floor layout",
    description: "Design and manage process-wise floor layouts for production lines.",
    action: "New layout",
    metrics: [
      { label: "Active layouts", value: "18", note: "Configured lines", trend: "neutral" },
      { label: "Machines placed", value: "648", note: "Across all lines", trend: "neutral" },
      { label: "Utilization", value: "86%", note: "Machine placement", trend: "up" },
      { label: "Lines optimized", value: "12", note: "This month", trend: "up" },
    ],
    tableTitle: "Floor layout overview",
    tableDescription: "Process-wise machine placement across production lines.",
    columns: ["Line", "Process", "Machines", "Operators", "Capacity/day", "Status"],
    rows: [
      ["Line 1", "Sewing", "42", "38", "720 pcs", "Optimized"],
      ["Line 3", "Sewing", "38", "34", "680 pcs", "Optimized"],
      ["Line 5", "Cutting", "12", "16", "1,200 pcs", "Standard"],
      ["Line 7", "Finishing", "28", "24", "840 pcs", "Needs review"],
    ],
    statusIndex: 5,
    sideTitle: "Layout status",
    sideDescription: "Current layout optimization status.",
    progress: [
      { label: "Optimized", value: "12 lines", percent: 67, tone: "bg-emerald-500" },
      { label: "Standard", value: "4 lines", percent: 22, tone: "bg-primary" },
      { label: "Needs review", value: "2 lines", percent: 11, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 lines need layout review", detail: "Line 7 finishing efficiency below target — optimize machine placement.", tone: "amber" }],
  },
  "floor-requisition": {
    title: "Floor Requisition",
    eyebrow: "Floor requests",
    description: "Manage material and supply requisitions from the shop floor to stores.",
    action: "New requisition",
    metrics: [
      { label: "Requisitions today", value: "18", note: "From shop floor", trend: "neutral" },
      { label: "Fulfilled", value: "14", note: "78% fulfillment", trend: "up" },
      { label: "Pending", value: "3", note: "Awaiting store dispatch", trend: "neutral" },
      { label: "Rejected", value: "1", note: "Insufficient stock", trend: "down" },
    ],
    tableTitle: "Floor requisition log",
    tableDescription: "Material requests from production floor to stores.",
    columns: ["Req #", "Line", "Material", "Qty", "Requested", "Status"],
    rows: [
      ["FR-2418", "Line 1", "Cotton Poplin", "480 m", "09:42", "Fulfilled"],
      ["FR-2415", "Line 3", "Thread (white)", "24 cones", "10:15", "Fulfilled"],
      ["FR-2412", "Line 5", "Denim 7oz", "320 m", "10:30", "Pending"],
      ["FR-2408", "Line 7", "Labels", "1,200 pcs", "11:00", "Rejected"],
    ],
    statusIndex: 5,
    sideTitle: "Fulfillment status",
    sideDescription: "Today's requisition fulfillment.",
    progress: [
      { label: "Fulfilled", value: "14 requests", percent: 78, tone: "bg-emerald-500" },
      { label: "Pending", value: "3 requests", percent: 17, tone: "bg-amber-500" },
      { label: "Rejected", value: "1 request", percent: 5, tone: "bg-rose-500" },
    ],
    notices: [{ title: "FR-2408 rejected", detail: "Labels out of stock — raise emergency procurement.", tone: "rose" }],
  },
  "process-wise-production-execution": {
    title: "Process-wise Production Execution",
    eyebrow: "Production execution",
    description: "Track production execution across cutting, sewing, washing, and finishing processes.",
    action: "Update execution",
    metrics: [
      { label: "Today's output", value: "4,280 pcs", note: "Across all processes", trend: "up" },
      { label: "Cutting", value: "4,800 pcs", note: "102% of target", trend: "up" },
      { label: "Sewing", value: "4,280 pcs", note: "94% of target", trend: "neutral" },
      { label: "Finishing", value: "3,920 pcs", note: "88% of target", trend: "down" },
    ],
    tableTitle: "Process execution tracker",
    tableDescription: "Real-time production output by process.",
    columns: ["Process", "Target", "Achieved", "Efficiency", "Defects", "Status"],
    rows: [
      ["Cutting", "4,700", "4,800", "102.1%", "0.2%", "Exceeded"],
      ["Sewing", "4,560", "4,280", "93.9%", "1.8%", "On track"],
      ["Washing", "4,200", "4,080", "97.1%", "0.8%", "On track"],
      ["Finishing", "4,460", "3,920", "87.9%", "2.4%", "Behind"],
    ],
    statusIndex: 5,
    sideTitle: "Process output",
    sideDescription: "Monthly production by process.",
    progress: [
      { label: "Cutting", value: "4,800 pcs", percent: 30, tone: "bg-emerald-500" },
      { label: "Sewing", value: "4,280 pcs", percent: 27, tone: "bg-primary" },
      { label: "Washing & finishing", value: "8,000 pcs", percent: 43, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Finishing behind target", detail: "392 pcs shortfall — allocate overtime to close gap.", tone: "amber" }],
  },
  "quality-assurance": {
    title: "Quality Assurance",
    eyebrow: "QA tracking",
    description: "Monitor quality assurance activities, defect rates, and corrective actions.",
    action: "Log inspection",
    metrics: [
      { label: "Inspections today", value: "24", note: "Across all lines", trend: "up" },
      { label: "Pass rate", value: "97.2%", note: "Above 95% target", trend: "up" },
      { label: "Defects found", value: "18", note: "12 minor, 6 major", trend: "down" },
      { label: "Corrective actions", value: "4", note: "Open CARs", trend: "neutral" },
    ],
    tableTitle: "QA inspection log",
    tableDescription: "Quality inspection results from the shop floor.",
    columns: ["Inspection #", "Line", "Process", "Sample size", "Defects", "Status"],
    rows: [
      ["QA-2418", "Line 1", "Sewing", "200 pcs", "2 minor", "Pass"],
      ["QA-2415", "Line 3", "Sewing", "200 pcs", "1 major", "Fail"],
      ["QA-2412", "Line 5", "Washing", "150 pcs", "3 minor", "Pass"],
      ["QA-2408", "Line 7", "Finishing", "200 pcs", "4 minor", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "QA results",
    sideDescription: "Monthly inspection pass/fail.",
    progress: [
      { label: "Pass", value: "580 inspections", percent: 97, tone: "bg-emerald-500" },
      { label: "Fail", value: "18 inspections", percent: 3, tone: "bg-rose-500" },
    ],
    notices: [{ title: "QA-2415 failed inspection", detail: "Line 3 major defect on seam alignment — rework required.", tone: "rose" }],
  },
  "inspection-packing": {
    title: "Inspection & Packing",
    eyebrow: "Final inspection",
    description: "Manage final inspection and packing operations for export readiness.",
    action: "Schedule inspection",
    metrics: [
      { label: "Packs ready", value: "18", note: "Awaiting inspection", trend: "neutral" },
      { label: "Inspected today", value: "8", note: "6 passed, 2 rework", trend: "up" },
      { label: "Packed today", value: "6", note: "12,400 pcs", trend: "up" },
      { label: "Pass rate", value: "75%", note: "First-time pass", trend: "down" },
    ],
    tableTitle: "Inspection & packing log",
    tableDescription: "Final inspection and packing status by order.",
    columns: ["Order #", "Buyer", "Qty", "Inspector", "Result", "Status"],
    rows: [
      ["PO-84920", "H&M", "12,400", "Rahim U.", "Pass", "Packing"],
      ["PO-85107", "Zara", "8,600", "Fatima B.", "Rework", "On hold"],
      ["PO-85241", "Uniqlo", "18,200", "Kamal H.", "Pass", "Packing"],
      ["PO-85322", "Levi's", "4,800", "Nasrin A.", "Pass", "Complete"],
    ],
    statusIndex: 5,
    sideTitle: "Inspection pipeline",
    sideDescription: "Current inspection status.",
    progress: [
      { label: "Passed / packing", value: "14 orders", percent: 70, tone: "bg-emerald-500" },
      { label: "Rework", value: "3 orders", percent: 15, tone: "bg-amber-500" },
      { label: "Pending", value: "3 orders", percent: 15, tone: "bg-slate-400" },
    ],
    notices: [{ title: "PO-85107 rework required", detail: "Zara cargo pant — re-stitch pockets before re-inspection.", tone: "amber" }],
  },
  "rm-requisition-approval": {
    title: "RM Requisition & Approval",
    eyebrow: "RM approval",
    description: "Request and approve raw materials from store to production floor.",
    action: "New requisition",
    metrics: [
      { label: "Requisitions today", value: "12", note: "From floor", trend: "neutral" },
      { label: "Approved", value: "10", note: "83% approval", trend: "up" },
      { label: "Pending", value: "2", note: "Awaiting approval", trend: "neutral" },
      { label: "Rejected", value: "0", note: "No rejections today", trend: "up" },
    ],
    tableTitle: "RM requisition tracker",
    tableDescription: "Raw material requisitions with approval status.",
    columns: ["Req #", "Line", "Material", "Qty", "Requested by", "Status"],
    rows: [
      ["RM-2418", "Line 1", "Cotton Poplin", "960 m", "M. Rahman", "Approved"],
      ["RM-2415", "Line 3", "Poly Blend", "640 m", "S. Ahmed", "Approved"],
      ["RM-2412", "Line 5", "Denim 7oz", "480 m", "F. Islam", "Pending"],
      ["RM-2408", "Line 7", "Thread (black)", "48 cones", "T. Hasan", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Today's requisition approvals.",
    progress: [
      { label: "Approved", value: "10 requisitions", percent: 83, tone: "bg-emerald-500" },
      { label: "Pending", value: "2 requisitions", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 requisitions pending approval", detail: "RM-2412 denim requisition needs store manager approval.", tone: "amber" }],
  },
  "cutting-sending-to-line": {
    title: "Cutting & Sending to Line",
    eyebrow: "Cutting tracking",
    description: "Track cutting operations and bundle dispatch to sewing lines.",
    action: "Log cutting",
    metrics: [
      { label: "Cut today", value: "4,800 pcs", note: "Across 4 orders", trend: "up" },
      { label: "Sent to line", value: "4,200 pcs", note: "88% dispatch rate", trend: "up" },
      { label: "Pending dispatch", value: "600 pcs", note: "Awaiting bundling", trend: "neutral" },
      { label: "Cutting efficiency", value: "94.2%", note: "Fabric utilization", trend: "up" },
    ],
    tableTitle: "Cutting & dispatch log",
    tableDescription: "Cutting output and bundle dispatch to sewing lines.",
    columns: ["Order #", "Style", "Cut qty", "Sent", "Pending", "Status"],
    rows: [
      ["PO-84920", "Relaxed Oxford", "1,240", "1,240", "0", "Complete"],
      ["PO-85107", "Stretch Cargo", "1,600", "1,400", "200", "In progress"],
      ["PO-85241", "Ribbed Tank", "1,200", "1,080", "120", "In progress"],
      ["PO-85322", "Denim Jacket", "760", "480", "280", "In progress"],
    ],
    statusIndex: 5,
    sideTitle: "Cutting status",
    sideDescription: "Today's cutting and dispatch.",
    progress: [
      { label: "Cut & dispatched", value: "4,200 pcs", percent: 88, tone: "bg-emerald-500" },
      { label: "Pending dispatch", value: "600 pcs", percent: 12, tone: "bg-amber-500" },
    ],
    notices: [{ title: "600 pcs pending dispatch", detail: "PO-85322 denim bundles need bundling before dispatch.", tone: "amber" }],
  },
  "artwork-printing-embroidery-monitoring": {
    title: "Artwork / Printing / Embroidery Monitoring",
    eyebrow: "Print & embroidery",
    description: "Monitor artwork, printing, and embroidery operations on production lines.",
    action: "Log operation",
    metrics: [
      { label: "Operations active", value: "8", note: "Across 4 lines", trend: "neutral" },
      { label: "Completed today", value: "6", note: "4,200 pcs", trend: "up" },
      { label: "Pending", value: "2", note: "Awaiting material", trend: "neutral" },
      { label: "Rejection rate", value: "1.8%", note: "Below 3% target", trend: "up" },
    ],
    tableTitle: "Print & embroidery tracker",
    tableDescription: "Artwork, printing, and embroidery operations status.",
    columns: ["Order #", "Style", "Type", "Qty", "Completed", "Status"],
    rows: [
      ["PO-84920", "Relaxed Oxford", "Print", "12,400", "8,680", "Running"],
      ["PO-85107", "Stretch Cargo", "Embroidery", "8,600", "6,880", "Running"],
      ["PO-85241", "Ribbed Tank", "Print", "18,200", "12,740", "Running"],
      ["PO-85322", "Denim Jacket", "Embroidery", "4,800", "2,400", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Operation type",
    sideDescription: "Active operations by type.",
    progress: [
      { label: "Print", value: "4 orders", percent: 50, tone: "bg-primary" },
      { label: "Embroidery", value: "3 orders", percent: 38, tone: "bg-emerald-500" },
      { label: "Artwork", value: "1 order", percent: 12, tone: "bg-slate-400" },
    ],
    notices: [{ title: "PO-85322 pending embroidery", detail: "Denim jacket awaiting thread delivery — ETA tomorrow.", tone: "amber" }],
  },
  "line-input": {
    title: "Line Input",
    eyebrow: "Input tracking",
    description: "Track material input to sewing lines including cut bundles and trims.",
    action: "Log input",
    metrics: [
      { label: "Inputs today", value: "3,840 pcs", note: "Across all lines", trend: "up" },
      { label: "Lines fed", value: "12", note: "80% of lines", trend: "up" },
      { label: "Pending input", value: "2", note: "Lines 14, 16", trend: "neutral" },
      { label: "Input efficiency", value: "96.4%", note: "Against cutting output", trend: "up" },
    ],
    tableTitle: "Line input log",
    tableDescription: "Material input tracking for sewing lines.",
    columns: ["Line", "Order", "Input qty", "Time", "Operator", "Status"],
    rows: [
      ["Line 1", "PO-84920", "1,240 pcs", "08:00", "Rahim U.", "Complete"],
      ["Line 3", "PO-85107", "1,400 pcs", "08:15", "Fatima B.", "Complete"],
      ["Line 5", "PO-85241", "1,080 pcs", "08:30", "Kamal H.", "Complete"],
      ["Line 7", "PO-85322", "480 pcs", "08:45", "Nasrin A.", "Partial"],
    ],
    statusIndex: 5,
    sideTitle: "Input status",
    sideDescription: "Today's line input completion.",
    progress: [
      { label: "Complete", value: "12 lines", percent: 80, tone: "bg-emerald-500" },
      { label: "Partial", value: "2 lines", percent: 13, tone: "bg-amber-500" },
      { label: "Pending", value: "1 line", percent: 7, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Line 7 partial input", detail: "Only 480 of 1,200 pcs received — remaining in cutting.", tone: "amber" }],
  },
  "hourly-sewing-production": {
    title: "Hourly Sewing Production",
    eyebrow: "Hourly tracking",
    description: "Monitor hourly sewing output across all lines with target vs actual tracking.",
    action: "Log hourly output",
    metrics: [
      { label: "Today's output", value: "4,280 pcs", note: "8-hour shift", trend: "up" },
      { label: "Hourly avg.", value: "535 pcs", note: "Per line average", trend: "up" },
      { label: "Target", value: "4,560 pcs", note: "94% achievement", trend: "neutral" },
      { label: "Best hour", value: "612 pcs", note: "10:00–11:00", trend: "up" },
    ],
    tableTitle: "Hourly production report",
    tableDescription: "Hourly sewing output by line.",
    columns: ["Line", "Hour", "Target", "Actual", "Efficiency", "Status"],
    rows: [
      ["Line 1", "09:00–10:00", "650", "658", "91.2%", "On target"],
      ["Line 3", "09:00–10:00", "680", "672", "84.6%", "On target"],
      ["Line 5", "09:00–10:00", "580", "546", "78.4%", "Below"],
      ["Line 7", "09:00–10:00", "840", "792", "72.8%", "Below"],
    ],
    statusIndex: 5,
    sideTitle: "Hourly trend",
    sideDescription: "Output by hour across all lines.",
    progress: [
      { label: "On target (90%+)", value: "6 lines", percent: 40, tone: "bg-emerald-500" },
      { label: "Below target (80–89%)", value: "5 lines", percent: 33, tone: "bg-amber-500" },
      { label: "At risk (<80%)", value: "4 lines", percent: 27, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Lines 5 & 7 below target", detail: "Line 7 at 72.8% — schedule IE review for method improvement.", tone: "rose" }],
  },
  "send-to-washing": {
    title: "Send to Washing",
    eyebrow: "Washing dispatch",
    description: "Track garment dispatch from sewing to washing unit with quantity and timing.",
    action: "Log dispatch",
    metrics: [
      { label: "Dispatched today", value: "3,200 pcs", note: "To washing unit", trend: "up" },
      { label: "Pending dispatch", value: "640 pcs", note: "Awaiting sewing completion", trend: "neutral" },
      { label: "Washing queue", value: "2,800 pcs", note: "At washing unit", trend: "neutral" },
      { label: "Dispatch accuracy", value: "99.2%", note: "Qty match rate", trend: "up" },
    ],
    tableTitle: "Washing dispatch log",
    tableDescription: "Garment dispatch from sewing to washing.",
    columns: ["Dispatch #", "Order", "Qty", "Sent at", "Washing unit", "Status"],
    rows: [
      ["WD-2418", "PO-84920", "1,240 pcs", "14:00", "Unit A", "Received"],
      ["WD-2415", "PO-85107", "860 pcs", "12:30", "Unit A", "In process"],
      ["WD-2412", "PO-85241", "720 pcs", "10:00", "Unit B", "In process"],
      ["WD-2408", "PO-85322", "380 pcs", "09:00", "Unit A", "Complete"],
    ],
    statusIndex: 5,
    sideTitle: "Dispatch status",
    sideDescription: "Today's washing dispatch.",
    progress: [
      { label: "Received / in process", value: "2,820 pcs", percent: 67, tone: "bg-primary" },
      { label: "Complete", value: "1,100 pcs", percent: 26, tone: "bg-emerald-500" },
      { label: "Pending dispatch", value: "280 pcs", percent: 7, tone: "bg-amber-500" },
    ],
    notices: [{ title: "640 pcs pending dispatch", detail: "Awaiting sewing completion on PO-85241.", tone: "amber" }],
  },
  "receive-from-washing": {
    title: "Receive from Washing",
    eyebrow: "Washing receipt",
    description: "Track garment receipt from washing unit with quality and quantity verification.",
    action: "Log receipt",
    metrics: [
      { label: "Received today", value: "2,400 pcs", note: "From washing unit", trend: "up" },
      { label: "Pending receipt", value: "800 pcs", note: "In washing", trend: "neutral" },
      { label: "QC pass rate", value: "98.4%", note: "Post-wash quality", trend: "up" },
      { label: "Rejections", value: "0.6%", note: "Washing defects", trend: "up" },
    ],
    tableTitle: "Washing receipt log",
    tableDescription: "Garment receipt from washing with QC status.",
    columns: ["Receipt #", "Order", "Qty", "Received", "QC result", "Status"],
    rows: [
      ["WR-2418", "PO-84920", "1,240", "14:30", "Pass", "To finishing"],
      ["WR-2415", "PO-85107", "860", "13:00", "Pass", "To finishing"],
      ["WR-2412", "PO-85241", "720", "11:00", "Fail", "Rework"],
      ["WR-2408", "PO-85322", "380", "09:30", "Pass", "To finishing"],
    ],
    statusIndex: 5,
    sideTitle: "Receipt status",
    sideDescription: "Today's washing receipt.",
    progress: [
      { label: "Passed / to finishing", value: "2,480 pcs", percent: 80, tone: "bg-emerald-500" },
      { label: "Rework", value: "720 pcs", percent: 20, tone: "bg-amber-500" },
    ],
    notices: [{ title: "PO-85241 rework needed", detail: "720 pcs failed QC — color shade inconsistency.", tone: "rose" }],
  },
  "thread-cutting": {
    title: "Thread Cutting",
    eyebrow: "Thread cutting",
    description: "Track thread cutting operations and quality of finished garments.",
    action: "Log cutting",
    metrics: [
      { label: "Cut today", value: "3,600 pcs", note: "Across 3 lines", trend: "up" },
      { label: "Pending", value: "400 pcs", note: "Awaiting thread cut", trend: "neutral" },
      { label: "Quality pass", value: "99.1%", note: "Post-cut QC", trend: "up" },
      { label: "Efficiency", value: "92.4%", note: "Against target", trend: "up" },
    ],
    tableTitle: "Thread cutting log",
    tableDescription: "Thread cutting operations and quality status.",
    columns: ["Line", "Order", "Qty cut", "Pending", "QC result", "Status"],
    rows: [
      ["Line 1", "PO-84920", "1,240", "0", "Pass", "Complete"],
      ["Line 3", "PO-85107", "860", "120", "Pass", "In progress"],
      ["Line 5", "PO-85241", "720", "200", "Pass", "In progress"],
      ["Line 7", "PO-85322", "780", "80", "Pass", "In progress"],
    ],
    statusIndex: 5,
    sideTitle: "Cutting progress",
    sideDescription: "Today's thread cutting completion.",
    progress: [
      { label: "Complete", value: "1,240 pcs", percent: 25, tone: "bg-emerald-500" },
      { label: "In progress", value: "2,360 pcs", percent: 47, tone: "bg-primary" },
      { label: "Pending", value: "400 pcs", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "400 pcs pending thread cut", detail: "PO-85241 and PO-85322 bundles awaiting.", tone: "amber" }],
  },
  "final-qc": {
    title: "Final QC",
    eyebrow: "Final inspection",
    description: "Perform final quality control inspection before packing and shipment.",
    action: "Log QC",
    metrics: [
      { label: "Inspected today", value: "2,800 pcs", note: "Across all orders", trend: "up" },
      { label: "Pass rate", value: "96.8%", note: "First-time pass", trend: "up" },
      { label: "Rejections", value: "90 pcs", note: "3.2% rejection", trend: "down" },
      { label: "Open CARs", value: "3", note: "Corrective actions", trend: "neutral" },
    ],
    tableTitle: "Final QC log",
    tableDescription: "Final quality control inspection results.",
    columns: ["Order #", "Inspected", "Pass", "Fail", "Result", "Status"],
    rows: [
      ["PO-84920", "1,240", "1,208", "32", "97.4%", "Pass"],
      ["PO-85107", "860", "824", "36", "95.8%", "Pass"],
      ["PO-85241", "720", "704", "16", "97.8%", "Pass"],
      ["PO-85322", "480", "460", "20", "95.8%", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "QC results",
    sideDescription: "Monthly final QC pass rate.",
    progress: [
      { label: "Pass", value: "3,196 pcs", percent: 97, tone: "bg-emerald-500" },
      { label: "Fail / rework", value: "104 pcs", percent: 3, tone: "bg-rose-500" },
    ],
    notices: [{ title: "3 open CARs", detail: "Seam alignment defects on PO-85107 — root cause analysis needed.", tone: "amber" }],
  },
  "carton-packing": {
    title: "Carton & Packing",
    eyebrow: "Packing operations",
    description: "Manage carton packing, labeling, and stack preparation for shipment.",
    action: "Log packing",
    metrics: [
      { label: "Cartons packed", value: "186", note: "This month", trend: "up" },
      { label: "Packed today", value: "24", note: "3,600 pcs", trend: "up" },
      { label: "Pending", value: "8", note: "Awaiting QC clearance", trend: "neutral" },
      { label: "Carton accuracy", value: "99.6%", note: "Qty match rate", trend: "up" },
    ],
    tableTitle: "Packing register",
    tableDescription: "Carton packing and labeling status.",
    columns: ["Carton #", "Order", "Qty", "Weight", "Packed", "Status"],
    rows: [
      ["CTN-2418", "PO-84920", "120 pcs", "18.4 kg", "14:00", "Labeled"],
      ["CTN-2415", "PO-85107", "120 pcs", "22.6 kg", "13:00", "Labeled"],
      ["CTN-2412", "PO-85241", "120 pcs", "14.2 kg", "12:00", "Ready"],
      ["CTN-2408", "PO-85322", "120 pcs", "28.8 kg", "11:00", "Stacked"],
    ],
    statusIndex: 5,
    sideTitle: "Packing status",
    sideDescription: "Today's packing operations.",
    progress: [
      { label: "Labeled & stacked", value: "18 cartons", percent: 75, tone: "bg-emerald-500" },
      { label: "Ready", value: "4 cartons", percent: 17, tone: "bg-primary" },
      { label: "Pending QC", value: "2 cartons", percent: 8, tone: "bg-amber-500" },
    ],
    notices: [{ title: "8 cartons pending QC clearance", detail: "Awaiting final QC pass before labeling.", tone: "amber" }],
  },
  "packing-list-preparation": {
    title: "Packing List Preparation",
    eyebrow: "Packing lists",
    description: "Prepare and manage packing lists for export shipments with documentation.",
    action: "Create packing list",
    metrics: [
      { label: "Lists prepared", value: "18", note: "This month", trend: "up" },
      { label: "Pending review", value: "3", note: "Awaiting approval", trend: "neutral" },
      { label: "Approved", value: "15", note: "Ready for shipment", trend: "up" },
      { label: "Accuracy rate", value: "99.2%", note: "Document accuracy", trend: "up" },
    ],
    tableTitle: "Packing list register",
    tableDescription: "Export packing lists with approval status.",
    columns: ["PL #", "Order", "Buyer", "Cartons", "Prepared", "Status"],
    rows: [
      ["PL-2418", "PO-84920", "H&M", "104", "14 Oct", "Approved"],
      ["PL-2415", "PO-85107", "Zara", "72", "13 Oct", "Approved"],
      ["PL-2412", "PO-85241", "Uniqlo", "152", "12 Oct", "Pending"],
      ["PL-2408", "PO-85322", "Levi's", "40", "10 Oct", "Approved"],
    ],
    statusIndex: 5,
    sideTitle: "List status",
    sideDescription: "Monthly packing list status.",
    progress: [
      { label: "Approved", value: "15 lists", percent: 83, tone: "bg-emerald-500" },
      { label: "Pending review", value: "3 lists", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "3 packing lists pending review", detail: "PL-2412 Uniqlo needs buyer approval before shipment.", tone: "amber" }],
  },
  "booking-to-forwarder": {
    title: "Booking to Forwarder",
    eyebrow: "Freight booking",
    description: "Manage freight bookings with shipping lines and forwarders for export shipments.",
    action: "New booking",
    metrics: [
      { label: "Active bookings", value: "8", note: "Confirmed", trend: "neutral" },
      { label: "Pending confirmation", value: "2", note: "Awaiting slot", trend: "down" },
      { label: "Bookings completed", value: "6", note: "Shipments departed", trend: "up" },
      { label: "Freight value", value: "$124K", note: "Total MTD", trend: "neutral" },
    ],
    tableTitle: "Freight booking register",
    tableDescription: "Freight bookings for export shipments.",
    columns: ["Booking #", "Order", "Forwarder", "ETD", "Amount", "Status"],
    rows: [
      ["BK-2418", "PO-84920", "DHL Global", "15 Nov", "$18,600", "Confirmed"],
      ["BK-2415", "PO-85107", "Flexport", "22 Nov", "$14,200", "Confirmed"],
      ["BK-2412", "PO-85241", "Expeditors", "08 Nov", "$22,800", "Pending"],
      ["BK-2408", "PO-85322", "Kuehne+Nagel", "01 Nov", "$8,400", "Confirmed"],
    ],
    statusIndex: 5,
    sideTitle: "Booking status",
    sideDescription: "Current freight booking pipeline.",
    progress: [
      { label: "Confirmed", value: "6 bookings", percent: 75, tone: "bg-emerald-500" },
      { label: "Pending", value: "2 bookings", percent: 25, tone: "bg-amber-500" },
    ],
    notices: [{ title: "2 bookings pending", detail: "BK-2412 awaiting vessel slot from Expeditors.", tone: "amber" }],
  },
  "inspection-schedule": {
    title: "Inspection Schedule",
    eyebrow: "Inspection planning",
    description: "Schedule and manage quality inspections at various production stages.",
    action: "Schedule inspection",
    metrics: [
      { label: "Inspections scheduled", value: "24", note: "This week", trend: "neutral" },
      { label: "Completed", value: "18", note: "75% completion", trend: "up" },
      { label: "Pending", value: "4", note: "Awaiting production", trend: "neutral" },
      { label: "Overdue", value: "2", note: "Past scheduled date", trend: "down" },
    ],
    tableTitle: "Inspection schedule",
    tableDescription: "Scheduled inspections across production stages.",
    columns: ["Inspection #", "Order", "Stage", "Scheduled", "Inspector", "Status"],
    rows: [
      ["INSP-2418", "PO-84920", "Inline QC", "14 Oct", "Rahim U.", "Complete"],
      ["INSP-2415", "PO-85107", "End-line QC", "14 Oct", "Fatima B.", "Complete"],
      ["INSP-2412", "PO-85241", "Final QC", "15 Oct", "Kamal H.", "Scheduled"],
      ["INSP-2408", "PO-85322", "Inline QC", "12 Oct", "Nasrin A.", "Overdue"],
    ],
    statusIndex: 5,
    sideTitle: "Inspection pipeline",
    sideDescription: "Weekly inspection status.",
    progress: [
      { label: "Complete", value: "18 inspections", percent: 75, tone: "bg-emerald-500" },
      { label: "Scheduled", value: "4 inspections", percent: 17, tone: "bg-primary" },
      { label: "Overdue", value: "2 inspections", percent: 8, tone: "bg-rose-500" },
    ],
    notices: [{ title: "2 inspections overdue", detail: "PO-85322 inline QC was due Oct 12 — reschedule immediately.", tone: "rose" }],
  },
  "ex-factory": {
    title: "Ex-factory",
    eyebrow: "Shipment readiness",
    description: "Track ex-factory readiness and final shipment preparation for export orders.",
    action: "Log ex-factory",
    metrics: [
      { label: "Ready for ex-factory", value: "4", note: "Orders cleared", trend: "up" },
      { label: "Ex-factory this week", value: "2", note: "$620K value", trend: "up" },
      { label: "Pending clearance", value: "3", note: "Awaiting final docs", trend: "neutral" },
      { label: "On-time rate", value: "92%", note: "Against committed date", trend: "up" },
    ],
    tableTitle: "Ex-factory tracker",
    tableDescription: "Orders with ex-factory status and shipment readiness.",
    columns: ["Order #", "Buyer", "Qty", "Ex-factory date", "Value", "Status"],
    rows: [
      ["PO-84920", "H&M", "12,400", "15 Nov 2024", "$428K", "Ready"],
      ["PO-85107", "Zara", "8,600", "22 Nov 2024", "$356K", "Ready"],
      ["PO-85241", "Uniqlo", "18,200", "08 Nov 2024", "$284K", "Pending"],
      ["PO-85322", "Levi's", "4,800", "01 Nov 2024", "$196K", "At risk"],
    ],
    statusIndex: 5,
    sideTitle: "Ex-factory pipeline",
    sideDescription: "Orders by ex-factory status.",
    progress: [
      { label: "Ready", value: "4 orders", percent: 40, tone: "bg-emerald-500" },
      { label: "Pending", value: "3 orders", percent: 30, tone: "bg-primary" },
      { label: "At risk", value: "3 orders", percent: 30, tone: "bg-rose-500" },
    ],
    notices: [{ title: "PO-85322 at risk", detail: "Levi's jacket shipment may miss Nov 1 ex-factory date.", tone: "rose" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function ProductionWorkspace({ module }: { module: ModuleKey }) {
  const config = configs[module]

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/production" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Production
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Factory className="size-4 text-muted-foreground" />}
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
                <CardTitle className="flex items-center gap-2 text-base"><Factory className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Production attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening production task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Production hub</p><p className="text-xs text-muted-foreground">All floor data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
