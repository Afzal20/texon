# Odoo Integration Design & Frontend Audit (`/root/integration_design`)

This directory contains the end-to-end integration architecture, data consistency model, acceptance criteria, and frontend codebase audit produced by the `/root/integration_design` subagent.

## Documents

1. [01-system-architecture-and-sync.md](01-system-architecture-and-sync.md)
   - **System boundaries & domain ownership**: Odoo owns physical stock, orders, BOMs, MRP, and accounting; Texon owns garment UI, collaboration, and read projections.
   - **Cross-system consistency engine**: Transactional outbox pattern, idempotent operation UUIDs, Odoo command receipts, timeout handling, and delivery deduplication.
   - **Apparel domain modeling**: Style/variant matrices, frozen BOM revisions per production order, fabric roll traceability via lots, single stock UOM in meters/yards with measured attributes.
   - **Migration & cutover protocol**: Phased dependency import, deterministic external references, legacy write freeze, delta reconciliation, dual backup restore rehearsal.
   - **15 Concrete Acceptance Scenarios**: Rigorous test scenarios covering duplicate delivery, timeouts, concurrency, variant BOMs, quality holds, and backup recovery.
   - **Commit roadmap (>200 commits)**: Structured implementation strategy grouping reviewable changes with paired tests.

2. [02-frontend-static-audit.md](02-frontend-static-audit.md)
   - **Static UI inventory**: 210 `page.tsx` routes, 199 `"use client"` components, 24 API modules, 0 error/loading boundaries.
   - **Critical frontend findings**: Contradictory transport documentation (GraphQL vs REST), duplicate JWT stores in cookie + localStorage, session secret fallback risks, unpopulated login permissions, error swallowing across fetch helpers, and client-side pagination loops.
   - **Commercial naming disambiguation**: Disambiguating buyer POs (sales orders) from supplier POs (procurement).
   - **6-Phase Migration Priorities**: Foundation, Identity, Shared Data Layer, Core Garment Flow, UI Upgrades, and Testing.
   - **12 Frontend Acceptance Criteria**: Detailed validation rules for session handling, error states, and idempotency.

3. [03-technical-problem-solving.md](03-technical-problem-solving.md)
   - **Deep Architectural Solutions**: Authority matrix, outbox/inbox schema, Odoo JSON-2 RPC transport, atomic `texon_bridge` addon, multi-tenant company isolation, DRF security fixes, garment variant matrices, frozen BOM revisions, roll lot tracking, UOM traps, and Next.js cookie session unification.

4. [04-200-commit-implementation-roadmap.md](04-200-commit-implementation-roadmap.md)
   - **The 225-Commit Implementation & Testing Roadmap**: Detailed breakdown of 225 sequentially numbered, atomic git commits across 10 sequential epics. Every commit specifies target files, implementation intent, and paired test acceptance criteria for engineers and QA testers.

5. [05-ai-copilot-integration-plan.md](05-ai-copilot-integration-plan.md)
   - **AI Copilot Architecture & Phase 11 Roadmap**: Architecture reviving `backend/ai` with WebSocket streaming via Django Channels, 4 specialized apparel copilot skills, Human-in-the-Loop action confirmation cards, and a dedicated 15-commit backlog (`COMMIT-226` to `240`).


