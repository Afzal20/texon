export type TexonModuleGroup =
  | "Factory Operations"
  | "Commercial & Finance"
  | "People & Governance"
  | "Platform & Reporting"

export type TexonModuleAccent =
  | "indigo"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "slate"

export type TexonModuleIcon =
  | "activity"
  | "calendar"
  | "clipboard"
  | "dollar"
  | "factory"
  | "fileCheck"
  | "package"
  | "settings"
  | "shield"
  | "users"

export type TexonModule = {
  title: string
  slug: string
  group: TexonModuleGroup
  accent: TexonModuleAccent
  icon: TexonModuleIcon
  items: readonly string[]
}

export const texonModuleGroups = [
  "Factory Operations",
  "Commercial & Finance",
  "People & Governance",
  "Platform & Reporting",
] as const satisfies readonly TexonModuleGroup[]

export const texonModules = [
  {
    title: "Merchandising",
    slug: "merchandising",
    group: "Factory Operations",
    accent: "indigo",
    icon: "clipboard",
    items: [
      "Style management",
      "Pre-costing",
      "Sample order management",
      "Bulk PO management",
      "Budget & demand assessment",
      "Capacity & booking allocation",
      "Buyer enquiry analysis",
      "RM collection, consumption, sourcing",
      "Development monitoring (by supplier)",
      "Sample monitoring (FIT, PP)",
      "SMV calculation",
      "IE suggestion for PPH",
      "Skill inventory",
      "Production downtime analysis",
      "Line layout",
      "Process-wise targets & achievements",
      "Production efficiency tracking",
    ],
  },
  {
    title: "IE & Planning",
    slug: "ie-planning",
    group: "Factory Operations",
    accent: "emerald",
    icon: "calendar",
    items: [
      "Capacity & booking allocation",
      "Process-wise production planning",
      "Risk assessment",
      "PO-wise TnA (Time & Action)",
      "Production order issue",
      "Production dashboard",
      "Style analysis",
      "Ladder planning",
      "Line planning (loading & unloading)",
    ],
  },
  {
    title: "Commercial Management",
    slug: "commercial-management",
    group: "Commercial & Finance",
    accent: "sky",
    icon: "dollar",
    items: [
      "Import management",
      "Export management",
      "Export LC/sales contract collection & amendment",
      "BTB LC opening & amendment",
      "Shipment monitoring & ETA updates",
      "Supplier document receive & acceptance",
      "Acceptance clearance",
      "Booking to forwarder",
      "Invoice preparation",
      "Bill of exchange/bank document",
      "Realization follow-up",
      "Short realization cause tracking",
      "SOD/FC transfer acknowledgement",
      "Disbursement amount tracking",
    ],
  },
  {
    title: "Procurement, Sourcing & Supply",
    slug: "procurement-sourcing-supply",
    group: "Factory Operations",
    accent: "amber",
    icon: "package",
    items: [
      "Raw materials booking",
      "Knitting & dyeing program",
      "Raw materials requisition",
      "Procurement management",
      "Stock loan management",
      "Quotation vs actual analysis",
      "Supplier selection (price, quality, delivery, grade)",
    ],
  },
  {
    title: "Production",
    slug: "production",
    group: "Factory Operations",
    accent: "rose",
    icon: "factory",
    items: [
      "Production order received",
      "Process-wise floor layout",
      "Floor requisition",
      "Process-wise production execution",
      "Quality assurance",
      "Inspection & packing",
      "RM requisition & approval",
      "Cutting & sending to line",
      "Artwork/printing/embroidery monitoring",
      "Line input",
      "Hourly sewing production",
      "Send to washing",
      "Receive from washing",
      "Thread cutting",
      "Final QC",
      "Carton & packing",
      "Packing list preparation",
      "Booking to forwarder",
      "Inspection schedule",
      "Ex-factory",
    ],
  },
  {
    title: "Inventory / Store",
    slug: "inventory-store",
    group: "Factory Operations",
    accent: "slate",
    icon: "package",
    items: [
      "Fabric inventory",
      "Accessories inventory",
      "Trims inventory",
      "Physical inventory with PI/booking",
      "Shade approval & distribution",
      "Fabric inspection",
      "RM issue against approved requisition",
      "Gate pass, challan prepare & printing",
      "Leftover declarations after style/lot close",
      "Re-booking or PO for remaining quantity",
      "RM transfer (style/lot/store to style/lot/store)",
      "Local purchase",
      "Receiving/returning RM to/from supplier",
      "Damaged/rejected goods receiving",
      "Low-stock alerts",
      "Opening/closing stock tracking",
      "Wastage tracking",
    ],
  },
  {
    title: "Quality Control",
    slug: "quality-control",
    group: "Factory Operations",
    accent: "emerald",
    icon: "fileCheck",
    items: [
      "Fabric inspection",
      "Inline QC",
      "End-line QC",
      "Finishing QC",
      "Final inspection",
      "Defect category tracking",
      "Rejection report",
      "Alteration report",
      "Buyer-wise quality history",
      "Corrective action tracking",
    ],
  },
  {
    title: "HR, Attendance & Payroll",
    slug: "hr-attendance-payroll",
    group: "People & Governance",
    accent: "indigo",
    icon: "users",
    items: [
      "Employee profile",
      "Worker ID",
      "Department & designation",
      "Shift schedule",
      "Attendance",
      "Overtime",
      "Leave",
      "Salary sheet",
      "Bonus",
      "Payroll approval",
      "Compliance reports",
    ],
  },
  {
    title: "Accounts & Finance",
    slug: "accounts-finance",
    group: "Commercial & Finance",
    accent: "emerald",
    icon: "dollar",
    items: [
      "Accounts payable",
      "Accounts receivable",
      "Supplier bills",
      "Buyer payments",
      "Cost center tracking",
      "Order-wise profit & loss",
      "Bank & cash management",
      "Expense tracking",
      "Financial reporting",
      "Integrated financial accounting system",
    ],
  },
  {
    title: "CRM",
    slug: "crm",
    group: "Commercial & Finance",
    accent: "rose",
    icon: "activity",
    items: [
      "Buyer profile",
      "Buyer communication records",
      "Order amendment history",
      "Buyer-wise profitability",
    ],
  },
  {
    title: "TnA (Time & Action)",
    slug: "tna-time-action",
    group: "Platform & Reporting",
    accent: "sky",
    icon: "calendar",
    items: [
      "Task/job/order management & monitoring",
      "Task scheduling (front/back calculation)",
      "SMS, email, auto-alarm notification",
      "Export/import data in CSV/Excel",
      "Graphic view of task/job/order status",
      "Critical path analysis",
      "Task splitting at any level",
      "Task dependency specification",
    ],
  },
  {
    title: "Control Panel / Admin",
    slug: "control-panel-admin",
    group: "People & Governance",
    accent: "slate",
    icon: "settings",
    items: [
      "User management",
      "Security & access control",
      "Backup & recovery",
      "Document archiving",
      "Role-based permissions",
      "Micro-level permissions (user, location, sub-company)",
      "Buyer/marketing team-wise price level permission",
    ],
  },
  {
    title: "Reporting & Export",
    slug: "reporting-export",
    group: "Platform & Reporting",
    accent: "amber",
    icon: "activity",
    items: [
      "MIS reporting",
      "Management dashboards",
      "All reports export to Excel & PDF",
      "Order-wise profitability",
      "Style-wise profitability",
      "Production efficiency reports",
    ],
  },
  {
    title: "Subcontract Management",
    slug: "subcontract-management",
    group: "Factory Operations",
    accent: "sky",
    icon: "clipboard",
    items: ["Subcontract tracking"],
  },
  {
    title: "Fixed Assets",
    slug: "fixed-assets",
    group: "Commercial & Finance",
    accent: "slate",
    icon: "package",
    items: ["Fixed asset management"],
  },
] as const satisfies readonly TexonModule[]
