# Texon: Odoo-Powered Garments ERP Workspace

> Updated: 2026-10-13
> Status: Revised product scope and implementation plan; capabilities remain planned until verified.
> Authority: This document defines product scope. The integration roadmap defines delivery gates.

## Product narrative and audience

Texon is an Odoo-powered ERP workspace for garment businesses. It connects buyer orders, purchasing, inventory, production, and finance through a focused interface, with an AI assistant that helps people find answers and complete everyday work.

The primary users are merchandisers, purchasing teams, storekeepers, production coordinators, finance staff, HR staff, and business owners. The portfolio demonstrates business analysis, Odoo configuration and extension, secure integration, usable interfaces, and evidence-based AI assistance.

Use this illustrative scenario in the demo: a buyer asks whether an order will ship on Friday. Texon shows the order, material availability, production status, quality approvals, delivery, and outstanding actions. Label demo records as synthetic. Publish measured results only after a real pilot; do not invent customer outcomes or personal experience.

## Product boundary

Odoo owns business records, validation, calculations, stock movements, accounting, and manufacturing workflows. Texon owns the tailored interface, buyer portal, dashboards, AI conversations, and integration requests. Django provides a thin authorization/integration layer and disposable read projections; it must not become a second ERP engine.

Use Odoo-native administration/configuration screens initially. Build Texon screens for the selected customer workflows rather than duplicating every Odoo screen. Business actions shown in Texon must execute against Odoo and display their actual outcome.

### Included

- Sales, quotations, buyer references, style/color/size variants, and customer orders.
- Supplier purchasing, receipts, inventory, lots, deliveries, returns, and manual quality approvals.
- BOMs, manufacturing orders, standard work orders, manually entered progress, actual material consumption, scrap, and finished goods.
- Accounting, projects/tasks, customer support, basic HR, reviews, document approvals, CRM, marketing, and a buyer portal, subject to the module delivery gates below.
- Read-only AI assistance followed by explicitly confirmed, authorized business actions.

### Excluded from this product plan

- Dedicated cutting planning, marker optimization, pattern CAD, grading, and fabric nesting.
- Cutting-machine control, IoT sensors, live machine telemetry, predictive maintenance, and biometric-device connections.
- Bundle QR/station tracking, specialist IE/SMV optimization, automatic line balancing, and custom scheduling solvers.
- A custom Django stock ledger, accounting engine, payroll calculation engine, or universal weight-to-length conversion.
- 3D showrooms and standalone ML forecasting projects.

Ordinary ERP manufacturing remains included. A factory can report standard work-order progress manually without connecting physical equipment. Excluding specialist tooling does not require removing manufacturing, lots, scrap, or quality controls.

Existing excluded routes and records require an inventory and retirement plan. Hide them from the supported navigation during implementation, disable obsolete writes, and preserve historical data read-only until a reviewed migration/retention decision. This documentation revision does not delete code or data.

## Edition and addon decision gate

Keep self-hosted Odoo Community as the provisional baseline. Select a tested release, image digest, dependencies, and addons before feature delivery. Use licensed Enterprise when a required capability justifies it, or a verified compatible community addon. Do not assume all 13 areas ship in Community or that an older OCA addon works on the target release.

Record each capability's repository/package, exact version/commit, license, dependencies, installation evidence, permissions, maintenance owner, and cost. An unavailable addon blocks that module's completion; a menu placeholder does not satisfy delivery. Changing the Odoo release requires rerunning bridge and workflow compatibility tests.

OCA `helpdesk_mgmt` has an AGPL-3 license in the inspected 19.0 manifest; SLA support is a separate addon. Verify the selected branch rather than repeating the earlier LGPL claim. Sources: [manifest](https://raw.githubusercontent.com/OCA/helpdesk/19.0/helpdesk_mgmt/__manifest__.py), [addon inventory](https://github.com/OCA/helpdesk).

## The 13 business areas

All authoritative records below live in Odoo or an installed Odoo addon. Named technical modules are candidates, not verified availability promises. M0 in the roadmap resolves their exact providers.

| Area | Business scope and Odoo provider candidates | Texon experience | Completion evidence |
|---|---|---|---|
| Sales | `sale`, `crm`, `res.partner`; quotations, orders, payment terms, buyer references, variants | Buyer/order search, quotation and size/color order entry | Quote → authorized confirmation → amendment/partial delivery/return retains correct quantities and totals |
| Website | `portal`, `website`; customer access to orders, invoices, and documents | Branded buyer portal and public product introduction | Buyer can see only their permitted records and download an authorized document; no 3D showroom |
| Helpdesk | Verified Helpdesk addon; separately verify SLA/email dependencies | Tickets linked to orders, claims, and assigned staff | Open → assign → respond → close; buyer/company isolation and actual email delivery tested |
| Services | `project`, `hr_timesheet`; sample-development tasks, assignments, hours, and costs | Service/project overview and task detail | Sample request → assigned task → completion; authorized hours and costs match Odoo; no CAD engine |
| Appraisals | Verified appraisal addon or licensed Enterprise capability | Review schedule and authorized review forms | Review cycle, restricted feedback, approval, and history demonstrated; no telemetry-derived scoring |
| Accounting | `account` and verified localization/reporting capabilities | Financial summaries and selected invoice/payment workflows | Opening balances, customer/vendor invoices, payments, reconciliation, taxes, valuation, and period close verified by finance owner |
| Sign | Verified signing addon/provider integrated with Odoo; internal approval is a separate capability | Document preview, signer request, status, and evidence | Signer identity, exact document version/hash, consent, completed evidence, and access controls tested; internal approval alone does not complete Sign |
| Supply Chain | `purchase`, `stock`; suppliers, purchasing, receipts, lots, approvals, deliveries, and returns | Purchase/stock workspace and manual receiving/inspection | Partial receipt → hold/release → reservation → shipment/return reconciles by product, lot, and location |
| Productivity | `project`, `calendar`, activities, and verified document/knowledge provider | Tasks, deadlines, notifications, SOP access | Assign and complete task; due-date alerts and document access work; no custom critical-path engine |
| Marketing | `crm`, `mass_mailing` and verified dependencies | Lead pipeline and campaign overview | Lead → opportunity → quotation; opt-out, authorized audience, and delivery results tested |
| Human Resources | `hr`, leave/attendance/contract capabilities verified for selected edition | Employee directory, leave requests, manual attendance | Authorized employee/leave/attendance workflow and private-field restrictions tested; payroll only via verified localized Odoo capability in a later gate |
| Administration | Odoo companies, users, groups, record rules; Texon session and command permissions | Active-company selection, role-aware navigation, integration health | Cross-company/customer denial, revoked access, audit, backup, and restore demonstrated |
| Manufacturing | `mrp`; BOMs, MOs, work orders, consumption, scrap; subcontracting only after a selected workflow passes | Production list, shortage visibility, progress/completion forms | Approved BOM → MO → manual progress → actual consumption/scrap → final approval → finished goods; intermediate work cannot be shipped |

Do not treat manufacturing progress as finished stock. Use Odoo work orders for the pilot; introduce intermediate products/BOMs only if the selected route requires stock-valued WIP. Agree valuation and final-release rules with the finance/production owners before go-live.

## Demonstration lifecycle

1. Qualify a lead and prepare a buyer quotation with style/color/size variants.
2. Confirm the customer order and approved BOM revision.
3. Identify a shortage, create a supplier PO, and receive a partial delivery.
4. Record a manual quality decision and release eligible materials.
5. Confirm an MO, report work-order progress, and show remaining work and shortages.
6. Record actual consumption and scrap; finish and approve the completed goods.
7. Deliver partially, invoice, register payment, and reconcile balances.
8. Show buyer portal access and an order-linked support ticket.
9. Ask AI which orders are at risk; inspect source records and confirm a proposed follow-up task.

A second demo covers employee leave, a service task, an appraisal, a signing request, and a marketing campaign. These modules remain planned until their individual acceptance checks pass.

## Delivery policy

Use the [milestone roadmap](integration_design/04-200-commit-implementation-roadmap.md), [system architecture](integration_design/01-system-architecture-and-sync.md), and [AI plan](integration_design/05-ai-copilot-integration-plan.md).

Deliver one company, warehouse, currency/localization, and production route first. Configure accounting and approval foundations before stock/manufacturing go-live. Establish the complete pilot before expanding the remaining business areas. Estimate dates after addon validation and workflow discovery; commit counts and a twelve-month calendar are not delivery evidence.
