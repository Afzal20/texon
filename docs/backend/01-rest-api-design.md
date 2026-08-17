# REST API Design & Implementation Plan

Status: **Approved — to implement** | Updated: 2026-08-17

## 1. Scope & conventions

- **Base path:** `api/v1/` — flat per-model endpoints: `GET/POST /api/v1/<slug>/`, `GET/PUT/PATCH/DELETE /api/v1/<slug>/<id>/`
- **Slug rule:** kebab-case plural of model name (`ChartOfAccount` → `chart-of-accounts`), matching the existing `accounts` app naming and the frontend `all_endpoints.txt` spec
- **Envelope:** DRF standard `{ count, next, previous, results }` — the frontend already unwraps `results`
- **Query params (all list endpoints):** `?page=&page_size=` (20 default, max 100), `?ordering=`, `?search=` (char fields), per-field filters on allowlisted fields
- **Auth:** `Authorization: Bearer <JWT>` (existing SimpleJWT, 15 min access / 7 day refresh, rotation + blacklist)
- **Docs:** auto-generated OpenAPI at `/api/schema/` + `/swagger-ui/` (drf-spectacular, already wired)

## 2. Endpoint list (103 model endpoints + infra)

| # | Endpoint slug | Model | # | Endpoint slug | Model |
|---|---|---|---|---|---|
| 1 | `chart-of-accounts` | accounts.ChartOfAccount | 2 | `journal-entries` | accounts.JournalEntry |
| 3 | `accounts-payable` | accounts.AccountsPayable | 4 | `accounts-receivable` | accounts.AccountsReceivable |
| 5 | `expenses` | accounts.Expense | 6 | `cost-centers` | accounts.CostCenter |
| 7 | `buyers` | buyers.Buyer | 8 | `buyer-ratings` | buyers.BuyerRating |
| 9 | `buyer-portfolios` | buyers.BuyerPortfolio | 10 | `shipments` | commercial.Shipment |
| 11 | `letters-of-credit` | commercial.LetterOfCredit | 12 | `invoices` | commercial.Invoice |
| 13 | `bills-of-exchange` | commercial.BillOfExchange | 14 | `supplier-documents` | commercial.SupplierDocument |
| 15 | `realizations` | commercial.Realization | 16 | `sodfc-transfers` | commercial.SODFCTransfer |
| 17 | `disbursements` | commercial.Disbursement | 18 | `compliance-records` | compliance.ComplianceRecord |
| 19 | `locations` (read-only) | core.Location | 20 | `currencies` (read-only) | core.Currency |
| 21 | `pre-costings` | costing.PreCosting | 22 | `cost-sheets` | costing.CostSheet |
| 23 | `buyer-communications` | crm.BuyerCommunication | 24 | `buyer-profitabilities` | crm.BuyerProfitability |
| 25 | `order-amendment-histories` | crm.OrderAmendmentHistory | 26 | `asset-categories` | fixed_assets.AssetCategory |
| 27 | `fixed-assets` | fixed_assets.FixedAsset | 28 | `depreciation-schedules` | fixed_assets.DepreciationSchedule |
| 29 | `departments` | hr.Department | 30 | `designations` | hr.Designation |
| 31 | `employees` | hr.Employee | 32 | `attendance-records` | hr.Attendance |
| 33 | `leaves` | hr.Leave | 34 | `overtime-records` | hr.Overtime |
| 35 | `salary-sheets` | hr.SalarySheet | 36 | `bonuses` | hr.Bonus |
| 37 | `capacity-bookings` | ie_planning.CapacityBooking | 38 | `line-plans` | ie_planning.LinePlan |
| 39 | `production-plans` | ie_planning.ProductionPlan | 40 | `risk-assessments` | ie_planning.RiskAssessment |
| 41 | `style-analyses` | ie_planning.StyleAnalysis | 42 | `warehouses` | inventory.Warehouse |
| 43 | `fabrics` | inventory.Fabric | 44 | `accessories` | inventory.Accessory |
| 45 | `trims` | inventory.Trim | 46 | `stock-movements` | inventory.StockMovement |
| 47 | `shade-approvals` | inventory.ShadeApproval | 48 | `physical-inventories` | inventory.PhysicalInventory |
| 49 | `seasons` | merchandising.Season | 50 | `styles` | merchandising.Style |
| 51 | `buyer-enquiries` | merchandising.BuyerEnquiry | 52 | `purchase-orders` | merchandising.PurchaseOrder |
| 53 | `order-items` | merchandising.OrderItem | 54 | `order-stage-logs` | merchandising.OrderStageLog |
| 55 | `sample-orders` | merchandising.SampleOrder | 56 | `smv-records` | merchandising.SMVRecord |
| 57 | `development-monitoring` | merchandising.DevelopmentMonitoring | 58 | `budget-demand-assessments` | merchandising.BudgetDemandAssessment |
| 59 | `ie-suggestions` | merchandising.IeSuggestion | 60 | `skill-inventory` | merchandising.SkillInventory |
| 61 | `production-downtimes` | merchandising.ProductionDowntime | 62 | `process-wise-targets` | merchandising.ProcessWiseTarget |
| 63 | `group-companies` | multi_company.GroupCompany | 64 | `multi-companies` | multi_company.MultiCompany |
| 65 | `location-based-operations` | multi_company.LocationBasedOperation | 66 | `orders` | orders.Order |
| 67 | `performance-records` | performance.PerformanceRecord | 68 | `plans` | planning.Plan |
| 69 | `suppliers` | procurement.Supplier | 70 | `raw-material-requisitions` | procurement.RawMaterialRequisition |
| 71 | `raw-material-bookings` | procurement.RawMaterialBooking | 72 | `quotation-analyses` | procurement.QuotationAnalysis |
| 73 | `production-units` | production.ProductionUnit | 74 | `production-lines` | production.ProductionLine |
| 75 | `production-orders` | production.ProductionOrder | 76 | `cutting-records` | production.CuttingRecord |
| 77 | `sewing-records` | production.SewingRecord | 78 | `inspection-packings` | production.InspectionPacking |
| 79 | `floor-requisitions` | production.FloorRequisition | 80 | `line-capacities` | production.LineCapacity |
| 81 | `production-shifts` | production.ProductionShift | 82 | `production-records` | production.ProductionRecord |
| 83 | `oee-logs` | production.OEELog | 84 | `defect-logs` | production.DefectLog |
| 85 | `heatmap-data` | production.HeatmapData | 86 | `bottleneck-alerts` | production.BottleneckAlert |
| 87 | `defect-categories` | quality.DefectCategory | 88 | `fabric-inspections` | quality.FabricInspection |
| 89 | `inline-qcs` | quality.InlineQC | 90 | `end-line-qcs` | quality.EndLineQC |
| 91 | `rejection-reports` | quality.RejectionReport | 92 | `final-inspections` | quality.FinalInspection |
| 93 | `permissions` | rbac.Permission | 94 | `roles` | rbac.Role |
| 95 | `reports` | reporting.Report | 96 | `dashboards` | reporting.Dashboard |
| 97 | `schedules` | scheduling.Schedule | 98 | `subcontract-orders` | subcontract.SubcontractOrder |
| 99 | `subcontract-trackings` | subcontract.SubcontractTracking | 100 | `tasks` | tna.Task |
| 101 | `job-orders` | tna.JobOrder | 102 | `timelines` | tna.Timeline |
| 103 | `alarm-notifications` | tna.AlarmNotification | | | |

**Excluded (internal, never exposed):** `authentication.OTP`, `authentication.SocialAuthCallbackUrl`, `rbac.RolePermission`, `rbac.UserRole` (join tables).

**Read-only:** `locations`, `currencies` (reference data).

**Keep as-is:** all `/api/v1/auth/*`, `/api/users/api/token/*`, `/api/schema/`, `/swagger-ui/`.

**Unification:** the existing `accounts` app router is removed — its 6 models move into the generic layer (same slugs, richer filters, one source of truth).

## 3. Security (mandatory)

1. **Authentication:** JWT Bearer only (existing 15-min access / 7-day rotated refresh with blacklist). API views restrict to `JWTAuthentication` — no cookie/session auth on API paths (CSRF-proof by design).
2. **Authorization:** `DjangoModelPermissions` on every viewset (per-model `view/add/change/delete`; superuser bypasses). Custom RBAC `Permission.codename`s can map onto Django permissions later — the `rbac.permissions.get_user_permissions` helper already exists.
3. **Throttling:** anonymous + per-user rate limits on all list endpoints; stricter throttle on token endpoints (login brute-force).
4. **Pagination caps** (max 100/page) → payload-size DoS protection.
5. **Filter/search allowlisting** — only scalar/model fields declared in `filterset_fields`/`search_fields`; no arbitrary lookups.
6. **Serializer validation** for all writes (unique/type/choice checks); read-only fields (`id`, `created_at`, `updated_at`, FK name mirrors).
7. **No secrets/relations leak:** `authentication` models never exposed; FK serialization is `id` + read-only `<field>_name` mirror only; no password/auth data.
8. **Consistent errors** (`{"detail": ...}`), no stack traces; CORS locked to `:3000` (already configured).
9. **HTTPS + `DEBUG=False`** in production (env-gated).

## 4. Time complexity

- **Detail:** O(log n) PK lookup — 1 query.
- **List:** fixed 3 queries regardless of table size: filter (indexed → O(log n)), `count()` (O(log n) with index), page fetch of ≤100 rows (O(p)).
- **Search (`icontains`):** O(n) scan — acceptable at current data sizes; follow-up migration adds `db_index` on hot filter fields (`status`, `is_active`, `order_number`, `invoice_number`, date ranges) and a note for pg_trgm if needed.
- **No N+1:** factory builds `select_related` for every direct FK; 0 per-row queries.
- **Writes:** O(log n) for unique-constraint checks, O(1) insert/update.
- **Frontend impact:** pages fetch only what they render (page_size 20–100), same response shape as today.

## 5. System design

- **One generic factory** (`backend/core/api.py`) introspects models at import: builds a `ModelSerializer` (all scalar fields + FK name mirrors + choice display labels) and a `ModelViewSet` (queryset with `select_related`, `DjangoModelPermissions`, allowlisted `filterset_fields`/`search_fields`/`ordering_fields`). Mirrors the GraphQL registry pattern — one implementation for 103 models, zero per-model files.
- **One router** (`backend/core/urls.py`) registers every model from installed apps; `config/urls.py` mounts it at `api/v1/` (accounts app include removed, auth unchanged).
- **Slug uniqueness verified** — zero collisions across all 25 apps.
- **Frontend:** regenerate `lib/api/*.ts` (481 exports) via `scripts/gen_rest.py` — identical export names/signatures/return shapes, now backed by `lib/api/rest.ts` (axios + JWT auto-refresh, server-token support). **Zero page changes.** The script also rewrites `lib/data/*-actions.ts` ("use server" actions) from `gql*` to `rest*`.
- **GraphQL gateway stays** (previous decision); REST becomes the primary transport. Direct `gqlList` calls remain only where REST intentionally has no endpoint — `authentication.User`, `authentication.OTP`, `authentication.SocialAuthCallbackUrl`, `rbac.RolePermission`, `rbac.UserRole` (admin/security/settings pages).

## 6. Implementation steps

1. `backend/core/api.py` — serializer/viewset factory + model registry with skip-list and read-only set
2. `backend/core/urls.py` — router registration; update `config/urls.py`
3. Restart backend; curl smoke matrix (auth → list/detail/filter/search/ordering/pagination/403/401), verify Swagger schema
4. `scripts/gen_rest.py` regenerates `lib/api/*.ts` + `lib/data/*-actions.ts`; keep `lib/api/graphql.ts` for admin/settings pages (models excluded from REST)
5. Verify: `npx tsc --noEmit`, `npx eslint`, `npm run build`, browser spot-check (dashboard/orders/admin/crm); server-action RPC smoke (action ids from `server-reference-manifest.json`, POST `Next-Action`)

## 7. Existing infrastructure (verified)

- DRF + SimpleJWT + `django-filters` + drf-spectacular installed and configured (`config/settings.py`)
- `StandardResultsPagination` (page_size 20, `page_size` query param, max 100) — `core/pagination.py`
- `DjangoModelPermissions` template already in use by `accounts` app (6 working viewsets)
- CORS: `http://localhost:3000,http://127.0.0.1:3000`
- ~108 models across 25 apps; zero slug collisions
