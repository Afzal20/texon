# Texon UI — Backend Data Integration Plan

## Overview

Replace static/mock data with real API calls across ~19 module pages. The API client layer already exists in `lib/api/` (23 files) and `lib/data/` (12 action+types files). Pages need to be wired up to them.

---

## A. Workspace-Based Modules (13) — replace hardcoded `configData`

All these modules use a config-driven workspace component with static `metrics`, `rows`, `progress`, and `notices`. Replace with `useEffect` fetching from `lib/api/*`.

| # | Module | App Path | API File | Key Endpoints |
|---|--------|----------|----------|---------------|
| 1 | Merchandising | `app/merchandising/` | `lib/api/merchandising.ts` | buyers, buyer-enquiries, styles, SMV, budget-demand, IE suggestions, skill-inventory, downtimes, targets |
| 2 | IE & Planning | `app/ie-planning/` | `lib/api/merchandising.ts`, `lib/api/production.ts` | IE suggestions, targets, capacity-bookings, line-plans, plans |
| 3 | Commercial Mgmt | `app/commercial-management/` | `lib/api/commercial.ts` | invoices, LCs, bills-of-exchange, expenses |
| 4 | CRM | `app/crm/` | `lib/api/crm.ts` | buyers, communications, portfolios, amendments, profitabilities, ratings |
| 5 | HR | `app/hr/` | `lib/api/hr.ts` | attendance, bonuses, departments, designations, employees, leaves, overtime, salary-sheets |
| 6 | Inventory | `app/inventory/` | `lib/api/inventory.ts` | accessories, fabrics, inspections, requisitions, stock-movements, trims, warehouses |
| 7 | Quality Control | `app/quality-control/` | `lib/api/quality.ts` | defect-categories, endline/inline QC, final-inspections, rejection-reports |
| 8 | Procurement | `app/procurement/` | `lib/api/procurement.ts` | purchase-orders, quotation-analyses, suppliers |
| 9 | Production | `app/production/` | `lib/api/production.ts` | cutting-records, job-orders, line-plans, production-lines/orders/plans, sewing-records, development-monitoring |
| 10 | TnA | `app/tna/` | *(no dedicated TnA API yet)* | needs backend endpoints |
| 11 | Reporting | `app/reporting/` | `lib/api/reports.ts` | reports |
| 12 | Multi-Company | `app/multi-company/` | `lib/api/core.ts` | companies, group-companies, location-operations |
| 13 | Subcontract | `app/subcontract/` | `lib/api/subcontract.ts` | subcontract endpoints |
| 14 | Fixed Assets | `app/fixed-assets/` | `lib/api/fixed-assets.ts` | asset-categories, depreciation-schedules, fixed-assets |
| 15 | Admin | `app/admin/` | `lib/api/core.ts` | companies, users *(may need new admin endpoints)* |

## B. Standalone Pages with Static Demo Data (4)

| # | Module | App Path | API File | Notes |
|---|--------|----------|----------|-------|
| 16 | Costing | `app/costing/` | `lib/api/costing.ts` | BOM table, cost summary — replace with cost-sheets, pre-costings, SMV |
| 17 | Planning | `app/planning/` | `lib/api/production.ts` | Gantt chart — replace with plans, production-plans, line-plans |
| 18 | AI Insights | `app/ai-insights/` | `lib/api/ai.ts` | Insight cards — replace with AI conversations data |

## C. Already Connected to Backend (no changes needed)

- **Dashboard** (`app/page.tsx`) — fetches from `production-actions`
- **Buyers** (`app/buyers/`) — full CRUD via server actions
- **Orders** (`app/orders/`) — fetches from `order-actions`
- **Performance** (`app/performance/`) — fetches from `production-actions`
- **Compliance** (`app/compliance/`) — fetches from `compliance-actions`
- **Scheduling** (`app/scheduling/`) — fetches from `hr-actions`
- **Accounts & Finance** (`app/accounts-finance/`) — fetches from `commercial` API
- **Security** (`app/security/`) — static auth UI
- **Settings** (`app/settings/`) — static profile UI

## D. Integration Approaches

### Approach 1 — Basic (quick wins)
Replace static KPI/metric values on each page with real API calls. Table data stays hardcoded.

### Approach 2 — Workspace Data (recommended)
Wire up workspace table rows, KPI cards, and progress bars to API endpoints. Follow existing patterns in `performance/`, `compliance/`, `scheduling/`.

**Pattern:**
```
"use client"
useState for data
useEffect → fetch from lib/api/* → setState
```

### Approach 3 — Full CRUD (most complete)
Server actions + Zod schemas + react-table dialogs (Buyers-level). Use for modules needing create/edit/delete (HR, Inventory, Merchandising).
