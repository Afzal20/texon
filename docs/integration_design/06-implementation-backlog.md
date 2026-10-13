# Texon: 162-Part Implementation Backlog

> Updated: 2026-10-13. Requested delivery target: more than 150 substantive commits.

## Tracking and acceptance

This backlog expands the [milestone roadmap](04-200-commit-implementation-roadmap.md) into 162 reviewable implementation parts, intended to be committed individually when complete. A part includes its implementation, relevant tests, and operational/documentation changes together. Do not create empty commits, split tests from their feature just to increase the count, or mark a feature complete from scaffolding alone.

IDs identify work, not a mandatory execution sequence. Respect milestone dependencies and provider verification. Foundation repairs can proceed while addon discovery runs. Optional providers must be resolved before their tasks are implemented; no unverified module may be advertised as working.

Completed entries link to local commit IDs as evidence. CI completion below means the workflow is authored and locally checked, not that a hosted run has passed. The root test command covers Django and frontend Vitest; real Odoo business integration tests remain separate work. PostgreSQL and SQLite backend suites now run in the CI matrix.

Current implementation evidence: 14 completed parts; 148 remaining. Provider discovery is in progress; see the [runtime provider matrix](../odoo_research/03-module-provider-matrix.md). The tracker/documentation commit itself is not counted as one of the implementation parts.

## M0 — Workflow and provider validation

- [ ] **T001** Pilot workflow, roles, and order-to-payment acceptance fixtures
- [ ] **T002** Verified Odoo core module, addon, edition, and license matrix
- [ ] **T003** Legacy model ownership and migration disposition inventory
- [ ] **T004** Frontend route/navigation retirement inventory for excluded tools
- [ ] **T005** Company, warehouse, currency, and localization deployment specification
- [ ] **T006** Financial costing, quality release, and production completion policies
- [ ] **T007** Native Odoo versus Texon screen ownership and navigation specification
- [ ] **T008** Public portfolio demo scenarios and synthetic-data specification
- [ ] **T009** Selected provider installation and workflow smoke-test tooling

## M1 — Runtime and checks

- [x] **T010** Root pnpm test command with correct Django discovery — commit `4d0e36c`
- [x] **T011** HTTP ASGI boot without the removed legacy AI routes — commit `4d8333a`
- [x] **T012** Existing model metadata migrations and clean migration drift check — commit `e4915fa`
- [x] **T013** Backend CI for locked dependencies, tests, system and migration checks — commit `8fef947`
- [x] **T014** Process liveness and database-readiness probes — commit `2ef8d61`
- [x] **T015** PostgreSQL backend configuration and real-database CI job — commit `352b46a`; both database suites verified locally
- [x] **T016** Pinned frontend runtime, compatible framework dependencies, single lockfile — commit `e74781a`; frozen install, typecheck, and production build pass; legacy lint findings remain
- [x] **T017** Frontend component test runner wired into root checks — implemented in this change; four async hook regressions and frontend CI added
- [ ] **T018** Production environment validation and safe deployment configuration

## M1 — Sessions and identity

- [ ] **T019** Server-owned session creation and login BFF
- [ ] **T020** Frontend login conversion with removal of browser JWT return/storage
- [ ] **T021** Authorized backend proxy with credential/header allowlists
- [ ] **T022** Single-flight refresh and expired-session recovery
- [ ] **T023** Logout with server invalidation and token revocation
- [ ] **T024** CSRF and trusted-origin enforcement for browser mutations
- [ ] **T025** Company selection with trusted server-side membership validation
- [ ] **T026** Current permission hydration and role-change invalidation
- [ ] **T027** Protected navigation and accessible unauthenticated/forbidden states

## M1 — Authorization and data access

- [x] **T028** Model view permission checks for data and metadata requests — commit `9c59631`
- [ ] **T029** Private employee and payroll field serialization policy
- [ ] **T030** Company-scoped records and relation validation without staff bypass
- [ ] **T031** Buyer-owned portal document and record authorization
- [ ] **T032** Generic legacy write restrictions for migrated ERP domains
- [ ] **T033** Typed pagination and bounded indexed filtering endpoints
- [ ] **T034** Operation-status and replay endpoint actor/company authorization
- [ ] **T035** Protected attachment access and safe download headers
- [ ] **T036** Audited permission administration and cross-company regression coverage

## M2 — Commands and receipts

- [x] **T037** Typed command envelope with trusted actor and tenant context — commit `f5ac3b4`
- [x] **T038** Canonical fingerprints with decimal/date-safe validation — commit `f5ac3b4`
- [ ] **T039** Persisted command/outbox model and transactional enqueue service
- [ ] **T040** Worker batch claiming with leases and expired-claim recovery
- [ ] **T041** Retry classification, capped backoff, jitter, and unknown outcomes
- [x] **T042** Odoo command allowlist and independent business authorization
- [x] **T043** Atomic command receipts with concurrent original-result replay
- [x] **T044** Expected revisions and competing business-transition locking
- [ ] **T045** Frontend command submission and truthful operation-status tracking

## M2 — Events and reconciliation

- [ ] **T046** Durable Odoo event outbox committed with business effects
- [ ] **T047** Native Odoo change hooks for supported business records
- [ ] **T048** Authenticated event publisher with retry and acknowledgment
- [ ] **T049** Django inbox deduplication and atomic projection application
- [ ] **T050** Aggregate revision ordering and stale-event authoritative refetch
- [ ] **T051** Scheduled stock/order/production/finance reconciliation
- [ ] **T052** Integration freshness and synchronization health dashboard
- [ ] **T053** Dead-letter triage with authorized safe replay
- [ ] **T054** Receipt/event retention, archive policy, and operational alerts

## M3 — Partners, products, and specifications

- [ ] **T055** Odoo partner external identity mapping and scoped projections
- [ ] **T056** Buyer and supplier search/create/update workflows
- [ ] **T057** Garment product template metadata in Odoo
- [ ] **T058** Color/size attributes and stable SKU variant mapping
- [ ] **T059** Texon style matrix entry with server validation
- [ ] **T060** Odoo BOM editor with variant component applicability
- [ ] **T061** Approved BOM revisions protected across native/API paths
- [ ] **T062** Production-order approved specification pinning
- [ ] **T063** Resumable partner/catalog import and mapping reconciliation

## M3 — Sales

- [ ] **T064** Odoo quotation creation with buyer references and terms
- [ ] **T065** Texon quotation/order list and authorized detail views
- [ ] **T066** Size/color sales line matrix with precise quantities/prices
- [ ] **T067** Atomic sales order confirmation with current-state validation
- [ ] **T068** Legacy duplicate order consolidation and reference preservation
- [ ] **T069** Controlled order amendment with revision conflict handling
- [ ] **T070** Order cancellation with dependent workflow safeguards
- [ ] **T071** Order shortage and expected-delivery overview
- [ ] **T072** Sales document export and buyer-facing approved status mapping

## M3 — Purchasing

- [ ] **T073** Material requisition submission against approved demand
- [ ] **T074** Supplier quotation and price comparison from Odoo records
- [ ] **T075** Supplier purchase order draft creation and line validation
- [ ] **T076** Purchase confirmation with required authorization
- [ ] **T077** Expected receipt dates and supplier follow-up tasks
- [ ] **T078** Partial supplier receipt and residual backorder handling
- [ ] **T079** Supplier returns with lot and document traceability
- [ ] **T080** Purchase amendment/cancellation with receipt/bill safeguards
- [ ] **T081** Texon purchase workspace with actual synchronization outcomes

## M3 — Inventory and quality

- [ ] **T082** Warehouse/location mapping and compatible UOM validation
- [ ] **T083** Lot-based material receipt with measured attributes
- [ ] **T084** On-hand/reserved/available/held stock read projections
- [ ] **T085** Manual inspection decision and quality release history
- [ ] **T086** Quarantine reservation guards across native Odoo stock paths
- [ ] **T087** Consumption/shipment completion guards for held goods
- [ ] **T088** Authorized internal transfer workflow
- [ ] **T089** Count adjustment with approval and traceable discrepancy reason
- [ ] **T090** Lot genealogy and stock reconciliation reporting

## M4 — Manufacturing and shipment

- [ ] **T091** Manufacturing order creation from approved variant demand
- [ ] **T092** Manufacturing list/detail and shortage visibility
- [ ] **T093** Standard work-order manual progress recording
- [ ] **T094** Actual lot consumption and remaining material reconciliation
- [ ] **T095** Scrap/offcut recording without duplicate consumption
- [ ] **T096** Partial production and backorders with WIP/final-stock separation
- [ ] **T097** Final completion and quality-release approval workflow
- [ ] **T098** Packing, partial delivery, and customer return workflows
- [ ] **T099** Selected subcontract route with component/cost reconciliation

## M4 — Finance

- [ ] **T100** Approved opening balances and localization setup checks
- [ ] **T101** Customer invoice draft creation from eligible sales/delivery
- [ ] **T102** Invoice posting with accounting permissions and period locks
- [ ] **T103** Supplier bills linked to purchasing and receipt records
- [ ] **T104** Customer/vendor payment registration and balance projections
- [ ] **T105** Bank statement matching and reconciliation workflow
- [ ] **T106** Credit notes and selected return/reversal linkage
- [ ] **T107** Stock/manufacturing valuation and cost reconciliation reports
- [ ] **T108** Financial dashboard and period-close acceptance workflow

## M5 — Website and Helpdesk

- [ ] **T109** Branded public product introduction and honest feature status
- [ ] **T110** Buyer portal invitation and authorized account association
- [ ] **T111** Buyer order/milestone and delivery views
- [ ] **T112** Buyer invoice/document access with private-field filtering
- [ ] **T113** Buyer-initiated order-linked ticket creation
- [ ] **T114** Internal ticket triage, assignment, and status workflow
- [ ] **T115** Authorized ticket replies and email routing
- [ ] **T116** Verified SLA rules and overdue-ticket notification
- [ ] **T117** Portal accessibility, empty/error states, and ownership regression suite

## M5 — Services and Productivity

- [ ] **T118** Sample-development project creation and buyer/order linkage
- [ ] **T119** Project task assignment and due-date workflow
- [ ] **T120** Authorized service hours and Odoo timesheet entry
- [ ] **T121** Service project cost and completion overview
- [ ] **T122** Calendar/activity views with scoped task references
- [ ] **T123** Due-date reminders with deduplication and delivery status
- [ ] **T124** Permission-controlled SOP/document storage provider integration
- [ ] **T125** Document revision and authorized search/download workflow
- [ ] **T126** Unified tasks/projects workspace and completion reporting

## M5 — CRM and Marketing

- [ ] **T127** Lead capture and deduplicated contact association
- [ ] **T128** Opportunity pipeline and authorized stage transitions
- [ ] **T129** Opportunity-to-quotation conversion with preserved references
- [ ] **T130** Lead assignment and follow-up activity management
- [ ] **T131** Campaign audience selection with scoped recipient access
- [ ] **T132** Campaign content and lookbook document association
- [ ] **T133** Consent, unsubscribe, and suppression enforcement
- [ ] **T134** Controlled campaign dispatch with delivery/error reporting
- [ ] **T135** CRM/campaign performance dashboard from actual Odoo results

## M6 — HR, Appraisals, and Sign

- [ ] **T136** Authorized employee directory and private-field separation
- [ ] **T137** Leave requests, approval, and balance display
- [ ] **T138** Manual attendance entry and authorized correction history
- [ ] **T139** Employee department/contract workflows in selected Odoo provider
- [ ] **T140** Appraisal templates, review cycles, and restricted feedback
- [ ] **T141** Appraisal approval and immutable review history
- [ ] **T142** Signing provider and exact document-version request workflow
- [ ] **T143** Signer access/consent and completed artifact evidence
- [ ] **T144** Internal approval workflow distinct from signature execution

## M7 — AI assistant

- [ ] **T145** AI HTTP application, provider selection, and bounded adapters
- [ ] **T146** Conversation ownership, retention, and authorized history APIs
- [ ] **T147** Session-authenticated BFF streaming and cancellation UI
- [ ] **T148** Typed permission-aware tool executor and context/result limits
- [ ] **T149** Order, shortage, manufacturing, and finance read tools
- [ ] **T150** Gated task/ticket/HR/document tools with source access filtering
- [ ] **T151** Evidence/freshness-linked answers and module-aware suggestions
- [ ] **T152** Server-owned expiring proposals with confirmed command dispatch
- [ ] **T153** Adversarial/security/quality evaluation, cost limits, and provider runbook

## M8 — Migration and release

- [ ] **T154** Deterministic legacy import mappings and reject reports
- [ ] **T155** Resumable dependency-ordered migration batches
- [ ] **T156** Opening stock/open documents/balances/attachments reconciliation
- [ ] **T157** Excluded legacy navigation and write-API retirement
- [ ] **T158** Controlled write-freeze and delta-cutover tooling
- [ ] **T159** Consistent dual-database/filestore backup and restore rehearsal
- [ ] **T160** Command/event replay and operational recovery runbook
- [ ] **T161** Complete pilot browser/runtime acceptance and performance checks
- [ ] **T162** Public synthetic demo, evidence-backed case study, and release checklist
