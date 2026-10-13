# Odoo–Texon System Architecture and Consistency

> Updated: 2026-10-13
> Status: Planned architecture, aligned with the revised product scope.

## Boundaries

Odoo is the authority for partners, catalog/variants, approved BOMs, sales, purchasing, inventory, manufacturing, finance, HR, projects, tickets, campaigns, appraisals, and signing records provided by installed modules. Texon owns UI preferences, portal presentation, AI conversations/proposals, integration commands, and derived projections. Garment fields affecting business decisions belong in small versioned Odoo addons.

Next.js browser → session-authenticated BFF → Django authorized endpoints → durable commands → Odoo `texon_bridge`. Odoo events → Django inbox/projections → Texon views. AI uses the same permission-aware read and command services.

A Texon form draft is a temporary request, not a second authoritative business document. Odoo-native administration remains available to authorized staff; its changes must also reach projections. Exclude specialist cutting/CAD, telemetry, biometric connections, bundle tracking, and custom payroll/stock/accounting engines.

## Identity and isolation

- Begin with one client deployment/database pair, company, warehouse, currency/localization, and manufacturing route.
- Derive tenant/database routing from trusted deployment configuration and the authenticated session. Odoo companies represent legal entities within a customer, not unrelated SaaS tenants.
- Authorize each business action and every returned field/record in Django. A shared integration account does not inherit an end user's permissions.
- Independently enforce Odoo ACLs, record rules, company checks, and restricted integration-user access. Validate record relationships and company before receipt lookup or mutation.
- Protect buyer portal records by customer relationship as well as company. Revalidate access after role changes and on every AI tool call.

## Reliable commands and events

1. Persist the local command and outbox entry in one Django transaction, with tenant/company, authenticated actor, stable operation UUID, schema version, expected revision, and canonical command fingerprint.
2. Claim due commands briefly under a row lock, set a lease/owner, and commit before network I/O. Reclaim expired leases after worker crashes. Use per-aggregate ordering or expected revisions to reject stale commands.
3. Odoo checks an explicit command allowlist, authorization, company, current state/revision, and typed parameters. Store business changes, receipt, and outgoing event in the same transaction.
4. Concurrent duplicates must return the original result after the winning transaction commits. A unique constraint alone is insufficient: test rollback/retry or reservation/savepoint handling, including transaction isolation behavior.
5. A timeout is `OUTCOME_UNKNOWN`. Replay/query with the same UUID; never generate a replacement operation to resolve uncertainty. Retry transport failures with bounded exponential backoff and jitter; separate permanent business rejection from retryable errors.
6. Publish durable Odoo outbox events with retry/acknowledgment, covering both bridge actions and supported native Odoo changes. Authenticate delivery, bind source/tenant/company, and reject replay/tampering.
7. Deduplicate and apply each event atomically in the Django inbox. Use aggregate revisions and authoritative refetch to handle late/out-of-order events. Numeric IDs or `write_date` alone are not reliable commit-order cursors.
8. Reconcile partners, stock, open orders, production and financial summaries periodically. Display pending, rejected, outcome-unknown, stale, and reconciliation-needed states honestly.

Each JSON-2 request is one transaction; several calls do not form a distributed transaction. Use Odoo workflow methods and normal reversals/returns for compensation. Do not directly edit quants or posted journals. [Official API contract](https://raw.githubusercontent.com/odoo/documentation/20.0/content/developer/reference/external_api.rst).

## ERP modeling

- Style → product template; color/size → stable variant IDs. Preserve historical variant references across approved revisions.
- Odoo owns approved BOMs and revision rules. Pin the approved specification to each released MO; reject or explicitly approve changes affecting active work.
- Use native lot tracking and manually entered quality decisions. Optional shade/width/inspection fields need verified addons; no device integration is required.
- Choose one stock UOM per product and compatible purchase units. For the pilot, record measured weight separately; defer weight-priced procurement until a supported dual-unit workflow is validated.
- Standard work orders represent progress. Only validated final completion and required quality release create shippable finished stock. Define consumption, scrap, offcuts, WIP, partial production, and backorders explicitly.
- Configure chart of accounts, costing/valuation, taxes, currency, opening balances, approvals, and period controls before operational go-live. Treat estimates separately from posted actual costs.

## Migration and retirement

Classify each existing table/route as migrate-and-retire, read projection, UI/integration data, or excluded historical data. Disable excluded navigation and legacy mutations during implementation; do not delete records automatically. Preserve attachment links, document references, and a read-only history where needed.

Import companies/UOM/currencies → partners/catalog → locations/lots/BOMs → approved opening balances/open documents. Use deterministic external IDs, resumable batches, dry-run reject reports, and reconciled totals. Freeze legacy writes, drain/reconcile pending commands, migrate deltas, then enable the new writer. Rehearse consistent recovery of both databases, Odoo filestore, receipts, and events. After new postings, use controlled reversal/forward correction rather than blindly restoring old data.

## Pilot acceptance scenarios

1. Create a style with two colors and three sizes; repeated synchronization preserves six SKU mappings.
2. Release an MO with an approved variant BOM; a later revision does not silently alter its requirements.
3. Receive tracked material, partially consume a lot, and reconcile remaining quantity and traceability.
4. Reject unsupported kg-to-length conversion and test rounding in supported units.
5. Expose material shortages without duplicating procurement or manufacturing demand.
6. Record intermediate work without finished stock; finish partially with correct consumption, scrap, and backorder.
7. Hold material or finished goods; reservation/consumption/shipment cannot bypass the quality rule through Texon or native Odoo paths.
8. Ship partially, return goods, create the selected credit workflow, and reconcile stock and finance.
9. Deliver one command ten times concurrently; obtain one business effect and the same logical receipt/result.
10. Lose the response after commit; retry the original UUID without duplication; changed command/company/payload is rejected.
11. Kill a worker after lease claim, then recover; stop/restart broker and publisher without losing commands or events.
12. Reorder/duplicate events and make a native Odoo edit; projections converge with accurate freshness status.
13. Deny cross-client/company/customer/field access, including operation receipts, AI history, and direct bridge calls.
14. Repeat/resume migration; reconcile stock, open quantities, balances, attachments, and mappings.
15. Restore both systems and filestore; replay safely and verify readiness before reopening writes.
16. Post customer/vendor invoices and payments; reconcile balances, valuation, and period controls with finance approval.
17. Complete each enabled module's acceptance workflow from the product matrix; unavailable modules remain visibly disabled.
18. Run the AI security/evidence/confirmation acceptance suite before enabling its tools for pilot users.
