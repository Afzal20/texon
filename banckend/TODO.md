# TODO – Texton ERP Backend Development

## Completed
- Models & admin for all 12 apps
- Orders app REST API (serializers, viewsets, URLs)
- GraphQL endpoint and orders schema
- WebSocket ASGI scaffolding & JWT middleware stub
- Settings: CORS, auditlog, DRF defaults, pagination placeholder
- Initial verification (`manage.py check` passes)

## Remaining Tasks
### 1. API Layer for Remaining Apps
- Create full ModelSerializers for `production`, `planning`, `inventory`, `cutting`, `costing`, `hr`, `compliance`, `ai_insights`, `notifications`, `reports`
- Implement ViewSets with CRUD + custom actions where needed (e.g., real‑time stats, Gantt planning, stock alerts)
- Register routes via `DefaultRouter` under `/api/v1/`
- Apply appropriate permissions (group‑based, admin‑only)

### 2. Permissions & Access Control
- Write custom permission classes (`IsGroupMember`, `IsAdminOrReadOnly`)
- Add object‑level checks for sensitive models
- Ensure admin‑only endpoints hide admin info from non‑admin users

### 3. Pagination, Filtering & Ordering
- Define a global pagination class (PageNumberPagination or LimitOffset)
- Add `django-filter` backends to viewsets
- Enable ordering fields where appropriate

### 4. Testing
- Unit tests for each serializer (field validation)
- ViewSet tests for status codes, permissions, custom actions
- Integration tests for GraphQL queries and WebSocket connections

### 5. Celery Tasks
- Set up `celery.py` and broker config
- Implement tasks: daily stock reconciliation, order stage roll‑up, AI model retraining, email OTP cleanup
- Add periodic schedule entries in `celery beat`

### 6. WebSocket Consumers
- Implement consumers for real‑time dashboards:
  - Production KPIs (`production/consumers.py`)
  - Inventory stock updates (`inventory/consumers.py`)
  - Notification push service (`notifications/consumers.py`)
- Register routes in `config/routing.py` and include in ASGI

### 7. GraphQL Extensions
- Add GraphQL types for the other apps (e.g., `ProductionUnitType`, `EmployeeType`)
- Provide read‑only queries; keep mutations via REST for validation

### 8. Security Hardening
- Enforce HTTPS, HSTS, CSP, Referrer‑Policy in production settings
- Review JWT token lifetime and refresh strategy
- Verify CSRF protection for session‑based endpoints

### 9. Documentation & OpenAPI
- Generate Swagger/OpenAPI spec (`spectacular --file schema.yml`)
- Add operation IDs and description docs for each endpoint
- Publish API docs for frontend team

### 10. Deployment Preparation
- Write Dockerfile and docker‑compose (Daphne + Gunicorn + Celery workers)
- Create Nginx config for static/media and WebSocket proxy
- Define environment variable placeholders for secrets (DB, Redis, Email, JWT)

---
*Keep this file updated as tasks are completed.*
