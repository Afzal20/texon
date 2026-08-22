"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, FileText, Filter, Plus, Search, TrendingDown, TrendingUp, Package } from "lucide-react"
import { toast } from "sonner"
import { RawItemsViewer } from "@/components/data/RawDataViewer"

type ModuleKey =
  | "fabric-inventory"
  | "accessories-inventory"
  | "trims-inventory"
  | "physical-inventory-with-pi-booking"
  | "shade-approval-distribution"
  | "fabric-inspection"
  | "rm-issue-against-approved-requisition"
  | "gate-pass-challan-prepare-printing"
  | "leftover-declarations-after-style-lot-close"
  | "re-booking-or-po-for-remaining-quantity"
  | "rm-transfer-style-lot-store-to-style-lot-store"
  | "local-purchase"
  | "receiving-returning-rm-to-from-supplier"
  | "damaged-rejected-goods-receiving"
  | "low-stock-alerts"
  | "opening-closing-stock-tracking"
  | "wastage-tracking"

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
  "fabric-inventory": {
    title: "Fabric Inventory",
    eyebrow: "Fabric stock",
    description: "Track fabric inventory levels, usage, and replenishment across all warehouses.",
    action: "Log fabric receipt",
    metrics: [
      { label: "Total fabric in stock", value: "124,800 m", note: "Across 3 warehouses", trend: "up" },
      { label: "Rolls received today", value: "48", note: "32,400 m", trend: "up" },
      { label: "Issued today", value: "18,600 m", note: "To production", trend: "neutral" },
      { label: "Low-stock SKUs", value: "6", note: "Below reorder point", trend: "down" },
    ],
    tableTitle: "Fabric inventory register",
    tableDescription: "Current fabric stock by type and color.",
    columns: ["Fabric", "Color", "Rolls", "Meters", "Warehouse", "Status"],
    rows: [
      ["Cotton Poplin", "White", "124", "18,600", "WH-A", "Adequate"],
      ["Poly Blend", "Navy", "86", "12,400", "WH-A", "Adequate"],
      ["Denim 7oz", "Indigo", "42", "6,800", "WH-B", "Low"],
      ["Chambray", "Sky Blue", "28", "4,200", "WH-C", "Critical"],
    ],
    statusIndex: 5,
    sideTitle: "Stock distribution",
    sideDescription: "Fabric stock by warehouse.",
    progress: [
      { label: "WH-A", value: "72,400 m", percent: 58, tone: "bg-emerald-500" },
      { label: "WH-B", value: "32,800 m", percent: 26, tone: "bg-primary" },
      { label: "WH-C", value: "19,600 m", percent: 16, tone: "bg-amber-500" },
    ],
    notices: [{ title: "Chambray fabric critical", detail: "Only 4,200 m remaining — place emergency order.", tone: "rose" }],
  },
  "accessories-inventory": {
    title: "Accessories Inventory",
    eyebrow: "Accessories stock",
    description: "Manage accessories inventory including buttons, zippers, labels, and packaging materials.",
    action: "Log receipt",
    metrics: [
      { label: "Total SKUs", value: "342", note: "Active accessories", trend: "neutral" },
      { label: "Received today", value: "18", note: "From suppliers", trend: "up" },
      { label: "Issued today", value: "24", note: "To production", trend: "neutral" },
      { label: "Low-stock items", value: "12", note: "Below reorder point", trend: "down" },
    ],
    tableTitle: "Accessories stock register",
    tableDescription: "Current accessories inventory by category.",
    columns: ["Item", "Category", "In stock", "Unit", "Reorder pt", "Status"],
    rows: [
      ["Buttons (4-hole)", "Buttons", "24,000", "pcs", "5,000", "Adequate"],
      ["YKK Zipper #5", "Zippers", "3,200", "pcs", "1,000", "Adequate"],
      ["Woven label (main)", "Labels", "8,400", "pcs", "2,000", "Adequate"],
      ["Care label", "Labels", "1,200", "pcs", "2,000", "Low"],
    ],
    statusIndex: 5,
    sideTitle: "Category breakdown",
    sideDescription: "Accessories by category.",
    progress: [
      { label: "Buttons & zippers", value: "27,200 pcs", percent: 45, tone: "bg-emerald-500" },
      { label: "Labels & tags", value: "18,400 pcs", percent: 31, tone: "bg-primary" },
      { label: "Packaging", value: "14,200 pcs", percent: 24, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Care labels running low", detail: "1,200 pcs remaining — below 2,000 reorder point.", tone: "amber" }],
  },
  "trims-inventory": {
    title: "Trims Inventory",
    eyebrow: "Trims stock",
    description: "Track trims inventory including threads, elastics, cords, and bias binding.",
    action: "Log trims receipt",
    metrics: [
      { label: "Total trims SKUs", value: "186", note: "Active items", trend: "neutral" },
      { label: "Received today", value: "12", note: "From suppliers", trend: "up" },
      { label: "Issued today", value: "18", note: "To production", trend: "neutral" },
      { label: "Low-stock items", value: "8", note: "Below reorder point", trend: "down" },
    ],
    tableTitle: "Trims inventory register",
    tableDescription: "Current trims stock by type.",
    columns: ["Trim", "Type", "In stock", "Unit", "Reorder pt", "Status"],
    rows: [
      ["Thread (white)", "Thread", "480", "cones", "100", "Adequate"],
      ["Elastic 1 inch", "Elastic", "2,400", "m", "500", "Adequate"],
      ["Drawcord", "Cord", "1,800", "m", "400", "Adequate"],
      ["Bias binding", "Binding", "320", "m", "400", "Low"],
    ],
    statusIndex: 5,
    sideTitle: "Trims status",
    sideDescription: "Trims stock by category.",
    progress: [
      { label: "Adequate", value: "178 items", percent: 96, tone: "bg-emerald-500" },
      { label: "Low", value: "6 items", percent: 3, tone: "bg-amber-500" },
      { label: "Critical", value: "2 items", percent: 1, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Bias binding below reorder", detail: "320 m remaining — place order to avoid line stoppage.", tone: "amber" }],
  },
  "physical-inventory-with-pi-booking": {
    title: "Physical Inventory with PI/Booking",
    eyebrow: "PI tracking",
    description: "Manage physical inventory counts with PI reference and booking reconciliation.",
    action: "Start count",
    metrics: [
      { label: "Pending PI counts", value: "4", note: "Scheduled this week", trend: "neutral" },
      { label: "Completed counts", value: "12", note: "This month", trend: "up" },
      { label: "Discrepancies found", value: "3", note: "Qty mismatch", trend: "down" },
      { label: "Accuracy rate", value: "98.6%", note: "Physical vs system", trend: "up" },
    ],
    tableTitle: "PI count register",
    tableDescription: "Physical inventory count results with booking status.",
    columns: ["PI #", "Location", "Date", "Variance", "Value", "Status"],
    rows: [
      ["PI-2418", "WH-A / Zone 1", "14 Oct", "+0.2%", "$12,400", "Verified"],
      ["PI-2415", "WH-A / Zone 2", "14 Oct", "-0.4%", "$8,600", "Verified"],
      ["PI-2412", "WH-B / Zone 1", "13 Oct", "+1.8%", "$4,200", "Discrepancy"],
      ["PI-2408", "WH-C / Zone 1", "12 Oct", "0.0%", "$6,800", "Verified"],
    ],
    statusIndex: 5,
    sideTitle: "Count accuracy",
    sideDescription: "Monthly PI accuracy.",
    progress: [
      { label: "Verified", value: "12 counts", percent: 86, tone: "bg-emerald-500" },
      { label: "Pending review", value: "1 count", percent: 7, tone: "bg-primary" },
      { label: "Discrepancy", value: "1 count", percent: 7, tone: "bg-rose-500" },
    ],
    notices: [{ title: "PI-2412 variance exceeds 1%", detail: "WH-B Zone 1 fabric count mismatch — investigate shortage.", tone: "rose" }],
  },
  "shade-approval-distribution": {
    title: "Shade Approval & Distribution",
    eyebrow: "Shade management",
    description: "Manage fabric shade approval and distribution to production lines.",
    action: "Log shade approval",
    metrics: [
      { label: "Pending approvals", value: "6", note: "Awaiting buyer sign-off", trend: "neutral" },
      { label: "Approved today", value: "4", note: "Cleared for distribution", trend: "up" },
      { label: "Distributed today", value: "8", note: "To production lines", trend: "up" },
      { label: "Rejection rate", value: "2.4%", note: "Below 5% target", trend: "up" },
    ],
    tableTitle: "Shade approval tracker",
    tableDescription: "Shade approval and distribution status.",
    columns: ["Shade #", "Fabric", "Order", "Buyer", "Result", "Status"],
    rows: [
      ["SH-2418", "Cotton Poplin", "PO-84920", "H&M", "Approved", "Distributed"],
      ["SH-2415", "Poly Blend", "PO-85107", "Zara", "Approved", "Distributed"],
      ["SH-2412", "Denim 7oz", "PO-85241", "Uniqlo", "Rejected", "On hold"],
      ["SH-2408", "Chambray", "PO-85322", "Levi's", "Pending", "Awaiting"],
    ],
    statusIndex: 5,
    sideTitle: "Approval pipeline",
    sideDescription: "Shade approval status.",
    progress: [
      { label: "Approved & distributed", value: "18 shades", percent: 60, tone: "bg-emerald-500" },
      { label: "Pending approval", value: "6 shades", percent: 20, tone: "bg-primary" },
      { label: "Rejected", value: "6 shades", percent: 20, tone: "bg-rose-500" },
    ],
    notices: [{ title: "PO-85241 shade rejected", detail: "Denim 7oz color inconsistency — request resampling from supplier.", tone: "rose" }],
  },
  "fabric-inspection": {
    title: "Fabric Inspection",
    eyebrow: "Inspection tracking",
    description: "Track fabric inspection results including defect grading and supplier quality.",
    action: "Log inspection",
    metrics: [
      { label: "Inspections today", value: "14", note: "Across all suppliers", trend: "up" },
      { label: "Pass rate", value: "94.2%", note: "Above 90% target", trend: "up" },
      { label: "Rejections", value: "3", note: "Rolls rejected", trend: "down" },
      { label: "Avg. grade", value: "4.2/5", note: "Supplier quality", trend: "up" },
    ],
    tableTitle: "Fabric inspection log",
    tableDescription: "Inspection results by fabric lot.",
    columns: ["Lot #", "Fabric", "Supplier", "Rolls", "Grade", "Status"],
    rows: [
      ["LOT-2418", "Cotton Poplin", "TexFab Ltd", "42", "4.5/5", "Pass"],
      ["LOT-2415", "Poly Blend", "FiberCo", "28", "4.2/5", "Pass"],
      ["LOT-2412", "Denim 7oz", "DenimWorks", "18", "3.1/5", "Fail"],
      ["LOT-2408", "Chambray", "ChamText", "12", "4.0/5", "Pass"],
    ],
    statusIndex: 5,
    sideTitle: "Inspection results",
    sideDescription: "Monthly inspection outcomes.",
    progress: [
      { label: "Pass", value: "132 rolls", percent: 94, tone: "bg-emerald-500" },
      { label: "Fail", value: "8 rolls", percent: 6, tone: "bg-rose-500" },
    ],
    notices: [{ title: "LOT-2412 failed inspection", detail: "Denim 7oz — excessive slubs and uneven dye. Reject entire lot.", tone: "rose" }],
  },
  "rm-issue-against-approved-requisition": {
    title: "RM Issue Against Approved Requisition",
    eyebrow: "RM issuance",
    description: "Issue raw materials from store against approved requisitions from production.",
    action: "Issue RM",
    metrics: [
      { label: "Issues today", value: "24", note: "Against requisitions", trend: "up" },
      { label: "Pending issues", value: "6", note: "Awaiting approval", trend: "neutral" },
      { label: "Value issued", value: "$48,200", note: "Today", trend: "neutral" },
      { label: "Rejection rate", value: "1.2%", note: "Qty mismatch", trend: "up" },
    ],
    tableTitle: "RM issuance register",
    tableDescription: "Raw material issues against approved requisitions.",
    columns: ["Issue #", "Requisition", "Material", "Qty", "Line", "Status"],
    rows: [
      ["IS-2418", "REQ-2418", "Cotton Poplin", "480 m", "Line 1", "Issued"],
      ["IS-2415", "REQ-2415", "Thread (white)", "24 cones", "Line 3", "Issued"],
      ["IS-2412", "REQ-2412", "Denim 7oz", "320 m", "Line 5", "Pending"],
      ["IS-2408", "REQ-2408", "Labels", "1,200 pcs", "Line 7", "Issued"],
    ],
    statusIndex: 5,
    sideTitle: "Issue status",
    sideDescription: "Today's RM issuance.",
    progress: [
      { label: "Issued", value: "24 issues", percent: 80, tone: "bg-emerald-500" },
      { label: "Pending", value: "6 issues", percent: 20, tone: "bg-amber-500" },
    ],
    notices: [{ title: "6 requisitions pending issue", detail: "REQ-2412 awaiting store manager approval for denim issuance.", tone: "amber" }],
  },
  "gate-pass-challan-prepare-printing": {
    title: "Gate Pass, Challan Prepare & Printing",
    eyebrow: "Gate pass & challan",
    description: "Prepare and print gate passes and challans for material movement in and out of the factory.",
    action: "Create gate pass",
    metrics: [
      { label: "Gate passes today", value: "12", note: "Material movement", trend: "neutral" },
      { label: "Challans printed", value: "8", note: "Outward dispatch", trend: "up" },
      { label: "Pending preparation", value: "4", note: "Awaiting approval", trend: "neutral" },
      { label: "Rejected", value: "1", note: "Incomplete documentation", trend: "down" },
    ],
    tableTitle: "Gate pass & challan register",
    tableDescription: "Material movement documentation.",
    columns: ["GP #", "Type", "Material", "Qty", "Destination", "Status"],
    rows: [
      ["GP-2418", "Outward", "Cotton Poplin", "480 m", "Dyeing unit", "Approved"],
      ["GP-2415", "Inward", "Poly Blend", "640 m", "WH-A", "Approved"],
      ["GP-2412", "Outward", "Denim 7oz", "320 m", "Washing unit", "Pending"],
      ["GP-2408", "Return", "Labels", "800 pcs", "Supplier", "Rejected"],
    ],
    statusIndex: 5,
    sideTitle: "Movement type",
    sideDescription: "Today's gate pass types.",
    progress: [
      { label: "Outward", value: "6 passes", percent: 50, tone: "bg-primary" },
      { label: "Inward", value: "4 passes", percent: 33, tone: "bg-emerald-500" },
      { label: "Return", value: "2 passes", percent: 17, tone: "bg-amber-500" },
    ],
    notices: [{ title: "GP-2408 rejected", detail: "Incomplete return documentation — resubmit with supplier acknowledgment.", tone: "amber" }],
  },
  "leftover-declarations-after-style-lot-close": {
    title: "Leftover Declarations After Style/Lot Close",
    eyebrow: "Leftover declarations",
    description: "Declare and manage leftover materials after style or lot closure for reconciliation.",
    action: "Declare leftover",
    metrics: [
      { label: "Declarations pending", value: "4", note: "Awaiting reconciliation", trend: "neutral" },
      { label: "Completed this month", value: "18", note: "Reconciled", trend: "up" },
      { label: "Leftover value", value: "$24,600", note: "Declared this month", trend: "neutral" },
      { label: "Scrap recovered", value: "$8,400", note: "From 12 declarations", trend: "up" },
    ],
    tableTitle: "Leftover declaration register",
    tableDescription: "Leftover material declarations after style/lot close.",
    columns: ["Decl #", "Style", "Material", "Qty", "Value", "Status"],
    rows: [
      ["LD-2418", "Relaxed Oxford", "Cotton Poplin", "320 m", "$4,800", "Reconciled"],
      ["LD-2415", "Stretch Cargo", "Poly Blend", "180 m", "$2,400", "Pending"],
      ["LD-2412", "Ribbed Tank", "Elastic", "400 m", "$800", "Reconciled"],
      ["LD-2408", "Denim Jacket", "Thread (black)", "12 cones", "$240", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Declaration status",
    sideDescription: "Monthly leftover declarations.",
    progress: [
      { label: "Reconciled", value: "18 declarations", percent: 82, tone: "bg-emerald-500" },
      { label: "Pending", value: "4 declarations", percent: 18, tone: "bg-amber-500" },
    ],
    notices: [{ title: "4 declarations pending", detail: "LD-2415 Stretch Cargo leftover awaiting buyer confirmation.", tone: "amber" }],
  },
  "re-booking-or-po-for-remaining-quantity": {
    title: "Re-booking or PO for Remaining Quantity",
    eyebrow: "Re-booking",
    description: "Manage re-bookings and purchase orders for remaining quantities after partial consumption.",
    action: "Create re-booking",
    metrics: [
      { label: "Active re-bookings", value: "6", note: "In progress", trend: "neutral" },
      { label: "Completed this month", value: "12", note: "POs confirmed", trend: "up" },
      { label: "Pending confirmation", value: "3", note: "Awaiting supplier", trend: "neutral" },
      { label: "Total value", value: "$86,400", note: "Re-booked this month", trend: "up" },
    ],
    tableTitle: "Re-booking register",
    tableDescription: "Re-bookings and POs for remaining quantities.",
    columns: ["RB #", "Original PO", "Material", "Qty", "Value", "Status"],
    rows: [
      ["RB-2418", "PO-84920", "Cotton Poplin", "2,400 m", "$18,600", "Confirmed"],
      ["RB-2415", "PO-85107", "Poly Blend", "1,200 m", "$9,200", "Pending"],
      ["RB-2412", "PO-85241", "Denim 7oz", "800 m", "$12,400", "Confirmed"],
      ["RB-2408", "PO-85322", "Thread (black)", "48 cones", "$960", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Re-booking status",
    sideDescription: "Current re-booking pipeline.",
    progress: [
      { label: "Confirmed", value: "12 bookings", percent: 67, tone: "bg-emerald-500" },
      { label: "Pending", value: "3 bookings", percent: 17, tone: "bg-primary" },
      { label: "Rejected", value: "3 bookings", percent: 17, tone: "bg-rose-500" },
    ],
    notices: [{ title: "3 re-bookings pending", detail: "RB-2415 awaiting supplier confirmation for poly blend supply.", tone: "amber" }],
  },
  "rm-transfer-style-lot-store-to-style-lot-store": {
    title: "RM Transfer (Style/Lot/Store to Style/Lot/Store)",
    eyebrow: "RM transfer",
    description: "Track raw material transfers between style, lot, and store locations.",
    action: "New transfer",
    metrics: [
      { label: "Transfers today", value: "8", note: "Between locations", trend: "neutral" },
      { label: "Pending transfers", value: "2", note: "Awaiting approval", trend: "neutral" },
      { label: "Value transferred", value: "$32,400", note: "Today", trend: "neutral" },
      { label: "Completion rate", value: "96.8%", note: "On-time transfers", trend: "up" },
    ],
    tableTitle: "RM transfer register",
    tableDescription: "Raw material transfers between locations.",
    columns: ["Transfer #", "Material", "From", "To", "Qty", "Status"],
    rows: [
      ["TR-2418", "Cotton Poplin", "WH-A / Lot-12", "Line 1", "480 m", "Complete"],
      ["TR-2415", "Poly Blend", "WH-A / Lot-08", "Line 3", "320 m", "Complete"],
      ["TR-2412", "Denim 7oz", "WH-B / Lot-15", "Line 5", "240 m", "In transit"],
      ["TR-2408", "Thread (white)", "WH-A / Lot-03", "Line 7", "12 cones", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Transfer status",
    sideDescription: "Today's RM transfers.",
    progress: [
      { label: "Complete", value: "6 transfers", percent: 75, tone: "bg-emerald-500" },
      { label: "In transit", value: "1 transfer", percent: 12, tone: "bg-primary" },
      { label: "Pending", value: "1 transfer", percent: 12, tone: "bg-amber-500" },
    ],
    notices: [{ title: "TR-2408 pending approval", detail: "Thread transfer from WH-A to Line 7 awaiting store approval.", tone: "amber" }],
  },
  "local-purchase": {
    title: "Local Purchase",
    eyebrow: "Local procurement",
    description: "Manage local purchase orders for urgent material requirements from local suppliers.",
    action: "Create PO",
    metrics: [
      { label: "Active POs", value: "8", note: "With local suppliers", trend: "neutral" },
      { label: "Delivered today", value: "3", note: "12,400 units", trend: "up" },
      { label: "Pending delivery", value: "5", note: "Awaiting supply", trend: "neutral" },
      { label: "Total spend", value: "$42,800", note: "This month", trend: "neutral" },
    ],
    tableTitle: "Local purchase register",
    tableDescription: "Local purchase orders and delivery status.",
    columns: ["PO #", "Supplier", "Material", "Qty", "Value", "Status"],
    rows: [
      ["LPO-2418", "QuickSupply", "Buttons", "5,000 pcs", "$1,200", "Delivered"],
      ["LPO-2415", "LocalTex", "Thread (black)", "48 cones", "$960", "Delivered"],
      ["LPO-2412", "FastTrims", "Zipper #5", "2,000 pcs", "$4,800", "In transit"],
      ["LPO-2408", "PackPro", "Poly bags", "10,000 pcs", "$2,400", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Delivery status",
    sideDescription: "Local PO delivery pipeline.",
    progress: [
      { label: "Delivered", value: "5 POs", percent: 62, tone: "bg-emerald-500" },
      { label: "In transit", value: "2 POs", percent: 25, tone: "bg-primary" },
      { label: "Pending", value: "1 PO", percent: 12, tone: "bg-amber-500" },
    ],
    notices: [{ title: "LPO-2408 delayed", detail: "PackPro poly bags delayed by 2 days — escalate with supplier.", tone: "amber" }],
  },
  "receiving-returning-rm-to-from-supplier": {
    title: "Receiving/Returning RM to/from Supplier",
    eyebrow: "RM receiving",
    description: "Manage receiving of raw materials from suppliers and returns for quality issues.",
    action: "Log receipt",
    metrics: [
      { label: "Receipts today", value: "8", note: "From suppliers", trend: "up" },
      { label: "Returns today", value: "2", note: "Quality issues", trend: "down" },
      { label: "Pending receipts", value: "4", note: "In transit", trend: "neutral" },
      { label: "Return rate", value: "3.2%", note: "Below 5% target", trend: "up" },
    ],
    tableTitle: "RM receipt & return register",
    tableDescription: "Raw material receipts and returns from suppliers.",
    columns: ["Ref #", "Type", "Supplier", "Material", "Qty", "Status"],
    rows: [
      ["REC-2418", "Receipt", "TexFab Ltd", "Cotton Poplin", "4,800 m", "Received"],
      ["REC-2415", "Receipt", "FiberCo", "Poly Blend", "2,400 m", "Received"],
      ["REC-2412", "Return", "DenimWorks", "Denim 7oz", "800 m", "Return sent"],
      ["REC-2408", "Receipt", "ChamText", "Chambray", "1,200 m", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Receipt vs return",
    sideDescription: "Today's RM movements.",
    progress: [
      { label: "Received", value: "6 receipts", percent: 75, tone: "bg-emerald-500" },
      { label: "Returned", value: "2 returns", percent: 25, tone: "bg-rose-500" },
    ],
    notices: [{ title: "Denim 7oz returned to supplier", detail: "800 m returned due to color shade inconsistency — awaiting replacement.", tone: "rose" }],
  },
  "damaged-rejected-goods-receiving": {
    title: "Damaged/Rejected Goods Receiving",
    eyebrow: "Damaged goods",
    description: "Track receiving and handling of damaged or rejected goods from production and suppliers.",
    action: "Log damaged goods",
    metrics: [
      { label: "Items received today", value: "6", note: "Damaged/rejected", trend: "neutral" },
      { label: "Value at risk", value: "$8,400", note: "This month", trend: "down" },
      { label: "Disposed", value: "4", note: "Items disposed", trend: "up" },
      { label: "Pending review", value: "2", note: "Awaiting decision", trend: "neutral" },
    ],
    tableTitle: "Damaged goods register",
    tableDescription: "Damaged and rejected goods with disposition status.",
    columns: ["Ref #", "Source", "Material", "Qty", "Value", "Status"],
    rows: [
      ["DG-2418", "Production", "Cotton Poplin", "120 m", "$1,800", "Disposed"],
      ["DG-2415", "Supplier", "Poly Blend", "80 m", "$640", "Returned"],
      ["DG-2412", "Production", "Thread (white)", "12 cones", "$240", "Pending review"],
      ["DG-2408", "Supplier", "Denim 7oz", "200 m", "$3,200", "Pending review"],
    ],
    statusIndex: 5,
    sideTitle: "Disposition status",
    sideDescription: "Damaged goods handling.",
    progress: [
      { label: "Disposed / returned", value: "4 items", percent: 67, tone: "bg-emerald-500" },
      { label: "Pending review", value: "2 items", percent: 33, tone: "bg-amber-500" },
    ],
    notices: [{ title: "DG-2408 awaiting decision", detail: "200 m damaged denim — decide between rework or supplier claim.", tone: "amber" }],
  },
  "low-stock-alerts": {
    title: "Low-Stock Alerts",
    eyebrow: "Stock alerts",
    description: "Monitor and manage low-stock alerts across all inventory categories.",
    action: "Acknowledge alert",
    metrics: [
      { label: "Active alerts", value: "14", note: "Below reorder point", trend: "down" },
      { label: "Critical alerts", value: "3", note: "Below safety stock", trend: "down" },
      { label: "Resolved today", value: "6", note: "Restocked", trend: "up" },
      { label: "Avg. response time", value: "2.4 hrs", note: "Alert to action", trend: "up" },
    ],
    tableTitle: "Low-stock alert register",
    tableDescription: "Active low-stock alerts across inventory.",
    columns: ["Alert #", "Item", "Category", "Current", "Reorder pt", "Severity"],
    rows: [
      ["LS-2418", "Chambray", "Fabric", "4,200 m", "6,000 m", "Critical"],
      ["LS-2415", "Care labels", "Accessories", "1,200 pcs", "2,000 pcs", "Warning"],
      ["LS-2412", "Bias binding", "Trims", "320 m", "400 m", "Warning"],
      ["LS-2408", "Thread (black)", "Trims", "18 cones", "24 cones", "Critical"],
    ],
    statusIndex: 5,
    sideTitle: "Alert severity",
    sideDescription: "Active alerts by severity.",
    progress: [
      { label: "Warning", value: "8 alerts", percent: 57, tone: "bg-amber-500" },
      { label: "Critical", value: "3 alerts", percent: 21, tone: "bg-rose-500" },
      { label: "Resolved", value: "3 alerts", percent: 21, tone: "bg-emerald-500" },
    ],
    notices: [{ title: "3 critical stock alerts", detail: "Chambray, care labels, and thread below safety stock — urgent reorder needed.", tone: "rose" }],
  },
  "opening-closing-stock-tracking": {
    title: "Opening/Closing Stock Tracking",
    eyebrow: "Stock tracking",
    description: "Track opening and closing stock balances for inventory reconciliation and reporting.",
    action: "Log closing stock",
    metrics: [
      { label: "Opening stock value", value: "$482,400", note: "Start of month", trend: "neutral" },
      { label: "Closing stock value", value: "$512,800", note: "Current", trend: "up" },
      { label: "Net movement", value: "+$30,400", note: "6.3% increase", trend: "up" },
      { label: "Reconciled items", value: "94%", note: "System vs physical", trend: "up" },
    ],
    tableTitle: "Stock balance register",
    tableDescription: "Opening and closing stock by category.",
    columns: ["Category", "Opening", "Received", "Issued", "Closing", "Variance"],
    rows: [
      ["Fabric", "$284,200", "$124,800", "$96,400", "$312,600", "+0.2%"],
      ["Accessories", "$86,400", "$42,200", "$38,600", "$90,000", "-0.1%"],
      ["Trims", "$62,800", "$28,400", "$24,200", "$67,000", "+0.3%"],
      ["Packaging", "$49,000", "$18,600", "$14,400", "$53,200", "0.0%"],
    ],
    statusIndex: 5,
    sideTitle: "Stock movement",
    sideDescription: "Monthly stock movement.",
    progress: [
      { label: "Fabric", value: "$312,600", percent: 61, tone: "bg-emerald-500" },
      { label: "Accessories", value: "$90,000", percent: 18, tone: "bg-primary" },
      { label: "Trims & packaging", value: "$120,200", percent: 23, tone: "bg-slate-400" },
    ],
    notices: [{ title: "Fabric variance +0.2%", detail: "Minor overage in WH-A — investigate potential counting error.", tone: "amber" }],
  },
  "wastage-tracking": {
    title: "Wastage Tracking",
    eyebrow: "Wastage monitor",
    description: "Track and analyze material wastage across production processes for cost control.",
    action: "Log wastage",
    metrics: [
      { label: "Total wastage today", value: "340 m", note: "Fabric wastage", trend: "down" },
      { label: "Wastage rate", value: "2.8%", note: "Below 4% target", trend: "up" },
      { label: "Scrap value", value: "$4,200", note: "Recoverable", trend: "neutral" },
      { label: "Cost impact", value: "$1,840", note: "Irrecoverable waste", trend: "down" },
    ],
    tableTitle: "Wastage register",
    tableDescription: "Material wastage by process and type.",
    columns: ["Entry #", "Process", "Material", "Qty", "Type", "Status"],
    rows: [
      ["W-2418", "Cutting", "Cotton Poplin", "180 m", "Cut waste", "Logged"],
      ["W-2415", "Sewing", "Thread (white)", "12 cones", "Thread waste", "Logged"],
      ["W-2412", "Washing", "Denim 7oz", "80 m", "Wash shrinkage", "Logged"],
      ["W-2408", "Finishing", "Labels", "200 pcs", "Defective", "Pending"],
    ],
    statusIndex: 5,
    sideTitle: "Wastage by process",
    sideDescription: "Monthly wastage breakdown.",
    progress: [
      { label: "Cutting", value: "180 m", percent: 53, tone: "bg-primary" },
      { label: "Washing", value: "80 m", percent: 24, tone: "bg-amber-500" },
      { label: "Sewing & finishing", value: "80 m", percent: 24, tone: "bg-slate-400" },
    ],
    notices: [{ title: "W-2408 pending classification", detail: "200 defective labels — classify as supplier defect or process error.", tone: "amber" }],
  },
}

function noticeClass(tone: WorkspaceConfig["notices"][number]["tone"]) {
  return tone === "rose" ? "border-rose-200 bg-rose-50" : tone === "emerald" ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
}

export function InventoryWorkspace({ 
  module, 
  metrics, 
  rows, 
  rawItems,
  isLoading, 
  error 
}: { 
  module: ModuleKey
  metrics?: WorkspaceConfig["metrics"]
  rows?: WorkspaceConfig["rows"]
  rawItems?: Record<string, unknown>[]
  isLoading?: boolean
  error?: string | null
}) {
  const baseConfig = configs[module]
  const config = {
    ...baseConfig,
    metrics: metrics ?? baseConfig.metrics,
    rows: rows ?? baseConfig.rows,
  }

  if (isLoading) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">Loading {baseConfig.title.toLowerCase()} data...</p>
            </div>
          </div>
        </main>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg font-medium text-rose-600">Failed to load data</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/inventory" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Inventory / Store
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
                  {metric.trend === "up" ? <TrendingUp className="size-4 text-emerald-600" /> : metric.trend === "down" ? <TrendingDown className="size-4 text-rose-600" /> : <Package className="size-4 text-muted-foreground" />}
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
                    {config.rows.map((row, rowIndex) => (
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
                <CardTitle className="flex items-center gap-2 text-base"><Package className="size-4 text-primary" /> {config.sideTitle}</CardTitle>
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
                <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" /> Inventory attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0">
                {config.notices.map((notice) => <div key={notice.title} className={`rounded-lg border p-3 ${noticeClass(notice.tone)}`}><p className="text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.detail}</p></div>)}
                <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline" onClick={() => toast.info("Opening inventory task center")}>Open task center <ArrowUpRight className="size-3" /></button>
              </CardContent>
            </Card>
            <Card className="gap-3 bg-muted/30">
              <CardContent className="flex items-center gap-3 p-0"><div className="rounded-lg bg-primary/10 p-2 text-primary"><FileText className="size-4" /></div><div><p className="text-sm font-medium">Inventory hub</p><p className="text-xs text-muted-foreground">All stock data syncs in real-time across departments.</p></div></CardContent>
            </Card>
          </div>
        </div>
        {rawItems && rawItems.length > 0 && <RawItemsViewer items={rawItems} />}
      </main>
    </AppLayout>
  )
}
