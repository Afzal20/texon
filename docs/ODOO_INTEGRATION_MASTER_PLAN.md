# Texon & Odoo: Integration Master Plan

> Updated: 2026-10-13
> Status: Revised implementation direction; replaces the earlier fixed 225-commit directive.

## Direction

Texon is an Odoo-powered ERP workspace for garment businesses, with a tailored Next.js interface and AI assistance. Odoo performs the ERP transactions. Django supplies a thin, secure integration layer rather than an independent implementation of accounting, inventory, payroll, or manufacturing logic.

Use Odoo-native configuration screens initially and build Texon screens around client workflows. Keep all 13 requested business areas in the product roadmap, with explicit edition/addon validation and completion gates. Remove dedicated cutting/CAD, machine connectivity, biometrics, bundle tracking, optimization solvers, and bespoke ERP engines from delivery scope.

## Document precedence

1. [Product scope and 13-module matrix](GARMENT_ERP_13_MODULES_MASTER_PLAN.md): narrative, supported boundaries, exclusions, and module acceptance.
2. [Milestone implementation roadmap](integration_design/04-200-commit-implementation-roadmap.md): dependencies, deliverables, and release gates. The filename is retained for existing links; the numbered commit prescription is superseded.
3. [System architecture and consistency](integration_design/01-system-architecture-and-sync.md): ownership, reliable commands/events, and acceptance scenarios.
4. [Technical contracts](integration_design/03-technical-problem-solving.md): authorization, commands, revisions, stock, and migration details.
5. [AI copilot plan](integration_design/05-ai-copilot-integration-plan.md): session-based streaming, evidence-backed answers, and confirmed actions.
6. [Odoo research baseline](odoo_research/01-odoo-architecture-baseline.md): release/API research; installed capability verification remains mandatory.

The [backend audit](odoo_research/02-backend-static-audit.md) and [frontend audit](integration_design/02-frontend-static-audit.md) describe historical code findings. Recheck them against the implementation checkout. Older `TODO/` and `seassion/` plans are historical references, not competing implementation instructions.

## Delivery sequence

| Gate | Outcome |
|---|---|
| M0 | Customer workflows, 13-module provider matrix, edition/release decision, and route/data retirement inventory |
| M1 | Reproducible environment, authenticated sessions, authorization, company boundaries, accounting configuration |
| M2 | Atomic bridge commands, recoverable outbox, durable Odoo events, projections, reconciliation |
| M3 | Odoo-owned partners/catalog/BOMs, buyer orders, procurement, manual receipt and quality decisions |
| M4 | Standard manufacturing, final approval, shipment, posted invoices/payments, and financial reconciliation |
| M5 | Buyer portal, Helpdesk, Services, Productivity, and Marketing workflows |
| M6 | HR, Appraisals, and Sign; any optional localized payroll separately validated |
| M7 | Read-only AI, then restricted confirmed actions over the same authorized workflows |
| M8 | Migration rehearsal, restore/recovery, pilot acceptance, and honest portfolio case study |

M7 read-only work can start after M2–M4 data and permission gates pass. AI does not need to wait for every optional module, and must not advertise tools for unavailable modules.

## Implementation rules

- Pin tested versions from the actual frontend/backend manifests and selected Odoo runtime. Do not assume the old Next.js 15/Django 5 descriptions match the current repository.
- Validate each addon/version/license before promising its module. Self-hosted Community is provisional; Enterprise requires a valid subscription.
- Send permitted business actions through an explicit bridge command registry. Never expose arbitrary Odoo model/method execution or credentials to the browser/LLM.
- Keep business effects and command receipts atomic in Odoo. Deliver events for both bridge and Odoo-native changes.
- Include meaningful tests with each implementation change; use real Odoo integration tests for stock, accounting, concurrency, and permissions.
- Use a controlled write freeze for cutover. Do not call this zero-downtime migration.
- These documents update the plan only. Implementation, data deletion, deployment, and production readiness are not claimed.
