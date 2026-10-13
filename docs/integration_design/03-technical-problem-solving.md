# Texon–Odoo Technical Implementation Contracts

> Updated: 2026-10-13
> Status: Engineering requirements; validate exact APIs against the pinned runtime.

## Authority and extension strategy

Odoo owns all ERP business state, including garment product metadata, approved specifications, stock, accounting, employees, and installed suite modules. Texon owns presentation, user preferences, AI history/proposals, commands, and disposable read caches. Retire duplicate Django business engines as each domain migrates.

| Domain | Odoo authority | Texon responsibility |
|---|---|---|
| Partners/catalog | `res.partner`, `product.template`, `product.product` | Authorized search, form drafts, color/size matrix UI |
| Specifications | `mrp.bom` and explicit revision extension | Approved revision display and submission |
| Stock/purchasing | `purchase.order`, `stock.move`, `stock.lot`, `stock.quant` | Receipts, manual quality decisions, availability views |
| Sales/manufacturing | `sale.order`, `mrp.production`, `mrp.workorder` | Business commands, shortages, manual progress |
| Finance | `account.move` and selected payment/reconciliation workflows | Selected forms and reconciled summaries |
| Suite modules | Installed project/HR/helpdesk/sign/appraisal/marketing providers | Focused forms, portal, dashboards |

Use native Odoo administration for configuration initially. Extend Odoo only for missing business rules or garment fields. Do not retain specialist cutting algorithms, floor telemetry, device connectors, or independent payroll/valuation algorithms.

## Command envelope and authorization

Define typed schemas for each allowlisted action. Envelope fields: `operation_uuid`, trusted tenant/company, authenticated actor reference, command name, schema version, aggregate ID, expected revision, and parameters. Server code supplies identity and routing; the browser/LLM cannot nominate a tenant, actor, database, model, or arbitrary method.

Compute a canonical fingerprint covering tenant/company, command name, schema version, aggregate, expected revision, actor binding, and parameters. Use a specified JSON representation with stable decimal/date handling; reject NaN and unsupported types. A payload hash detects mismatched replay; it is not authentication or a signature.

Odoo must validate company membership and action/record access before looking up or returning a receipt. Compare the full fingerprint and company/command on replay, not just parameters. Resolve related IDs under the authorized company and customer rules. Use trusted actor metadata for audit; never trust `payload.actor_id`.

Use a static handler registry. Apply model-specific ACLs, record rules, `with_company`, allowed-company context, and relational company checks. Setting context or confirming that a company exists does not itself grant access. Never apply a universal `company_id=False` filter to private HR/financial data; shared-record policy is model-specific.

Avoid blanket `sudo()`. Restrict integration keys and rotate them before expiry. Validate permission revocation and field-level access on each request; session role data is a UI hint, not final authority.

## Receipt and concurrency contract

Store the unique operation identity, company, command fingerprint, outcome, result IDs, actor, and audit timestamps in Odoo. Commit successful receipt, business effects, and outgoing event together. Duplicate concurrent operations must return the committed original result through a tested lock/reservation/retry protocol. A receipt insertion after mutation with a unique constraint alone does not define graceful concurrent replay.

Expected revisions prevent a stale update from overwriting a newer approval, quantity, or status. Use Odoo-side locking/rechecks for competing consumption, quality release, and order amendments. Define compensation through native cancel, return, credit, or reversal workflows; do not promise distributed exactly-once delivery.

## Durable delivery

Django outbox fields include operation identity/fingerprint, tenant/company, aggregate/revision, payload, status, attempt count, next attempt, lease owner/expiry, response, and safe error details. Claim in a short transaction and perform RPC outside it. Retry expired claims; separate `RETRY_WAIT`, `REJECTED`, `OUTCOME_UNKNOWN`, `SUCCEEDED`, and dead-letter/reconciliation states. Use `2 ** attempt` in Python, not bitwise XOR `2 ^ attempt`; add delay caps and jitter.

Implement an Odoo event model and publisher, not only a Django inbox. Cover permitted native Odoo writes as well as bridge commands. Each event has stable ID, tenant/company, aggregate revision, schema, and delivery acknowledgment. Authenticate delivery and validate source binding. Apply inbox and projection updates atomically; stale events trigger ignore/refetch rather than overwriting new state.

Keep a retention/archive policy for receipts and audit evidence independent of short-lived queue cleanup. Alert on stuck leases, old unknown outcomes, publisher lag, repeated rejection, and reconciliation discrepancies. Protect operation-status and replay endpoints with the same company/action authorization as execution.

## Manufacturing, stock, and finance

Pin variant IDs and approved BOM revisions; add immutable revision enforcement in Odoo, including component edits and native UI/API paths. Django `save()` overrides alone cannot protect Odoo records or bulk writes.

Use verified stock reservation/completion extension points. The earlier `mrp.production.check_assign` instruction is superseded: the inspected Odoo 20 source has `action_assign`, delegating to stock moves. Guard automatic/manual reservations and final stock completion, not just one UI button. [Official MRP source](https://raw.githubusercontent.com/odoo/odoo/20.0/addons/mrp/models/mrp_production.py).

Manual work-order updates never turn cut panels or intermediate progress into finished goods. Define the final completion/quality boundary, partial/backorder behavior, actual consumption, reusable offcuts, and scrap. Agree whether native work-order progress suffices or intermediate products are needed for stock-valued WIP; validate that choice against costing.

Use one inventory UOM per product. Defer mixed weight-priced/length-stocked purchasing until a verified dual-unit addon or explicit measurement workflow passes reconciliation; a purchase UOM field alone does not implement this requirement.

Configure localization, chart of accounts, costing/valuation, taxes, currency precision, journals, opening balances, approval thresholds, and period locks before operational activation. Draft invoices do not satisfy Accounting completion. Test bills, posted invoices, payments, reconciliation, credits, and stock/manufacturing value together.

## Session, API, and AI transport

Use an opaque server session or deliberately selected encrypted session with HttpOnly, Secure, SameSite cookies. Keep Django/Odoo credentials server-side. Implement CSRF/origin protection, bounded pagination, single-flight refresh, expiry, logout, revocation, and company-change invalidation. Authorize every server operation independently of route navigation guards.

For AI, use session-authenticated POST streaming through the BFF, with SSE-formatted responses and cancellation. Do not rehydrate JWTs into browser code or query-string WebSocket URLs. WebSockets are outside the initial AI transport scope; adding them later requires a separate authenticated ticket/origin design.

## Migration and scope retirement

Inventory real paths and migrations before editing: the current addon is under `odoo/addons/texon_bridge`, not the earlier proposed `odoo_addons` directory. Read current manifests instead of hardcoding old framework versions or migration numbers.

Create a mapping/retirement sheet, deterministic IDs, resumable imports, reject reports, and reconciled opening/open-document balances. Preserve excluded cutting/optimization/device-related history read-only, hide unsupported navigation, and block obsolete write APIs. Freeze writes for cutover and test recovery of Django, Odoo, filestore, receipts, and event queues together.
