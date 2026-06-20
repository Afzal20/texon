# Phase 1 — Identity & Security Core (Days 1–2)

This must be perfect. Everything else depends on it.

---

- [ ] **1.1** Custom User model (`accounts/models.py`)

  **CRITICAL:** Do this **before** first migration.

  Fields: `email` (login, not username), `org_id`, `is_active`, `last_login_ip`, `failed_login_count`, `mfa_secret` (nullable for now)

  ```python
  AUTH_USER_MODEL = 'accounts.User'
  ```

- [ ] **1.2** Organization model

  Fields: `name`, `slug`, `subscription_plan`, `is_active`, `timezone`, `currency`

- [ ] **1.3** Role & Permission system

  Models: `Role`, `Permission`, `UserRole`, `RolePermission`

  Seed data: Owner, ProductionManager, Merchandiser, StoreManager, QCInspector, Operator

- [ ] **1.4** AuditLog model (`accounts/models.py`)

  Fields: `user`, `action` (CREATE/UPDATE/DELETE), `resource_type`, `resource_id`, `old_value` (JSONField), `new_value` (JSONField), `ip_address`, `user_agent`, `timestamp` (auto)

  **Rule:** NEVER delete audit logs

- [ ] **1.5** LoginHistory model

  Fields: `user`, `ip_address`, `device_type`, `browser`, `success` (bool), `failure_reason`, `timestamp`

- [ ] **1.6** AuditLog middleware

  - Intercepts all POST/PUT/PATCH/DELETE requests
  - Logs before and after state
  - Gets IP from `X-Forwarded-For` (nginx will set this)

- [ ] **1.7** JWT Authentication

  | Endpoint | Purpose |
  |----------|---------|
  | `POST /api/auth/login/` | Returns access + refresh tokens |
  | `POST /api/auth/refresh/` | Refresh token rotation |
  | `POST /api/auth/logout/` | Blacklist refresh token in Redis |
  | `GET /api/auth/me/` | Current user + permissions |

- [ ] **1.8** Permission decorator + DRF permission class

  ```python
  @require_permission('production_order.approve')
  ```

  Checks: `UserRole` → `RolePermission` → `Permission`

- [ ] **1.9** Rate limiting

  - Login endpoint: 5 attempts per 15 minutes per IP
  - API global: 1000 requests per hour per user
  - Use Django Ratelimit or DRF throttling

- [ ] **1.10** Run first migrations, test auth flow with Postman/Thunder Client

---

**Previous:** [Phase 0](phase-00-environment-setup.md) · **Next:** [Phase 2](phase-02-organization-master-data.md)
