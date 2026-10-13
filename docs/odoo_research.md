# Odoo ERP Research (`/root/odoo_research`)

Complete research and backend analysis compiled by subagent `/root/odoo_research`.

## Contents

- **Part 1: Architecture & Technical Baseline**  
  Detailed analysis of Odoo 20.0 Community Edition, JSON-2 RPC APIs, domain ownership, garment data mapping (styles, variants, BOMs, fabric rolls/lots), and license/validation gates.  
  👉 [View Odoo Architecture Baseline](odoo_research/01-odoo-architecture-baseline.md)

- **Part 2: Texon Backend Static Audit**  
  Static audit of the Django backend at `backend/` (HEAD `539fdb37`), inventory of 105 models across 24 apps, permission/tenant analysis, and critical architectural recommendations.  
  👉 [View Backend Static Audit](odoo_research/02-backend-static-audit.md)

For a quick overview and document index, see [odoo_research/README.md](odoo_research/README.md).
