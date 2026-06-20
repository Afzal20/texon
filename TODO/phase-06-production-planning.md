# Phase 6 — Production Planning (Days 5–6)

---

- [ ] **6.1** Operation model (sewing operation templates)

  Fields: `style`, `sequence` (int), `name`, `machine_type`, `smv` (Decimal), `skill_required` (ENUM: basic/intermediate/advanced), `description`

- [ ] **6.2** OperationDependency model (the DAG)

  Fields: `operation`, `depends_on` (FK to Operation)  
  This is your graph edges for CPM/PERT

- [ ] **6.3** DAG validation function

  Input: list of `(operation_id, depends_on_id)` tuples

  Logic: topological sort (Kahn's algorithm)

  - Build adjacency list
  - Find nodes with no incoming edges
  - BFS/DFS to process
  - If circular dependency found: raise `CycleError`

  This prevents logically impossible operation sequences.

- [ ] **6.4** ProductionOrder model

  Fields: `po` (FK BuyerPO), `style`, `factory`, `planned_qty`, `planned_start`, `planned_end`, `actual_start` (nullable), `actual_end` (nullable), `status` (ENUM: draft/released/in_progress/completed/cancelled), `priority` (1–5), `notes`

- [ ] **6.5** CPM Calculator (service function)

  Input: `production_order_id`

  Logic:

  1. Get all operations via OperationDependency DAG
  2. Topological sort
  3. Forward pass: `ES(i) = max(EF of predecessors)`, `EF(i) = ES(i) + duration(i)`
  4. Backward pass: `LF(i) = min(LS of successors)`, `LS(i) = LF(i) - duration(i)`
  5. `Float(i) = LF(i) - EF(i)`
  6. Critical Path = operations where Float = 0
  7. Project duration = max(EF of all operations)

  Store: `planned_end = order_date + project_duration`  
  Return critical path for display

- [ ] **6.6** LineAssignment model

  Fields: `production_order`, `line`, `planned_start`, `planned_end`, `target_qty_per_day`, `status`

  - One production order can be split across lines
  - One line can only have one active order at a time

- [ ] **6.7** Line Capacity Check (before assignment)

  Input: `line_id`, `start_date`, `end_date`, `style_smv`, `qty`

  ```python
  available_minutes = (
      line.capacity_operators *
      factory.working_hours_per_day * 60 *
      working_days_in_range(start_date, end_date) *
      0.75  # assume 75% efficiency baseline
  )
  required_minutes = qty * style_smv
  return {
      'feasible': available_minutes >= required_minutes,
      'utilization_pct': required_minutes / available_minutes * 100,
      'suggested_end_date': calculate_end_date(...),
  }
  ```

- [ ] **6.8** RPWM Line Balancing Calculator

  Input: `style_id`, `target_output_per_day`, `working_minutes`

  ```python
  cycle_time = working_minutes / target_output_per_day

  def positional_weight(op, dag):
      return op.smv + sum(
          positional_weight(s, dag)
          for s in successors(op, dag)
      )

  ranked_ops = sorted(operations, key=positional_weight, reverse=True)

  workstations = []
  current_station = []
  current_time = 0
  for op in ranked_ops:
      if current_time + op.smv <= cycle_time:
          current_station.append(op)
          current_time += op.smv
      else:
          workstations.append(current_station)
          current_station = [op]
          current_time = op.smv

  line_efficiency = sum(op.smv for op in all_ops) / (
      cycle_time * len(workstations)
  ) * 100
  ```

  Return: `{workstations, operators_needed, line_efficiency, balance_delay}`

- [ ] **6.9** OperatorAssignment model

  Fields: `production_order`, `line`, `operator`, `operation` (FK), `date`, `shift` (morning/evening/night)

- [ ] **6.10** DailyProduction model (the main floor input)

  Fields: `production_order`, `line`, `date`, `shift`, `operator_count`, `target_qty`, `actual_qty`, `reject_qty`, `alteration_qty`, `downtime_minutes`, `downtime_reason`, `reported_by`, `created_at`

  Computed property `efficiency_pct`:

  ```python
  (actual_qty * smv) / (operator_count * shift_minutes) * 100
  ```

- [ ] **6.11** WIPSnapshot model

  Fields: `production_order`, `stage`, `qty_in`, `qty_out`, `qty_at_stage`, `snapshot_time`

  Created by: Celery task every 2 hours, or triggered manually from mobile

- [ ] **6.12** API endpoints

  | Method | Endpoint |
  |--------|----------|
  | POST | `/api/production/orders/` |
  | POST | `/api/production/orders/{id}/assign-line/` |
  | GET | `/api/production/orders/{id}/cpm/` |
  | POST | `/api/production/line-balancing/` |
  | POST | `/api/production/daily-entry/` |
  | GET | `/api/production/wip/` |

---

**Previous:** [Phase 5](phase-05-inventory.md) · **Next:** [Phase 7](phase-07-quality-control.md)
