# Phase 5 — Inventory System (Days 4–5)

---

- [ ] **5.1** Supplier model

  Fields: `org`, `name`, `country`, `contact_person`, `email`, `phone`, `payment_terms`, `lead_time_days`, `reliability_score` (0–100, updated by system), `is_active`

- [ ] **5.2** SupplierMaterial model (price catalog)

  Fields: `supplier`, `material`, `unit_price`, `currency`, `min_order_qty`, `lead_time_days`, `valid_from`, `valid_to`

- [ ] **5.3** Warehouse model

  Fields: `org`, `name`, `code`, `type` (ENUM: raw_fabric/accessories/wip/finished_goods), `location`, `is_active`

- [ ] **5.4** Batch model (THE most important inventory model)

  Fields: `material`, `supplier`, `warehouse`, `po_reference`, `lot_number`, `received_date`, `expiry_date` (nullable), `unit_cost`, `currency`, `qty_received`, `qty_available`, `valuation_method` (ENUM: FIFO/WEIGHTED_AVG), `status` (ENUM: active/depleted/quarantined)

- [ ] **5.5** StockMovement model (IMMUTABLE LEDGER)

  Fields: `batch`, `movement_type` (ENUM: receive/issue/transfer/adjustment/return/waste), `from_warehouse` (nullable), `to_warehouse` (nullable), `quantity`, `unit_cost_at_time`, `reference_type` (PO/ProductionOrder/Adjustment), `reference_id`, `notes`, `created_by`, `created_at`

  **Rules:**

  - NEVER update or delete a StockMovement
  - If mistake: create a reversal movement

- [ ] **5.6** StockBalance model (computed/cached view)

  Fields: `material`, `warehouse`, `batch` (nullable), `qty_on_hand`, `last_updated`

  Updated by: Django signal on StockMovement save  
  Never update directly — only via movements

- [ ] **5.7** FIFO Issue Logic (service function)

  Input: `material_id`, `warehouse_id`, `qty_needed`

  ```python
  batches = Batch.objects.filter(
      material=material, warehouse=warehouse,
      valuation_method='FIFO', status='active'
  ).order_by('received_date')  # oldest first

  remaining = qty_needed
  issued = []
  for batch in batches:
      take = min(batch.qty_available, remaining)
      issued.append({batch: take, cost: take * batch.unit_cost})
      remaining -= take
      if remaining <= 0:
          break

  if remaining > 0:
      raise InsufficientStockError(remaining)
  return issued
  ```

  Test with multiple batches at different prices.

- [ ] **5.8** Safety Stock Calculator (service function)

  Input: `material_id`, `service_level` (e.g. 0.95)

  ```python
  Z = stats.norm.ppf(service_level)  # from scipy
  avg_consumption = calculate_avg_daily_consumption()
  std_consumption = calculate_std_daily_consumption()
  avg_lead_time = supplier.lead_time_days
  std_lead_time = get_lead_time_std(supplier)

  safety_stock = Z * sqrt(
      (avg_lead_time * std_consumption**2) +
      (avg_consumption**2 * std_lead_time**2)
  )
  reorder_point = (avg_consumption * avg_lead_time) + safety_stock
  ```

  Store result in `Material.reorder_point` (update nightly via Celery)

- [ ] **5.9** Celery task: `check_reorder_points()`

  Runs nightly at 10 PM  
  Compares StockBalance vs `Material.reorder_point`  
  If below: create PurchaseRequisition record + alert

- [ ] **5.10** API endpoints

  | Method | Endpoint |
  |--------|----------|
  | POST | `/api/inventory/receive/` |
  | POST | `/api/inventory/issue/` |
  | POST | `/api/inventory/transfer/` |
  | GET | `/api/inventory/balance/?material=&warehouse=` |
  | GET | `/api/inventory/movements/?batch=` |

---

**Previous:** [Phase 4](phase-04-product-bom.md) · **Next:** [Phase 6](phase-06-production-planning.md)
