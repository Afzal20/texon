# Phase 3 — Buyer & Commercial Layer (Day 3)

---

- [ ] **3.1** Buyer model

  Fields: `org`, `name`, `country`, `currency`, `payment_terms_days`, `credit_limit`, `contact_person`, `email`, `phone`, `address`

- [ ] **3.2** BuyerPO model (the Sales Order)

  Fields: `org`, `buyer`, `po_number` (unique per org+buyer), `style` (FK, nullable at creation — style may not exist yet), `order_date`, `ex_factory_date` (ship by date), `status` (ENUM: draft/confirmed/in_production/shipped/cancelled), `total_quantity`, `currency`, `notes`

- [ ] **3.3** POLineItem model

  Fields: `po`, `color`, `size_label`, `quantity`, `unit_price`

  This is the size/color matrix. One PO = many line items (S/Navy: 500, M/Navy: 1000…)

- [ ] **3.4** **CRITICAL:** Size Ratio Calculator

  Input:

  ```python
  total_qty = 6000
  ratio = {'S': 1, 'M': 2, 'L': 2, 'XL': 1}
  ```

  Logic:

  ```python
  total_parts = sum(ratio.values())  # 6
  for size, parts in ratio.items():
      qty[size] = round((parts / total_parts) * total_qty)
  # Handle rounding remainder: add/subtract from largest size
  ```

  Output: `{'S': 1000, 'M': 2000, 'L': 2000, 'XL': 1000}`

  **Write unit test for this immediately.**

- [ ] **3.5** Costing model (linked to BuyerPO)

  Fields: `po`, `fabric_cost`, `accessories_cost`, `cm_cost`, `overhead_pct`, `profit_margin_pct`, `total_cost_usd`, `buyer_price_usd`

  **ENCRYPT:** `fabric_cost`, `accessories_cost`, `cm_cost`, `buyer_price_usd`  
  Use `django-encrypted-fields` or Fernet encryption

- [ ] **3.6** API endpoints: Buyer CRUD, PO CRUD, Costing CRUD

  - Filter POs by: status, buyer, date range, style
  - Pagination: 20 per page default

---

**Previous:** [Phase 2](phase-02-organization-master-data.md) · **Next:** [Phase 4](phase-04-product-bom.md)
