# Season 3 — Production Scheduling (Linear Programming)

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

Implementing linear programming-based production scheduling to optimize line allocation.

- [ ] Model the line-allocation problem (orders → lines, deadlines, capacity)
- [ ] Implement LP solver using OR-Tools or PuLP
- [ ] Build synthetic dataset to test scheduling output
- [ ] Expose scheduling result via API endpoint
- [ ] Gantt chart visualization in Next.js (e.g. with a React Gantt library)
- [ ] Add rush-order/priority handling (compare with simple SJF baseline)
- [ ] Write before/after metrics (e.g. line idle time reduced by X%)

## Progress Notes

_Add implementation notes here as you progress through Season 3 tasks._
