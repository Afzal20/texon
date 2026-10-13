# Season 1 — Foundation & Setup

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

Foundation layer establishing core infrastructure, authentication, and API conventions.

- [x] Set up Django + DRF backend skeleton with PostgreSQL
- [ ] Set up Next.js frontend with TypeScript, Tailwind + DaisyUI
- [ ] Implement JWT auth (djangorestframework-simplejwt) + CORS config
- [ ] Design multi-tenant data model (factory/organization scoping on every table)
- [ ] Set up role-based access control (admin, merchandiser, line supervisor)
- [ ] Set up CI basics (linting, basic test runner) and Git repo structure
- [ ] Define REST API conventions (naming, pagination, error format) for future services

## Progress Notes

_Add implementation notes here as you progress through Season 1 tasks._
