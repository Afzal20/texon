# Texon Integration Design

Follow the [162-part implementation tracker](06-implementation-backlog.md) for individual parts and commit evidence.

> Revised: 2026-10-13. Odoo owns ERP business records; Texon provides the workspace, portal, and AI assistant.

Read the [product scope](../GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [master plan](../ODOO_INTEGRATION_MASTER_PLAN.md) first.

| Document | Purpose |
|---|---|
| [System architecture](01-system-architecture-and-sync.md) | Ownership, tenant/company boundaries, commands/events, migration, and 18 acceptance scenarios |
| [Frontend static audit](02-frontend-static-audit.md) | Historical code findings to recheck, not the current product scope |
| [Technical contracts](03-technical-problem-solving.md) | Typed authorization, receipts, crash recovery, stock/finance, and sessions |
| [Milestone roadmap](04-200-commit-implementation-roadmap.md) | M0–M8 dependency gates covering all 13 business areas and pilot release |
| [AI copilot plan](05-ai-copilot-integration-plan.md) | Session-based HTTP streaming, evidence-backed tools, server-owned proposals, and evaluation |

The old fixed 225/240-commit instructions and WebSocket/JWT AI plan are superseded. Preserve existing links to the roadmap filename. Specialist cutting/CAD, device integration, floor telemetry, bespoke optimization, and duplicate stock/accounting/payroll engines are outside delivery scope.
