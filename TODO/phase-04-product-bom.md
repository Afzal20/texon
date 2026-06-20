# Phase 4 — Product (Style) & BOM (Days 3–4)

---

- [ ] **4.1** Style model

  Fields: `org`, `style_code` (auto-generate or manual), `buyer` (FK), `description`, `category` (ENUM: shirt/pant/jacket/dress/etc), `season`, `fabric_composition`, `smv` (DecimalField), `status` (ENUM: active/archived), `image_url` (S3 later, local for now)

- [ ] **4.2** StyleColor model

  Fields: `style`, `color_name`, `color_hex_code`

- [ ] **4.3** StyleSize model

  Fields: `style`, `size_label`, `sort_order`  
  (`sort_order` ensures S < M < L < XL in reports)

- [ ] **4.4** BOM (Bill of Materials header)

  Fields: `style`, `version` (integer, auto-increment), `is_approved` (bool), `approved_by` (FK User), `approved_at`, `notes`

  **Rules:**

  - Only **one** approved BOM per style at a time
  - New version creation auto-unapproves old

- [ ] **4.5** Material model (the ingredient catalog)

  Fields: `org`, `code`, `name`, `category` (ENUM: fabric/thread/button/zipper/label/poly_bag/carton/other), `unit` (ENUM: kg/meter/pcs/roll), `description`, `is_active`

- [ ] **4.6** BOMLine model (ingredients)

  Fields: `bom`, `material` (FK), `qty_per_piece` (Decimal), `wastage_pct` (Decimal, default=0), `unit`, `size_variation` (JSONField, nullable)

  `size_variation` example:

  ```json
  {"S": 0.280, "M": 0.285, "L": 0.295, "XL": 0.310}
  ```

  If null, same qty for all sizes.

- [ ] **4.7** **CRITICAL:** BOM Explosion function

  Input: `bom_id`, `po_line_items` (list of `{size, qty}`)

  Logic for each BOM line:

  ```python
  if size_variation:
      total = sum(
          qty_map[size] * size_variation[size] * (1 + wastage)
          for size, qty in po_line_items
      )
  else:
      total_pieces = sum(qty for _, qty in po_line_items)
      total = total_pieces * qty_per_piece * (1 + wastage)
  ```

  Output: `{material_id: required_qty, ...}`

  This is the heart of your procurement logic. **Write comprehensive unit tests.**

- [ ] **4.8** MaterialRequirement model

  Created by BOM Explosion, linked to PO

  Fields: `po`, `material`, `required_qty`, `unit`, `calculated_at`  
  Used to generate purchase requisitions

- [ ] **4.9** API endpoints

  - Style CRUD
  - BOM CRUD (with versioning)
  - BOM Explosion: `POST /api/bom/{id}/explode/` with `po_id` in body

---

**Previous:** [Phase 3](phase-03-buyer-commercial.md) · **Next:** [Phase 5](phase-05-inventory.md)
