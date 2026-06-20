# Texon — Implementation Roadmap

This folder contains the full tech stack decision and phased implementation todo list for the garments ERP project.

**Follow the phases in order.** Each phase's models are foreign keys in the next. Start at [Phase 0](phase-00-environment-setup.md) and do not skip ahead.

## Contents

| File | Description |
|------|-------------|
| [tech-stack.md](tech-stack.md) | Stack decisions: backend, frontend, UI, infrastructure |
| [phase-00-environment-setup.md](phase-00-environment-setup.md) | Day 1 — environment & project scaffolding |
| [phase-01-identity-security.md](phase-01-identity-security.md) | Days 1–2 — auth, RBAC, audit logs |
| [phase-02-organization-master-data.md](phase-02-organization-master-data.md) | Days 2–3 — factories, lines, operators |
| [phase-03-buyer-commercial.md](phase-03-buyer-commercial.md) | Day 3 — buyers, POs, costing |
| [phase-04-product-bom.md](phase-04-product-bom.md) | Days 3–4 — styles, BOM, explosion |
| [phase-05-inventory.md](phase-05-inventory.md) | Days 4–5 — stock, FIFO, reorder points |
| [phase-06-production-planning.md](phase-06-production-planning.md) | Days 5–6 — CPM, line balancing, WIP |
| [phase-07-quality-control.md](phase-07-quality-control.md) | Day 6 — AQL, DHU, inspections |
| [phase-08-lp-optimizer.md](phase-08-lp-optimizer.md) | Days 6–7 — PuLP line assignment |
| [phase-09-dashboard-reports.md](phase-09-dashboard-reports.md) | Day 7 — KPIs, shipment planning, API docs |
| [phase-10-frontend-shell.md](phase-10-frontend-shell.md) | Parallel — Next.js app shell |
| [pre-factory-visit-checklist.md](pre-factory-visit-checklist.md) | End of week 1 demo checklist |
| [once-off-tasks.md](once-off-tasks.md) | One-time setup (Sentry, CI, domain, etc.) |

## The One Rule to Follow Every Day

```
Write the model → Write the service logic →
Write unit tests for the logic → Write the API endpoint →
Test in Postman → Commit to GitHub
```

Never commit untested business logic. Your safety stock formula, FIFO logic, BOM explosion, and CPM calculator must have unit tests. These are the algorithms you'll explain to factory owners. If they're wrong, you lose credibility immediately.

## Current Repo Note

This Django backend lives at the repo root (`texon`). The plan originally described a monorepo with `/backend` and `/frontend`; adapt paths as you add the Next.js frontend (e.g. `/frontend` at repo root or a separate repo).
