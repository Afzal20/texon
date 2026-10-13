# Phase 8 — Basic LP Optimizer (Days 6–7)

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

---

- [ ] **8.1** Install PuLP

  ```bash
  pip install pulp
  ```

- [ ] **8.2** Write `OrderLineOptimizer` service

  Input: list of pending production orders, list of available lines with capacities

  ```python
  from pulp import LpProblem, LpVariable, LpMaximize, lpSum

  prob = LpProblem("line_assignment", LpMaximize)

  # x[i][j] = fraction of order i on line j
  x = {
      (i, j): LpVariable(f"x_{i}_{j}", 0, 1)
      for i in orders for j in lines
  }

  # Objective: maximize orders completed on time
  prob += lpSum(priority[i] * x[i, j] for i in orders for j in lines)

  # Constraint: each order fully assigned
  for i in orders:
      prob += lpSum(x[i, j] for j in lines) == 1

  # Constraint: line capacity not exceeded
  for j in lines:
      prob += lpSum(
          x[i, j] * smv_minutes[i] for i in orders
      ) <= capacity[j]

  prob.solve()
  ```

  Return: optimal assignment + utilization per line

- [ ] **8.3** Expose as API endpoint

  ```
  POST /api/planning/optimize/
  Body: {order_ids: [...], date_range: {...}}
  Returns: {assignments, utilization, warnings}
  ```

  Run as Celery task (LP can take seconds for large problems)

---

**Previous:** [Phase 7](phase-07-quality-control.md) · **Next:** [Phase 9](phase-09-dashboard-reports.md)
