import {
  Shirt, Ruler, FileText, Truck, Factory, Package, Eye,
  Users, DollarSign, Contact, Clock, Lock, BarChart, Globe,
  Layers, Building2, ShoppingBag, BrainCircuit, FileCheck2
} from "lucide-react"

export interface NavPage {
  title: string
  slug: string
  url: string
}

export interface NavCategory {
  title: string
  categorySlug: string
  group: string
  icon: React.ComponentType<{ className?: string }>
  pages: NavPage[]
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function makePages(titles: string[], catSlug: string): NavPage[] {
  const seen: Record<string, number> = {}
  return titles.map((t) => {
    let slug = slugify(t)
    if (seen[slug]) {
      seen[slug]++
      slug = `${slug}-${seen[slug]}`
    } else {
      seen[slug] = 1
    }
    return { title: t, slug, url: `/${catSlug}/${slug}` }
  })
}

export const categories: NavCategory[] = [
  {
    title: "Merchandising",
    categorySlug: "merchandising",
    group: "Factory Operations",
    icon: Shirt,
    pages: makePages([
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
    ], "merchandising"),
  },
  {
    title: "IE & Planning",
    categorySlug: "ie-planning",
    group: "Factory Operations",
    icon: Ruler,
    pages: makePages([
      "Capacity & booking allocation",
      "Process-wise production planning",
      "Risk assessment",
      "PO-wise TnA (Time & Action)",
      "Production order issue",
      "Production dashboard",
      "Style analysis",
      "Ladder planning",
      "Line planning (loading & unloading)",
    ], "ie-planning"),
  },
  {
    title: "Commercial Management",
    categorySlug: "commercial-management",
    group: "Commercial & Finance",
    icon: FileText,
    pages: makePages([
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
    ], "commercial-management"),
  },
  {
    title: "Procurement, Sourcing & Supply",
    categorySlug: "procurement",
    group: "Factory Operations",
    icon: Truck,
    pages: makePages([
      "Raw materials booking",
      "Knitting & dyeing program",
      "Raw materials requisition",
      "Procurement management",
      "Stock loan management",
      "Quotation vs actual analysis",
      "Supplier selection (price, quality, delivery, grade)",
    ], "procurement"),
  },
  {
    title: "Production",
    categorySlug: "production",
    group: "Factory Operations",
    icon: Factory,
    pages: makePages([
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
    ], "production"),
  },
  {
    title: "Inventory / Store",
    categorySlug: "inventory",
    group: "Factory Operations",
    icon: Package,
    pages: makePages([
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
    ], "inventory"),
  },
  {
    title: "Quality Control",
    categorySlug: "quality-control",
    group: "Factory Operations",
    icon: Eye,
    pages: makePages([
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
    ], "quality-control"),
  },
  {
    title: "HR, Attendance & Payroll",
    categorySlug: "hr",
    group: "People & Governance",
    icon: Users,
    pages: makePages([
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
    ], "hr"),
  },
  {
    title: "Accounts & Finance",
    categorySlug: "accounts-finance",
    group: "Commercial & Finance",
    icon: DollarSign,
    pages: makePages([
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
    ], "accounts-finance"),
  },
  {
    title: "CRM",
    categorySlug: "crm",
    group: "Commercial & Finance",
    icon: Contact,
    pages: makePages([
      "Buyer profile",
      "Buyer communication records",
      "Order amendment history",
      "Buyer-wise profitability",
    ], "crm"),
  },
  {
    title: "Buyers",
    categorySlug: "buyers",
    group: "Commercial & Finance",
    icon: ShoppingBag,
    pages: [{ title: "Buyer management", slug: "buyer-management", url: "/buyers" }],
  },
  {
    title: "TnA (Time & Action)",
    categorySlug: "tna",
    group: "Platform & Reporting",
    icon: Clock,
    pages: makePages([
      "Task/job/order management & monitoring",
      "Task scheduling (front/back calculation)",
      "SMS, email, auto-alarm notification",
      "Export/import data in CSV/Excel",
      "Graphic view of task/job/order status",
      "Critical path analysis",
      "Task splitting at any level",
      "Task dependency specification",
    ], "tna"),
  },
  {
    title: "AI Insights",
    categorySlug: "ai-insights",
    group: "Platform & Reporting",
    icon: BrainCircuit,
    pages: [{ title: "AI Analytics & Intelligence", slug: "ai-analytics", url: "/ai-insights" }],
  },
  {
    title: "Module Map",
    categorySlug: "modules",
    group: "Platform & Reporting",
    icon: FileCheck2,
    pages: [{ title: "System Module Map", slug: "module-map", url: "/modules" }],
  },
  {
    title: "Control Panel / Admin",
    categorySlug: "admin",
    group: "People & Governance",
    icon: Lock,
    pages: makePages([
      "User management",
      "Security & access control",
      "Backup & recovery",
      "Document archiving",
      "Role-based permissions",
      "Micro-level permissions (user, location, sub-company)",
      "Buyer/marketing team-wise price level permission",
    ], "admin"),
  },
  {
    title: "Reporting & Export",
    categorySlug: "reporting",
    group: "Platform & Reporting",
    icon: BarChart,
    pages: makePages([
      "MIS reporting",
      "Management dashboards",
      "All reports export to Excel & PDF",
      "Order-wise profitability",
      "Style-wise profitability",
      "Production efficiency reports",
    ], "reporting"),
  },
  {
    title: "Multi-Company / Multi-Location",
    categorySlug: "multi-company",
    group: "Platform & Reporting",
    icon: Globe,
    pages: makePages([
      "Group-company & multi-company",
      "Multi-currency support",
      "Location-based operations",
      "Inter-modules integrated system",
    ], "multi-company"),
  },
  {
    title: "Subcontract Management",
    categorySlug: "subcontract",
    group: "Factory Operations",
    icon: Layers,
    pages: makePages([
      "Subcontract tracking",
    ], "subcontract"),
  },
  {
    title: "Fixed Assets",
    categorySlug: "fixed-assets",
    group: "Commercial & Finance",
    icon: Building2,
    pages: makePages([
      "Fixed asset management",
    ], "fixed-assets"),
  },
]

export function getGroupedCategories() {
  const groups: Record<string, NavCategory[]> = {}
  for (const cat of categories) {
    if (!groups[cat.group]) groups[cat.group] = []
    groups[cat.group].push(cat)
  }
  return groups
}
