# Texon Documentation Hub

Texon is an Odoo-powered ERP workspace for garment businesses, with a tailored interface and AI assistance. Odoo owns ERP transactions; Texon makes selected workflows easier to use.

## Current implementation plan

- [Product narrative, scope, exclusions, and 13-module matrix](GARMENT_ERP_13_MODULES_MASTER_PLAN.md)
- [Integration master plan and document precedence](ODOO_INTEGRATION_MASTER_PLAN.md)
- [Milestone implementation roadmap](integration_design/04-200-commit-implementation-roadmap.md)
- [System architecture, reliable commands/events, migration, and 18 acceptance scenarios](integration_design/01-system-architecture-and-sync.md)
- [Technical implementation contracts](integration_design/03-technical-problem-solving.md)
- [AI business copilot and acceptance suite](integration_design/05-ai-copilot-integration-plan.md)
- [Odoo release, edition, API, and addon research](odoo_research/01-odoo-architecture-baseline.md)

The roadmap filename retains its old name for link compatibility; the fixed 225/240-commit sequence is superseded. Dedicated cutting/CAD, machine telemetry, biometric integrations, bundle tracking, and custom ERP calculation engines are excluded. Standard manufacturing remains included.

## Historical audits and existing system references

These describe earlier code/plans and must be checked against the current checkout. They do not override the current scope or establish completed features.

- [Backend static audit](odoo_research/02-backend-static-audit.md)
- [Frontend static audit](integration_design/02-frontend-static-audit.md)
- [Odoo research index](odoo_research/README.md)
- [Integration design index](integration_design/README.md)
- [REST API reference](backend/01-rest-api-design.md)
- [Frontend references](frontend/README.md)
- [Database schema](database-schema.md) and [YAML schema](scema.yaml)
- [Legacy TODO plans](../TODO/README.md) and [season roadmap](../seassion/SEASONS-ROADMAP.md)
