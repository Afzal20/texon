# Texon Implementation Roadmap: Odoo ERP Workspace and AI

Follow the [162-part implementation tracker](06-implementation-backlog.md) for individual parts and commit evidence.

> Updated: 2026-10-13
> Status: Revised milestone backlog; supersedes COMMIT-001–240 and the earlier fixed sequential commit plan.
> Filename retained to preserve links. Commit counts and dates are not acceptance criteria.

## Delivery rules

Follow [product scope](../GARMENT_ERP_13_MODULES_MASTER_PLAN.md), [architecture](01-system-architecture-and-sync.md), [technical contracts](03-technical-problem-solving.md), and [AI requirements](05-ai-copilot-integration-plan.md). Dependencies below are release gates, not a requirement to create one commit per task. Keep implementation and its meaningful tests together.

All business transactions execute in Odoo. Django stores integration requests, projections, and AI/session data. Remove dedicated cutting, CAD, marker optimization, machine/device connectivity, biometrics, bundle tracking, bespoke scheduling/IE solvers, and independent ERP calculation engines from supported delivery.

Candidate target paths below must be checked against the actual checkout. Do not copy obsolete migration numbers or create a second addon directory. Backend dependencies currently live in `backend/pyproject.toml`; frontend tasks in `frontend/texon-ui/package.json`; bridge code in `odoo/addons/texon_bridge/`.

## M0 — Workflow, module, and edition validation

**Dependencies:** None.

**Targets:** Product plan, Odoo research, `odoo/`, frontend route inventory, backend model/API inventory.

- Document the pilot customer's roles, one company/warehouse/localization, order lifecycle, and standard production route.
- For all 13 product areas, record the exact Odoo core/Enterprise/OCA/provider version, source, license, dependencies, maintenance owner, cost, and supported actions.
- Install candidates in the selected pinned Odoo runtime and exercise required APIs. Keep unavailable features disabled; resolve provider gaps before estimating their delivery.
- Choose Community plus verified addons or licensed Enterprise. Verify Helpdesk/SLA, Appraisals, Sign, document knowledge, localization/reporting, and HR capabilities independently.
- Inventory existing routes, models, APIs, tasks, and navigation: retain, migrate-and-retire, projection, or excluded historical feature.
- Define native Odoo configuration screens and the focused workflows to expose in Texon. Specify signing evidence separately from internal approvals.

**Acceptance:** Reviewed provider matrix covers all 13 areas; selected modules install; route/data disposition and pilot workflow are explicit. No unsupported addon or hardware dependency is hidden in the estimate.

## M1 — Foundation, identity, and financial configuration

**Dependencies:** M0.

**Targets:** Frontend package/session/API files; backend config/authentication/RBAC; Odoo compose/config/security and CI.

- Pin compatible Node, pnpm, frontend, Python/backend, PostgreSQL, and Odoo versions/image digests from actual manifests. Standardize lockfiles and document runnable commands.
- Add meaningful frontend/backend/Odoo test harnesses and real-runtime CI. Repair the stale ASGI AI import before serving the backend; AI restoration uses the HTTP architecture in M7.
- Implement server-managed HttpOnly sessions, CSRF/origin checks, refresh deduplication, logout/revocation, and current permission hydration. Remove browser-readable JWT stores and token return paths.
- Replace generic ERP mutations with restricted draft/configuration access and typed business endpoints. Apply record/field/company/customer authorization, including operation status and document downloads.
- Configure Odoo restricted integration users, groups, record rules, tenant routing, and immutable actor audit references.
- Configure company, warehouse, currency/localization, chart of accounts, taxes, costing/valuation, journals, opening-balance policy, approval thresholds, and period controls with the finance owner.
- Implement bounded server pagination, typed DTOs, real loading/error/empty/stale states, and source/freshness metadata.

**Acceptance:** Reproducible build and service boot; unauthorized/cross-company/private-field requests denied; revoked sessions fail; missing secrets fail safely; financial configuration is approved before posting operational transactions.

## M2 — Atomic integration and convergent read models

**Dependencies:** M1.

**Targets:** `backend/core/` integration services/tasks/APIs; `odoo/addons/texon_bridge/` models/security/tests; frontend operation hooks.

- Define versioned allowlisted commands and full canonical fingerprints, trusted identity, expected revisions, and safe error mapping.
- Write command plus outbox atomically. Add short-lived leases, crash reclamation, capped exponential backoff/jitter, and per-aggregate ordering/revision checks.
- Implement atomic Odoo business action/receipt/event transactions. Handle concurrent duplicate calls with original-result replay rather than only unique-constraint failure.
- Distinguish rejected, retry-wait, unknown outcome, succeeded, and reconciliation-required states. Replay unknown operations with the original UUID.
- Implement durable Odoo event records, authenticated publisher, retry/acknowledgment, and hooks for supported native Odoo writes.
- Deduplicate/apply events atomically; reject stale revisions or refetch current state. Add scheduled authoritative reconciliation.
- Protect status/replay endpoints, configure receipt/audit retention, and surface integration lag, stuck leases, and queue health.

**Acceptance:** Architecture scenarios 9–13 pass against real Odoo, including worker death, timeout after commit, concurrent duplicates, native edits, reordered events, and cross-company receipt access. UI never reports success merely because a command was queued.

## M3 — Sales, catalog, BOMs, purchasing, and inventory

**Dependencies:** M2.

**Targets:** Odoo bridge product/sale/purchase/stock extensions; Django adapters/projections; Texon merchandising/inventory/procurement forms.

- Migrate partners/catalog to Odoo ownership; use stable external IDs and typed draft submission services instead of automatic bidirectional post-save synchronization.
- Implement style/color/size matrix entry backed by Odoo templates/variants. Keep garment metadata and approved BOM revisions in Odoo.
- Map buyer POs to sales orders and supplier POs to purchasing. Retire duplicate Django order writers with preserved references/history.
- Implement quotation, confirmation, controlled amendments, shortages, supplier PO confirmation, partial receipt, backorders, and returns.
- Track lots, remaining quantities, compatible UOMs, and manual quality hold/release decisions through Odoo stock workflows.
- Implement quality restrictions in the verified reservation/completion paths, including native Odoo operations; do not use the obsolete `check_assign` instruction.
- Defer weight-priced/length-stocked procurement until a verified dual-unit workflow passes. No cutting allocation, device terminal, marker optimizer, or specialist inspection engine is required.

**Acceptance:** Architecture scenarios 1–5 and 7 pass; repeated imports preserve mappings; partial receipt and return reconcile; shortages and quality holds are visible and enforceable; order amendments reject stale revisions.

## M4 — Manufacturing, delivery, and full pilot accounting

**Dependencies:** M3 and approved M1 finance settings.

**Targets:** Odoo MRP/stock/account handlers and tests; Texon production/delivery/finance views; Django read adapters.

- Create MOs with approved variant BOM revisions and standard work orders. Capture authorized manual progress and expose material availability.
- Define final-completion and quality-release gates. Intermediate progress cannot generate shippable finished stock. Agree WIP costing and whether intermediate products are necessary for the pilot route.
- Record actual material/lot consumption, scrap, reusable offcuts, partial production, and backorders using Odoo workflows. Avoid double-counting consumed material and scrap.
- Pack and deliver completed approved goods, support partial shipment/customer returns, and reconcile lots and quantities.
- Implement customer/vendor invoices, posting, payments, bank reconciliation, credits, valuation/cost reports, and period locks through selected Odoo capabilities.
- Add trade-finance/L/C metadata only if required by the pilot; use Odoo journals/payments for financial effects. Do not claim full export finance/local compliance from a draft invoice.
- Enable subcontracting only after one explicitly modeled native workflow, component ownership, returns, and cost reconciliation pass.

**Acceptance:** Architecture scenarios 6, 8, and 16 pass. Production/finance owners verify intermediate versus final quantities, stock value, scrap, receivables/payables, payments, and close. The order-to-payment demo runs without hardware.

## M5 — Buyer experience and business collaboration

**Dependencies:** M3–M4 and each module's M0 provider gate.

**Targets:** Installed Odoo portal/website/helpdesk/project/calendar/CRM/marketing addons; corresponding Texon screens and authorized adapters.

- Website: implement a branded introduction and buyer portal for permitted order, shipment, invoice, and document access; omit 3D showroom tooling.
- Helpdesk: create/assign/respond/close order-linked claims/tickets; configure email routing and verified SLA addon if required.
- Services: sample-development projects, tasks, assignees, due dates, hours, and costs. No pattern/CAD/SMV engine.
- Productivity: tasks, calendar, activities, due-date alerts, and permission-controlled SOP documents via verified provider. No independent critical-path solver.
- Marketing: lead capture/pipeline, opportunity-to-quotation linkage, campaigns, consent/opt-out, and actual delivery/error reporting.
- Build focused Texon workflows and deep-link authorized native Odoo configuration as needed. Do not rebuild every editor before validating its value.

**Acceptance:** Website, Helpdesk, Services, Productivity, and Marketing completion rows in the product matrix pass. A buyer cannot access another buyer's records or private internal notes. Email tests use a controlled test inbox; no unsolicited live campaign is sent.

## M6 — Workforce, appraisals, and signing

**Dependencies:** M1–M2 and each module's M0 provider gate; M5 projects/documents where linked.

**Targets:** Installed Odoo HR/leave/attendance/appraisal/sign providers; corresponding Texon forms/adapters; private-field tests.

- HR: employee directory, departments, approved leave, manual attendance, and contracts where supported. Protect wages, bank details, and personal records independently of general employee visibility.
- Appraisals: templates/cycles, self/manager review, restricted feedback, approval, and historical reviews. Exclude live operator telemetry and automatic quality-penalty scoring.
- Sign: request signatures against an exact document version, verify signer/access, record consent and completed evidence, and preserve the signed artifact/audit history in the selected Odoo-integrated provider.
- Model internal production/quality approvals separately; a canvas drawing or approval checkbox alone does not complete the signing module.
- Optional payroll: verify a localized Odoo payroll provider and validate calculations, approvals, journals, and reconciliation with the responsible payroll/finance owner before enabling. Do not build a duplicate Django payroll engine or hardcode statutory rules.

**Acceptance:** HR, Appraisals, and Sign completion rows pass, including private-field/cross-company denial and signed-document integrity. Payroll remains disabled unless its separate localization gate passes. No biometric device is needed.

## M7 — Evidence-backed AI assistant

**Dependencies:** M1–M2 security/consistency and M3–M4 reliable business data. Additional tools depend on their M5/M6 module being enabled.

**Targets:** `backend/ai/` HTTP/provider/tool/proposal services; Next.js BFF streaming route; existing `AiCommandCenter.tsx` and `use-ai-chat.ts` after current-code inspection.

- Deliver the [AI plan](05-ai-copilot-integration-plan.md): authenticated HTTP streaming, owned conversation history, bounded provider calls, deterministic permission-aware tools, source records, and freshness.
- Begin with order status, shortage, production progress, and outstanding-invoice questions. Enable task/ticket/HR tools only after their modules pass.
- Add server-stored expiring proposals and explicit confirmations through the existing business command service, with current authorization/state/revision checks.
- Test hostile document instructions, history isolation, role revocation, stale projections, provider outages, cost limits, cancellation, and duplicate confirmations.

**Acceptance:** AI acceptance suite passes; answers link to permitted records and distinguish pending/stale/unknown data. Read-only chat works before actions are enabled. No raw SQL, arbitrary RPC, direct ledger mutation, or browser JWT is available to the model.

## M8 — Migration, pilot release, and portfolio proof

**Dependencies:** M0–M4 for a core pilot; M5–M7 only for features advertised in that release. Full-suite release requires every module row to pass.

**Targets:** Migration/reconciliation tooling, operations runbook, navigation/API retirement changes, CI, and portfolio/demo documentation.

- Run resumable dry-run imports and full reconciliation; preserve excluded legacy history and disable unsupported routes/write APIs after reviewed migration.
- Rehearse a controlled legacy write freeze, queue drain, delta import, reconciliation, and activation of the single Odoo writer.
- Restore both databases and Odoo filestore with receipts/events, then verify safe replay. Define backup ownership, recovery objectives, alerts, and failed-command handling.
- Execute all 18 architecture scenarios and every advertised module/AI acceptance check. Exercise stock/accounting against real Odoo, plus end-to-end browser workflows.
- Publish a synthetic-data demo of order → shortage → purchase → receipt → manufacturing → shipment → invoice/payment and AI-assisted follow-up.
- Prepare a case study describing the user problem, Odoo reuse, Texon-specific value, decisions, tests, and limitations. Separate verified capability from planned features and measured customer outcomes.

**Acceptance:** Owners sign off pilot data and workflow; recovery rehearsal succeeds; navigation contains no unsupported specialist modules; advertised features are backed by tests/demo evidence. A core pilot is not labeled a completed 13-module suite.
