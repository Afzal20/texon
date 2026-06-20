# Phase 7 — Quality Control (Day 6)

---

- [ ] **7.1** AQL Sampling Table (hard-code as Python dict)

  From ISO 2859-1 standard:

  ```python
  {lot_range: {inspection_level: {sample_size, accept, reject}}}
  ```

  This is public domain data, safe to use.

- [ ] **7.2** AQL Calculator function

  Input: `lot_size`, `aql_level` (1.0/1.5/2.5/4.0), `inspection_level` (I/II/III)

  Output: `{sample_size, accept_number, reject_number}`

- [ ] **7.3** QCInspection model

  Fields: `production_order`, `stage` (ENUM: inline/end_line/final), `inspector`, `inspection_date`, `lot_size`, `sample_size`, `critical_defects`, `major_defects`, `minor_defects`, `decision` (ENUM: pass/fail/conditional), `dhu` (computed), `aql_level`, `notes`

- [ ] **7.4** DefectRecord model

  Fields: `inspection`, `defect_type` (ENUM: broken_stitch/skip_stitch/hole/measurement_issue/shading/etc), `qty`, `operation` (which sewing op caused it)

- [ ] **7.5** DHU Calculator (auto-computed on save)

  ```python
  dhu = (total_defects / pieces_checked) * 100
  ```

- [ ] **7.6** QC Report

  Per order, per line, per inspector  
  Show trend: DHU improving or worsening?  
  Alert: if DHU > 3.0 → notify Production Manager

- [ ] **7.7** API endpoints

  | Method | Endpoint |
  |--------|----------|
  | POST | `/api/quality/inspections/` |
  | GET | `/api/quality/inspections/?order=&stage=` |
  | GET | `/api/quality/aql-lookup/?lot_size=&aql=` |
  | GET | `/api/quality/report/?order_id=` |

---

**Previous:** [Phase 6](phase-06-production-planning.md) · **Next:** [Phase 8](phase-08-lp-optimizer.md)
