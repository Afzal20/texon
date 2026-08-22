import apiClient from "./client"
import axios from "axios"

/**
 * REST-backed data access helpers (the only generic data layer — the former
 * GraphQL gateway was removed).
 *
 * Same call signatures and return shapes as the old gqlList/gqlGet/gqlCreate/
 * gqlUpdate/gqlDelete helpers, so existing page code
 * (`res.data?.results ?? res.data`) keeps working. List/get hit the generic
 * layer documented in docs/backend/01-rest-api-design.md. Optional `params`
 * are applied as client-side filters on the fetched rows.
 */

export type RestParams = Record<string, unknown>
export type RestRow = Record<string, unknown>
export type RestListResult = { data: RestRow[] & { results?: unknown } }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// (app, model) -> endpoint slug, generated 1:1 from the backend registry
// (core/api.py, get_registry). Never edit by hand.
const SLUGS: Record<string, Record<string, string>> = {
  accounts: {
    AccountsPayable: "accounts-payable",
    AccountsReceivable: "accounts-receivable",
    ChartOfAccount: "chart-of-accounts",
    CostCenter: "cost-centers",
    Expense: "expenses",
    JournalEntry: "journal-entries",
  },
  authentication: {
    // RBAC-guarded management endpoint (backend authentication/api.py).
    User: "users",
  },
  buyers: {
    Buyer: "buyers",
    BuyerPortfolio: "buyer-portfolios",
    BuyerRating: "buyer-ratings",
  },
  commercial: {
    BillOfExchange: "bills-of-exchange",
    Disbursement: "disbursements",
    Invoice: "invoices",
    LetterOfCredit: "letters-of-credit",
    Realization: "realizations",
    SODFCTransfer: "sodfc-transfers",
    Shipment: "shipments",
    SupplierDocument: "supplier-documents",
  },
  compliance: {
    ComplianceRecord: "compliance-records",
  },
  core: {
    Currency: "currencies",
    Location: "locations",
  },
  costing: {
    CostSheet: "cost-sheets",
    PreCosting: "pre-costings",
  },
  crm: {
    BuyerCommunication: "buyer-communications",
    BuyerProfitability: "buyer-profitabilities",
    OrderAmendmentHistory: "order-amendment-histories",
  },
  fixed_assets: {
    AssetCategory: "asset-categories",
    DepreciationSchedule: "depreciation-schedules",
    FixedAsset: "fixed-assets",
  },
  hr: {
    Attendance: "attendance-records",
    Bonus: "bonuses",
    Department: "departments",
    Designation: "designations",
    Employee: "employees",
    Leave: "leaves",
    Overtime: "overtime-records",
    SalarySheet: "salary-sheets",
  },
  ie_planning: {
    CapacityBooking: "capacity-bookings",
    LinePlan: "line-plans",
    ProductionPlan: "production-plans",
    RiskAssessment: "risk-assessments",
    StyleAnalysis: "style-analyses",
  },
  inventory: {
    Accessory: "accessories",
    Fabric: "fabrics",
    PhysicalInventory: "physical-inventories",
    ShadeApproval: "shade-approvals",
    StockMovement: "stock-movements",
    Trim: "trims",
    Warehouse: "warehouses",
  },
  merchandising: {
    BudgetDemandAssessment: "budget-demand-assessments",
    BuyerEnquiry: "buyer-enquiries",
    DevelopmentMonitoring: "development-monitoring",
    IeSuggestion: "ie-suggestions",
    OrderItem: "order-items",
    OrderStageLog: "order-stage-logs",
    ProcessWiseTarget: "process-wise-targets",
    ProductionDowntime: "production-downtimes",
    PurchaseOrder: "purchase-orders",
    SMVRecord: "smv-records",
    SampleOrder: "sample-orders",
    Season: "seasons",
    SkillInventory: "skill-inventory",
    Style: "styles",
  },
  multi_company: {
    GroupCompany: "group-companies",
    LocationBasedOperation: "location-based-operations",
    MultiCompany: "multi-companies",
  },
  orders: {
    Order: "orders",
  },
  performance: {
    PerformanceRecord: "performance-records",
  },
  planning: {
    Plan: "plans",
  },
  procurement: {
    QuotationAnalysis: "quotation-analyses",
    RawMaterialBooking: "raw-material-bookings",
    RawMaterialRequisition: "raw-material-requisitions",
    Supplier: "suppliers",
  },
  production: {
    BottleneckAlert: "bottleneck-alerts",
    CuttingRecord: "cutting-records",
    DefectLog: "defect-logs",
    FloorRequisition: "floor-requisitions",
    HeatmapData: "heatmap-data",
    InspectionPacking: "inspection-packings",
    LineCapacity: "line-capacities",
    OEELog: "oee-logs",
    ProductionLine: "production-lines",
    ProductionOrder: "production-orders",
    ProductionRecord: "production-records",
    ProductionShift: "production-shifts",
    ProductionUnit: "production-units",
    SewingRecord: "sewing-records",
  },
  quality: {
    DefectCategory: "defect-categories",
    EndLineQC: "end-line-qcs",
    FabricInspection: "fabric-inspections",
    FinalInspection: "final-inspections",
    InlineQC: "inline-qcs",
    RejectionReport: "rejection-reports",
  },
  rbac: {
    Permission: "permissions",
    Role: "roles",
  },
  reporting: {
    Dashboard: "dashboards",
    Report: "reports",
  },
  scheduling: {
    Schedule: "schedules",
  },
  subcontract: {
    SubcontractOrder: "subcontract-orders",
    SubcontractTracking: "subcontract-trackings",
  },
  tna: {
    AlarmNotification: "alarm-notifications",
    JobOrder: "job-orders",
    Task: "tasks",
    Timeline: "timelines",
  },
}

export function restSlug(app: string, model: string): string {
  const slug = SLUGS[app]?.[model]
  if (!slug) throw new Error(`No REST endpoint for ${app}.${model}`)
  return slug
}

function toSnake(value: string): string {
  return value.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
}

function filterRows(rows: RestRow[], params?: RestParams): RestRow[] {
  if (!params) return rows
  return rows.filter((row) =>
    Object.entries(params).every(([k, v]) => row[k] === undefined || row[k] === v || String(row[k]) === String(v)),
  )
}

async function requestJson<T>(path: string, token?: string, method?: string, body?: unknown): Promise<T> {
  if (token) {
    const res = await axios.request({
      url: `${API_BASE_URL}${path}`,
      method: method ?? "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      data: body,
    })
    return res.data as T
  }
  const res = await apiClient.request({ url: path, method: method ?? "GET", data: body })
  return res.data as T
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { status?: number } }).response?.status === "number" &&
    (err as { response: { status: number } }).response.status === 404
  )
}

export async function restList(app: string, model: string, params?: RestParams, token?: string): Promise<RestListResult> {
  const slug = restSlug(app, model)
  const rows: RestRow[] = []
  let next: string | null = `/api/v1/${slug}/?page_size=100`
  while (next) {
    const data: { next?: string | null; results?: RestRow[] } = await requestJson<{
      next?: string | null
      results?: RestRow[]
    }>(next, token)
    rows.push(...((data.results ?? []) as RestRow[]))
    next = data.next ? String(data.next).replace(API_BASE_URL, "") : null
  }
  return { data: filterRows(rows, params) }
}

export async function restGet(app: string, model: string, id: number | string, token?: string): Promise<{ data: RestRow | null }> {
  const slug = restSlug(app, model)
  try {
    const data = await requestJson<RestRow>(`/api/v1/${slug}/${id}/`, token)
    return { data }
  } catch (err) {
    if (isNotFound(err)) return { data: null }
    throw err
  }
}

function writeParams(data: RestParams): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    out[toSnake(key)] = value
  }
  return out
}

export async function restCreate(app: string, model: string, data: RestParams, token?: string): Promise<{ data: RestRow }> {
  const slug = restSlug(app, model)
  const res = await requestJson<RestRow>(`/api/v1/${slug}/`, token, "POST", writeParams(data))
  return { data: res }
}

export async function restUpdate(app: string, model: string, id: number | string, data: RestParams, token?: string): Promise<{ data: RestRow }> {
  const slug = restSlug(app, model)
  const res = await requestJson<RestRow>(`/api/v1/${slug}/${id}/`, token, "PATCH", writeParams(data))
  return { data: res }
}

export async function restDelete(app: string, model: string, id: number | string, token?: string): Promise<{ data: { success: boolean } }> {
  const slug = restSlug(app, model)
  await requestJson(`/api/v1/${slug}/${id}/`, token, "DELETE")
  return { data: { success: true } }
}

// ── All-models registry + full fetch (REST data explorer support) ───────────

export interface ModelEntry {
  app: string
  model: string
  slug: string
}

/** app label -> model name -> rows (same shape the Data Explorer expects). */
export type AllData = Record<string, Record<string, RestRow[]>>

export const ALL_MODELS: ModelEntry[] = Object.entries(SLUGS).flatMap(([app, models]) =>
  Object.entries(models).map(([model, slug]) => ({ app, model, slug })),
)

/** Fetch every registered model's list data via the generic REST endpoints. */
export async function fetchAllData(token?: string): Promise<AllData> {
  const entries = Object.entries(SLUGS) as [string, Record<string, string>][]
  const results: [string, string, RestRow[] | null][] = []

  const CONCURRENCY = 6
  let cursor = 0

  async function worker() {
    while (cursor < entries.length) {
      const current = entries[cursor++]
      if (!current) return
      const [app, models] = current
      for (const model of Object.keys(models)) {
        try {
          const res = await restList(app, model, undefined, token)
          results.push([app, model, res.data as RestRow[]])
        } catch {
          // Endpoint may be forbidden/absent for this user — surface empty.
          results.push([app, model, []])
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker))

  const data: AllData = {}
  for (const [app, model, rows] of results) {
    ;(data[app] ??= {})[model] = rows ?? []
  }
  return data
}