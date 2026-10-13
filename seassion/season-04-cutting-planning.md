# Season 4 — Cutting Planning (Graph & Bin Packing)

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

Implementing cutting order planning and marker making optimization using graph theory and bin packing.

- [ ] Implement Cutting Order Planning as bipartite matching/network flow (NetworkX)
- [ ] Implement simplified Marker Making as 2D bin-packing (rectpack library)
- [ ] Build fabric-waste comparison: naive layout vs optimized layout
- [ ] Visualize marker/nesting output (simple canvas/SVG rendering)
- [ ] API endpoints to trigger and fetch cutting plans
- [ ] Document this as "simplified demo" vs real commercial nesting software

## Progress Notes

_Add implementation notes here as you progress through Season 4 tasks._
