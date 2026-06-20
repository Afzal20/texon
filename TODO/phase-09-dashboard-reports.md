# Phase 9 — Dashboard & Reports (Day 7)

---

- [ ] **9.1** DailyKPISnapshot model (computed by Celery Beat)

  Fields: `date`, `factory`, `total_output`, `avg_line_efficiency`, `avg_dhu`, `orders_at_risk`, `fabric_received_kg`, `stock_alerts_count`

  Run nightly at midnight

- [ ] **9.2** Dashboard API endpoints

  | Method | Endpoint |
  |--------|----------|
  | GET | `/api/dashboard/kpi-today/` |
  | GET | `/api/dashboard/production-summary/?days=7` |
  | GET | `/api/dashboard/orders-timeline/` |
  | GET | `/api/dashboard/wip-by-stage/` |
  | GET | `/api/dashboard/stock-alerts/` |
  | GET | `/api/dashboard/top-defects/?order_id=` |

- [ ] **9.3** Shipment Planning model

  Fields: `po`, `planned_ship_date`, `actual_ship_date`, `vessel_name`, `bl_number`, `port_of_loading`, `port_of_destination`, `total_cartons`, `total_qty`, `status` (ENUM: planned/booked/shipped/delivered)

- [ ] **9.4** API documentation

  ```bash
  pip install drf-spectacular
  ```

  Auto-generate OpenAPI 3.0 spec  
  `/api/schema/swagger-ui/` → interactive docs  
  Share this URL with frontend developer (your future self)

---

**Previous:** [Phase 8](phase-08-lp-optimizer.md) · **Next:** [Phase 10](phase-10-frontend-shell.md)
