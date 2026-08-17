# Frontend Design & UI/UX Error Audit

Audited: **2026-08-17** | Scope: `frontend/texon-ui` (all 374 source files) | Method: static analysis of all `page.tsx` files, workspace/detail/form components, layout & design system + global pattern scans

## 0. Headline numbers

| Metric | Count |
|---|---|
| Broken module-card links (relative hrefs, no `basePath` in `next.config.ts`) | **129** |
| Raw Tailwind palette color classes (`text-emerald-500`, `bg-rose-50`, …) bypassing design tokens | **842** |
| Raw hex colors (`bg-[#5c4bdf]`, `stroke="#4f46e5"`) | 2 |
| Ad-hoc `text-[10px]` / `text-[11px]` sizes | **30** |
| `<button>` without `type` attribute | 48 |
| Files with toast-only "coming soon" / fake-action buttons | **17+** |
| Workspaces where every status pill renders amber (`noticeClass` fallback) | **12** |
| Hardcoded `"Showing 4 of 24 records"` footers | **11** |
| Pages with no data source that still claim "Live — API Connected" | **7+** |
| `RawItemsViewer` dev JSON dumps rendered in production UI | **10+** |
| Tables with header/data column mismatch | **15+** |
| Index pages with declared-but-unused `pages` array (hand-duplicated cards) | **15** |
| Usage of the shipped `Empty` component (`components/ui/empty.tsx`) | **0** |

---

## 1. Broken navigation (HIGH — all module hubs 404)

**Root cause:** `next.config.ts` has no `basePath`/`trailingSlash`, yet every module index page links with relative hrefs (`href="merchandising/style-management"`). Served at `/merchandising`, browsers resolve to `/merchandising/merchandising/style-management` → 404.

- `app/hr/page.tsx:36-136` — 11 cards `href="hr/employee-profile"` etc.
- `app/tna/page.tsx` — 8 cards
- `app/ie-planning/page.tsx` — 9 cards
- `app/merchandising/page.tsx:42-211` — 17 cards
- `app/production/page.tsx:45,55,…`, `app/inventory/page.tsx:42`, `app/quality-control/page.tsx:35`
- `app/crm/page.tsx:29,39,49,59`, `app/multi-company/page.tsx:29-59`, `app/reporting/page.tsx:31-81`, `app/commercial-management/page.tsx:39+`, `app/procurement/page.tsx:32+`, `app/fixed-assets/page.tsx:26`, `app/subcontract/page.tsx:26`

**FIX:** Absolute paths (`/merchandising/style-management`) via `next/link`.

---

## 2. Dead / non-functional UI (HIGH)

Every workspace header exports the same broken control set. Export fakes a **success** toast for an action that never runs; the primary action ("Add employee", "Log order"…) opens nothing; Filter/Search do nothing; "View all"/"Open task center" only toast.

- `app/hr/hr-workspace.tsx:397-398,425,453,479`; `app/tna/tna-workspace.tsx:304-305,332,360,386`; `app/ie-planning/ie-planning-workspace.tsx:337-338,365,393,419`
- `app/production/production-workspace.tsx:718-719,746,750,774,800`; `app/quality-control/quality-control-workspace.tsx:412-413,440,444,468,494`; `app/inventory/inventory-workspace.tsx:627-628,655,659,683,709`
- `app/merchandising/merchandising-workspace.tsx:663-668,751`
- `app/commercial-management/commercial-management-workspace.tsx:504-505,532,536,560,586`; `app/accounts-finance/finance-workspace.tsx:386-387,414,418,442,468`; `app/crm/crm-workspace.tsx:182-183,210,214,238,264`; `app/multi-company/multi-company-workspace.tsx:177-178,205,209,233,259`; `app/procurement/procurement-workspace.tsx:322-323,350,354,378,404`; `app/reporting/reporting-workspace.tsx:241-242,269,273,297,323`; `app/subcontract/subcontract-workspace.tsx:129-130,141,145,152,161`
- `app/scheduling/page.tsx:66-69` (toast-only), **`:212-214` "Auto-Assign Remaining" has no `onClick` at all**
- `app/orders/page.tsx:141-143` — "All Stages ▾ / All Buyers ▾ / Priority ⏷" dropdown-lookalikes with no handler
- `app/performance/page.tsx:64-66` — "Today / This Week / Custom" segmented control, only "Today" is functional
- `app/planning/page.tsx:163-178` — Filter ("coming soon"), zoom buttons (toast only), always-on "Conflict Detected" badge from static data
- `app/accounts-finance/page.tsx:51,79` — task rows / CTAs toast-only
- `app/hr/payroll-approval/page.tsx:30` — `gross`/`deductions`/`totalNet` are global sums repeated in **every row**
- `app/orders/page.tsx:164-165` — `stageIdx`/`stage` computed but never used (dead pipeline color logic); `app/planning/page.tsx:135-142` — fetched `plans` never rendered
- `app/production/production-workspace.tsx:760-768` (and all workspaces) — search `Input` has no `value`/`onChange`; typing does nothing

**FIX:** Wire to real actions, or render disabled; never show success for an unperformed action; bind search state to row filtering.

---

## 3. Status & data-semantics broken (HIGH)

### 3a. All status pills render amber
`noticeClass()` (in every workspace) only special-cases the literal strings `"emerald"`/`"rose"`; every real status ("Approved", "Active", "Complete", "Critical", "Overdue", "Rejected") falls through to amber — success and danger are visually identical.

- `app/hr/hr-workspace.tsx:374,443` · `app/tna/tna-workspace.tsx:281,350` · `app/ie-planning/ie-planning-workspace.tsx:314,383`
- `app/production/production-workspace.tsx:647-649,764` · `app/quality-control/quality-control-workspace.tsx:341-343,458` · `app/inventory/inventory-workspace.tsx:556-558,673`
- `app/merchandising/merchandising-workspace.tsx:563-565`
- `app/commercial-management/commercial-management-workspace.tsx:467,550` · `app/crm/crm-workspace.tsx:158-159,228` · `app/multi-company/multi-company-workspace.tsx:155-156,223` · `app/procurement/procurement-workspace.tsx:251-252,368` · `app/reporting/reporting-workspace.tsx:219-220,287` · `app/subcontract/subcontract-workspace.tsx:128`
- Worst case: `app/inventory/inventory-workspace.tsx:479-483` — "Critical" alerts show the same yellow pill as "Warning".

**FIX:** Status value → semantic tone map (success/warning/danger/neutral). `finance-workspace.tsx:356-360` is the reference implementation.

### 3b. `statusIndex` renders non-status data as pills
Numeric/date columns flagged as "status" get pill treatment: `app/hr/hr-workspace.tsx:273` (column 6 = "Net" → `$252K` pill); `app/hr/attendance` ("Rate" 94.3% → pill); `app/ie-planning/ie-planning-workspace.tsx:271` ("Cum. actual" → pill), `:241` ("Accuracy" → pill); `app/inventory/inventory-workspace.tsx:507-513` ("Variance" +0.2% → pill); `app/tna/task-dependency-specification/page.tsx:17` & `task-splitting-at-any-level/page.tsx:17` (`statusIndex:5` lands on `due_date`).

### 3c. Header/data column mismatches
- `app/tna/task-scheduling-front-back-calculation/page.tsx:20` — 5 cells under 6 headers; `app/tna/sms-email-auto-alarm-notification/page.tsx:20` — same
- `app/tna/critical-path-analysis/page.tsx:17` — every column shifted by one
- `app/merchandising/capacity-booking-allocation/page.tsx:36-44` — "Buyer" shows style name, "Allocated" shows booking date; `smv-calculation/page.tsx:32-40` — "Method" shows person, "Machine" shows date; `line-layout/page.tsx:29-37` — 4 of 6 columns mislabeled/empty; `sample-monitoring-fit-pp/page.tsx:40-48`; `skill-inventory/page.tsx:35-43`; `production-efficiency-tracking/page.tsx:35-43`; `rm-collection-consumption-sourcing/page.tsx:41-49`
- `app/commercial-management/import-management/page.tsx:61-66` (LC # duplicated), `export-management/page.tsx:45-50` (weight in "Value"), `shipment-monitoring-eta-updates/page.tsx:37-42` (port in "Type"), `btb-lc-opening-amendment/page.tsx:32-38`, `acceptance-clearance/page.tsx:33-38` (buyer in "Supplier")
- `app/tna/graphic-view-of-task-job-order-status/page.tsx:20` — priority shown as "Health"

### 3d. Permanent "—" placeholder columns
`app/accounts-finance/accounts-receivable/page.tsx:39`, `supplier-bills/page.tsx:40`, `buyer-payments/page.tsx:39`, `cost-center-tracking/page.tsx:44-48`, `order-wise-profit-loss/page.tsx:42-47`; `app/crm/buyer-wise-profitability/page.tsx:40-44`, `order-amendment-history/page.tsx:40-45`; `app/merchandising/buyer-enquiry-analysis/page.tsx:36-44` (also silent `slice(0,60)` truncation without ellipsis), `style-management/page.tsx:34-42` ("Season" always "—")

**FIX:** Map fields to matching headers; drop columns the data cannot populate; render "—" only when genuinely absent, never duplicate values.

---

## 4. Fabricated data presented as live (HIGH)

1. **Demo fallback on empty API:** every page does `if (!items.length) return` and the workspace silently renders hardcoded demo rows (H&M/Zara, "Rafiqul Islam", "WO-2418") — an empty backend shows fake records with no empty state. (`app/hr/attendance/page.tsx:15`, `app/tna/task-job-order-management-monitoring/page.tsx:15-22`, `app/ie-planning/capacity-booking-allocation/page.tsx:14`, `app/production/production-order-received/page.tsx:17`, `app/quality-control/final-inspection/page.tsx:17`, `app/inventory/fabric-inventory/page.tsx:17`, `app/commercial-management/acceptance-clearance/page.tsx:25-46`, `app/accounts-finance/accounts-payable/page.tsx:20-36`, `app/procurement/raw-materials-booking/page.tsx:21-40`, `app/fixed-assets/fixed-asset-management/page.tsx:41-49`)
2. **Hardcoded footer:** `"Showing 4 of 24 records"` in 11 workspaces regardless of real data.
3. **Static side panels contradicting live metrics:** progress bars / notices stay demo while metrics/rows are API-driven (`app/production/production-workspace.tsx:786-799`, `app/inventory/inventory-workspace.tsx:695-708`, `app/merchandising/merchandising-workspace.tsx:730-757`).
4. **"Live — API Connected" badges on static pages:** `app/fixed-assets/page.tsx:27-29`, `app/subcontract/page.tsx:27-29`, `app/reporting/page.tsx:27-29`, `app/crm/page.tsx:34-36`, `app/multi-company/page.tsx:34-36`, `app/commercial-management/page.tsx:34-36`, `app/procurement/page.tsx:27-29`, `app/production/page.tsx:40-42` (6 of 20 modules static), `app/quality-control/page.tsx:30-32` (3 of 10 static), `app/inventory/page.tsx:37-39` (8 of 17 static), `app/merchandising/page.tsx:37-38`, `app/tna/page.tsx:28-30`, `app/ie-planning/page.tsx:29-31`. Contrast: `app/planning/page.tsx:159-161` honestly labels itself "Sample data".
5. **`RawItemsViewer` dev JSON dump in production UI** (employee/order data exposed): all workspaces (`app/hr/hr-workspace.tsx:487`, `app/tna/tna-workspace.tsx:394`, `app/ie-planning/ie-planning-workspace.tsx:427`, `app/production/production-workspace.tsx:808`, `app/quality-control/quality-control-workspace.tsx:502`, `app/inventory/inventory-workspace.tsx:717`, `app/merchandising/merchandising-workspace.tsx:760`, `app/crm/crm-workspace.tsx:272`, `app/procurement/procurement-workspace.tsx:412`, `app/reporting/reporting-workspace.tsx:331`, `app/fixed-assets/fixed-asset-management/page.tsx:176`). On `app/reporting/mis-reporting/page.tsx:15-24` and `all-reports-export-to-excel-pdf/page.tsx:15-24` the raw dump is the **only** place fetched data appears — the workspace still shows demo rows.
6. **Fake KPIs:** `app/tna/graphic-view-of-task-job-order-status/page.tsx:17-19` — 1 of 4 metrics live, 3 static; `app/procurement/raw-materials-booking/page.tsx:33-34` — two metrics from the same wrong source; `app/commercial-management/export-lc-…/page.tsx:37-39` — label ≠ computed value.
7. **Raw snake_case statuses shown verbatim:** `in_transit`, `issued`, `pending_review` in commercial/accounts pages (fix reference: `app/crm/buyer-communication-records/page.tsx:15-22`).

**FIX:** Real empty states (the shipped `Empty` component is currently unused); compute footers/side panels from data; per-module truthful data-source badge; gate `RawItemsViewer` behind a dev flag.

---

## 5. Design-system & color-token violations (HIGH/MEDIUM)

- **842 raw palette classes** mixing `bg-emerald-500`, `text-rose-600`, `bg-amber-100 text-amber-700`, `bg-slate-400`, `bg-indigo-100`… with token classes — same semantic state styled 5 ways across pages (e.g. "Active": `bg-emerald-100 text-emerald-700` vs `text-emerald-600` vs `bg-emerald-50 text-emerald-800 border-emerald-300`). Breaks theming/dark mode. Representative: `app/commercial-management/commercial-management-workspace.tsx:69-72,516`, `app/finance-workspace.tsx:357-359`, `app/orders/page.tsx:17-21,72,95,102,108,176,197,211-214`, `app/compliance/page.tsx:63-64,75-77,113-119,134,142,151,168,207`, `app/costing/page.tsx:12-14,88,93,136,197`, `app/performance/page.tsx:104,170,176,204-208`, `app/scheduling/page.tsx:100-107`, `app/fixed-assets/fixed-asset-management/page.tsx:98-108,151-152`, `app/buyers/_components/buyers-columns.tsx:107-112`, admin/security/settings pages (`bg-white` instead of `bg-card`).
- **Hex literals:** `app/orders/page.tsx:221` (`bg-[#5c4bdf] hover:bg-[#4b3cbf]`), `app/compliance/page.tsx:63-64` (gauge `stroke="#e5e7eb"`/`#4f46e5` indigo — not the app primary).
- **Token utilities exist but are unused:** `globals.css` defines `.badge-success/.badge-warning/.badge-danger/.badge-info`, `.status-*`, `.kpi-card`, `.page-shell`, `.grid-kpi` etc. — zero usage in `app/`. The `Empty` component: zero usage.
- **Progress bars** use hardcoded tones incl. low-contrast `bg-slate-400` (`app/production/production-workspace.tsx:168,227,315,345`, `app/inventory/inventory-workspace.tsx:105,520,550`).
- **Trend icons directionless:** `app/crm/crm-workspace.tsx:194` renders `TrendingUp` for every metric regardless of `trend`; `app/performance/page.tsx:106` renders the identical icon in both branches (`{trendUp ? <TrendingUp/> : <TrendingUp/>}`). Merchandising's neutral trend uses a **Shirt icon** (`merchandising-workspace.tsx:647`).
- **Header/layout:** `app/AppLayout.tsx` uses `bg-gradient-to-br` + an inline `linear-gradient` grid overlay (non-themeable); `AppHeader.tsx` hardcodes `bg-white/70` (breaks dark mode).

---

## 6. Typography, hierarchy & spacing (MEDIUM)

- `text-[10px]`/`text-[11px]` (30×) for badges/labels/IDs: `app/orders/page.tsx:214`, `app/scheduling/page.tsx:149,157,198,200`, `app/planning/page.tsx:125`, `app/accounts-finance/page.tsx:79`, `app/performance/page.tsx:86`, `app/compliance/page.tsx:94,197,207`, `app/costing/page.tsx:93`, `app/fixed-assets/fixed-asset-management/page.tsx:94-164`, `app/settings/page.tsx:118`, admin pages.
- **Heading inversion:** list pages `h1 text-3xl` → detail pages shrink to `text-2xl` (`merchandising-detail.tsx:156`, `merchandising-form.tsx:76`); index pages use `h2` (`app/hr/page.tsx:28`, `app/crm/page.tsx:20`…) while detail workspaces render `h1`; `app/planning/page.tsx:157` uses `h2 text-lg`; `app/accounts-finance/page.tsx:48` is the only index with `h1`. Workspaces render a **second `h1`** (brand h1 already in `AppHeader.tsx:15`).
- **KPI value scale drift:** `text-2xl` (workspaces, buyers) vs `text-3xl` (orders/compliance/costing) vs `text-4xl` (scheduling).
- **Vertical rhythm:** `space-y-6` (workspaces) vs `space-y-8` (index pages); card header padding `px-5 py-5` vs `px-6 py-5` (`merchandising-detail.tsx:161,181` vs workspace `:657`).
- **Form titles lowercase/awkward:** "New booking", "New enquiry", "New downtime", "New performance record" (`merchandising-form.tsx:76,117` + 7 new-pages).

---

## 7. Accessibility (MEDIUM)

- 48 `<button>` without `type` (defaults to submit); raw text buttons ~20px tall (below 44px target): `hr-workspace.tsx:453,479` etc.
- Icon-only buttons with no `aria-label`/`sr-only`: `app/orders/page.tsx:125`, `app/compliance/page.tsx:56`, `app/performance/page.tsx:126`, `app/buyers/_components/buyers-table.tsx:109-128` (pagination chevrons); merchandising pagination chevrons (`merchandising-workspace.tsx:700-706,718-724`).
- Search inputs: placeholder-only, no label/`aria-label`, no `role="searchbox"` (all workspaces + `AppHeader.tsx` search).
- **Nested `<main>`** — workspaces render `<main>` inside `AppLayout`'s `<main>` (all 7 workspaces + hr/tna/ie) — invalid HTML.
- **Two `<h1>` per page** (brand + workspace title).
- Rows navigate on `onClick` `<tr>` with no `role`/`tabIndex`/keyboard handler (`merchandising-workspace.tsx:678-682`); Gantt bars are `cursor-pointer` divs (`app/planning/page.tsx:110-128`); `RawItemsViewer` collapsible header is a non-focusable `div` with onClick.
- `<th>` cells lack `scope="col"` in all workspace tables.
- Color-only status pills (section 3a) + color-only trend arrows.
- Low contrast: `text-muted-foreground/60` at 10px (`app/scheduling/page.tsx:198`), `text-red-600` 12px (`app/orders/page.tsx:108`).
- Decorative fake checkbox in order rows (`app/orders/page.tsx:168`) — static div styled as a selectable checkbox.

---

## 8. Responsiveness & overflow (MEDIUM)

- `min-w-[720px]` tables force horizontal scroll on mobile with no responsive column strategy (all workspaces) and **no `truncate`/`whitespace-nowrap`** — long values wrap into ragged rows.
- Fixed grids without `overflow-x-auto`: `app/fixed-assets/fixed-asset-management/page.tsx:134-172` (7-col), `app/orders/page.tsx:149,167` (5-col), `app/costing/page.tsx:125,134` (6-col).
- Detail rows use fixed `w-48` `<dt>` squeezing values on ~320px viewports (`merchandising-detail.tsx:168,188`, `rm-collection-consumption-sourcing/[id]/page.tsx:60`).
- Header action rows don't wrap (`flex items-center gap-2`) — "Schedule inspection" + Export overflow narrow screens (all workspaces).
- `app/hr/page.tsx` etc.: `space-y`/card-gap override drift within one page (`gap-0 py-0` vs `gap-3 py-4` vs `gap-4`, overriding Card default `gap-5 px-5 py-5`).

---

## 9. Layout hacks & markup (MEDIUM/LOW)

- Negative-margin bleed: `-mx-5 px-0` in `app/costing/page.tsx:106`, `app/compliance/page.tsx:89`, `app/performance/page.tsx:137` — cards misalign with siblings.
- `app/scheduling/page.tsx:126` — "today" column highlighted by array index (`i === 3`), not the real date.
- `app/orders/page.tsx:168` fake checkbox (above).
- Compliance gauge uses unicode `✦` next to lucide icons (`app/compliance/page.tsx:92`).
- `app/merchandising/rm-collection-consumption-sourcing/new/page.tsx:86-112` — hand-rolled second form inconsistent with `MerchandisingForm` (no focus rings, no validation); type switch `setFormData({})` wipes input without warning (`:89`).
- `merchandising-detail.tsx:111-119` — `formatter` ignored for badge fields → booleans render as amber "True"/"False" pills; `:179-197` "Additional Fields" card shows raw JSON-stringified values (debug output).
- Detail pages show raw FK IDs ("Buyer: 3", "Style: 12") while lists resolve names (`style-management/[id]/page.tsx:12` etc., 8+ detail pages).

---

## 10. Copy & content issues (LOW)

- Dev notes in UI: metric notes literally `"From API"` (`app/procurement/procurement-management/page.tsx:22`, `quotation-vs-actual-analysis/page.tsx:21`, `raw-materials-requisition/page.tsx:21`); "1 modules" (`app/fixed-assets/page.tsx:17`, `app/subcontract/page.tsx:17`).
- `app/orders/page.tsx:108` — sample text hardcoded; `app/orders/page.tsx:72` etc. — demo values in KPI cards when API fails (no error state).
- 15 index pages declare `const pages = [...]` that is never used (cards hand-duplicated inline) — dead code guaranteeing drift.
- "Last sync: Just now" + pulsing "SYSTEM ACTIVE" are static (`app/page.tsx:57-60`).
- `app/merchandising/rm-collection-consumption-sourcing/new/page.tsx` — "Numeric buyer ID" placeholders force users to memorize DB IDs; no dropdowns populated from lookup APIs (16 of 17 merchandising new-pages).
- `app/ie-planning/po-wise-tna-time-action/page.tsx:6-12` and `app/tna/export-import-data-in-csv-excel/page.tsx:6-8` — empty `useEffect(() => {})`, no fetch at all, pure placeholders.

---

## 11. Top 10 priorities

1. **Fix all 129 relative module links** → absolute paths (`next/link`). Every module hub currently 404s.
2. **Semantic status mapping** in all 12 workspaces (kill the amber-fallback `noticeClass`).
3. **Wire or disable dead controls** — Export/Add/Filter/Search/View-all/task-center; remove fake success toasts; fix inert "Auto-Assign".
4. **Remove demo-data fallback** → real empty states; compute "Showing N of M" from data; make side panels data-driven; drop "Live — API Connected" from static pages.
5. **Remove `RawItemsViewer`** from production UI (or dev-flag it) and render fetched data in reporting pages that currently show demo rows.
6. **Fix header/data column mismatches** (TNA 5-vs-6 cells, `statusIndex` on numeric columns, merchandising/commercial mislabeled columns).
7. **Consolidate colors onto tokens** — 842 raw palette classes + hex literals; use `globals.css` badge/status utilities; swap `bg-white` → `bg-card`.
8. **Accessibility pass** — button `type`, icon-only `aria-label`, search labels, `scope="col"`, keyboard-friendly rows/Gantt, fix nested `<main>` and double `<h1>`.
9. **Responsive tables** — replace `min-w-[720px]` with truncation + mobile card layout; wrap header actions; drop fixed `w-48` detail labels.
10. **Standardize typography** — one heading scale, one KPI value size, one vertical rhythm; replace `text-[10px]`.

---

## 12. Positive references (patterns to reuse)

- `app/accounts-finance/finance-workspace.tsx:356-360` — status→tone regex mapping done right.
- `app/crm/buyer-communication-records/page.tsx:15-22` — snake_case→label mapping.
- `app/procurement/procurement-workspace.tsx:277-305` — real loading skeleton + error state.
- `app/compliance/page.tsx:102-104`, `app/performance/page.tsx:158-162`, `app/buyers/_components/buyers-table.tsx:90-99` — proper empty-state rows.
- `app/buyers/_components/buyers-columns.tsx:159` — `sr-only` label on icon-only button.
- `app/planning/page.tsx:159-161` — honest "Sample data" labeling.
