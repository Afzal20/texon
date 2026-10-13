# Season 7 — Microservices & Polyglot Expansion

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

Extracting services into microservices architecture with polyglot support.

- [ ] Extract LP + graph optimization module into a separate FastAPI service
- [ ] Define stable REST contract between Django core and optimization service
- [ ] Containerize each service with Docker
- [ ] Add a second service in Go or Rust for a performance-sensitive task (e.g. nesting computation)
- [ ] Set up basic service-to-service auth (API keys or internal JWT)
- [ ] Add logging/monitoring across services (even basic centralized logging)

## Progress Notes

_Add implementation notes here as you progress through Season 7 tasks._
