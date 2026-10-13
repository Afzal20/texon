# Odoo ERP Research & Backend Audit (`/root/odoo_research`)

This directory contains the complete technical research and static codebase analysis conducted by the `/root/odoo_research` subagent for integrating Texon with Odoo ERP.

## Documents

1. [01-odoo-architecture-baseline.md](01-odoo-architecture-baseline.md)
   - **Odoo 20.0 Community baseline**: Python 3.12–3.14, PostgreSQL 16+, support lifecycle through Sept 2029.
   - **Hosting & edition analysis**: Self-hosted Community vs. Enterprise vs. Odoo.sh vs. Odoo Online.
   - **JSON-2 RPC API specification**: `POST /json/2/<model>/<method>`, bearer scope `rpc`, removal of legacy `db` service.
   - **Critical integration design**: One authority per domain, reliable commands with operation UUIDs, transactional outbox/inbox, command authorization.
   - **Garment domain mapping**: Styles → `product.template`, Size/Color → `product.product`, fabric roll tracking via `stock.lot`, variant BOM rules, UOM version traps.
   - **License & validation gates**: LGPL-3 compliance, test matrix for distributed consistency.

2. [02-backend-static-audit.md](02-backend-static-audit.md)
   - **Critical integration findings**: Static audit of `backend/` identifying dynamically generated CRUD gateway, DRF permission loopholes, lack of tenant boundaries, mutable business records, duplicate order models (`orders` vs `merchandising`), and inventory movement reference gaps.
   - **Retained security assets**: JWT session auth, user profile serializers, `users.*` and `roles.manage` RBAC enforcement.
   - **Complete Model Inventory**: 105 model classes across 24 local Django applications and 103 REST endpoints.
   - **Migrations & Test Coverage**: 41 migration files, 16 concrete test methods in auth/RBAC.
   - **Pilot scope recommendation**: Single meaningful garment lifecycle (Style/variant order → Odoo sale/MRP → Lot receipt/QC → Consumption → Production → Shipment → Invoice).
