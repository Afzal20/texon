# Odoo Integration Design (`/root/integration_design`)

Complete system architecture and frontend analysis compiled by subagent `/root/integration_design`.

## Contents

- **Part 1: Integration Architecture, Consistency & 15 Acceptance Scenarios**  
  System boundaries, transactional outbox pattern, idempotent operation UUIDs, apparel domain rules, cutover strategy, 15 concrete acceptance scenarios, and the >200 commits implementation roadmap.  
  👉 [View Integration Architecture & Sync](integration_design/01-system-architecture-and-sync.md)

- **Part 2: Texon UI Frontend Static Audit**  
  Static audit of 210 `page.tsx` routes in `frontend/texon-ui/`, transport analysis (REST vs GraphQL), authentication token stores, client-side pagination pitfalls, and UI migration priorities.  
  👉 [View Frontend Static Audit](integration_design/02-frontend-static-audit.md)

- **Part 3: Deep Technical Problem Solving**  
  Exhaustive architectural solutions for authority boundaries, outbox/inbox engine, JSON-2 transport, atomic `texon_bridge` Odoo addon, tenant isolation, variant matrices, and frozen BOMs.  
  👉 [View Deep Technical Problem Solving](integration_design/03-technical-problem-solving.md)

- **Part 4: The 225-Commit Implementation & Testing Roadmap**  
  Full catalog of 225 sequentially numbered, atomic git commits across 10 sequential epics with target files, implementation intent, and paired test acceptance criteria.  
  👉 [View 225-Commit Implementation Roadmap](integration_design/04-200-commit-implementation-roadmap.md)

- **Part 5: AI Copilot Architecture & Phase 11 Roadmap**  
  Modernized AI architecture reviving `backend/ai` with Django Channels streaming, 4 specialized apparel skills, and 15 implementation commits (`COMMIT-226` to `240`).  
  👉 [View AI Copilot Integration Plan](integration_design/05-ai-copilot-integration-plan.md)

- **Master Architectural Blueprint:**  
  👉 [View ODOO_INTEGRATION_MASTER_PLAN.md](ODOO_INTEGRATION_MASTER_PLAN.md)


For a quick overview and document index, see [integration_design/README.md](integration_design/README.md).

