# Phase 2 — Organization & Master Data (Days 2–3)

---

- [ ] **2.1** Factory model

  Fields: `org`, `name`, `address`, `total_lines`, `total_operators`, `working_hours_per_day`, `working_days_per_week`

- [ ] **2.2** Department model

  Fields: `factory`, `name` (Cutting/Sewing/QC/Store/Finishing)

- [ ] **2.3** ProductionLine model

  Fields: `factory`, `name` (Line A, Line B…), `department`, `capacity_operators`, `machine_types` (JSONField), `is_active`

- [ ] **2.4** Operator model

  Fields: `user` (FK, nullable — some operators won't have login), `employee_id`, `name`, `department`, `skill_level`, `date_joined`, `is_active`

- [ ] **2.5** Machine model (for future predictive maintenance)

  Fields: `line`, `machine_type`, `serial_number`, `purchase_date`, `last_service_date`, `status`

- [ ] **2.6** API endpoints for all above (CRUD)

  Apply RBAC: Only Owner can create/delete; all roles can read

- [ ] **2.7** Multi-tenancy enforcement

  Create a base queryset mixin:

  ```python
  class OrgQuerySetMixin:
      def get_queryset(self):
          return super().get_queryset().filter(
              org=self.request.user.org
          )
  ```

  Apply this to **every** ViewSet — without exception.

---

**Previous:** [Phase 1](phase-01-identity-security.md) · **Next:** [Phase 3](phase-03-buyer-commercial.md)
