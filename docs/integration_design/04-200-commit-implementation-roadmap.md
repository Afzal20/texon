# The 225-Commit Implementation & Testing Roadmap: Texon Odoo ERP Adaptation

> **Author:** Principal Enterprise Architect  
> **Target Audience:** Lead Full-Stack Engineers, Odoo Developers, QA Automation Engineers  
> **Standard:** Conventional Commits (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`)  
> **Total Planned Commits:** 225 Commits across 10 Sequential Epics  

---

## Architectural Rules for Implementing Developers and QA Testers

1. **Atomic Commits:** Each numbered item below is an independent, reviewable git commit. Do not combine multiple items into a giant commit.
2. **Paired Test Rule:** Every commit that introduces logic, fixes a bug, or alters a schema **must include its corresponding unit or integration test** in the same commit. Never defer test writing.
3. **Strict Zero-Drift Mandate:** No direct SQL writes against Odoo tables. All interactions must go through the transactional outbox and `texon_bridge` JSON-2 RPC interface.
4. **Tenant Isolation:** Every command and query must explicitly pass and validate `company_id`.

---
### `COMMIT-001`: chore(toolchain): pin Node.js and Next.js dependencies in frontend

- **Target Files:**
  - `frontend/texon-ui/package.json`
  - `frontend/texon-ui/.node-version`
- **Implementation Intent:** Pin Node.js to v20.18.0 LTS and Next.js to 15.1.0 to eliminate dynamic latest resolution drift.
- **Acceptance & Paired Tests:** Verify 'npm ls' or 'pnpm ls' resolves without version warnings; build reproduces deterministically.

### `COMMIT-002`: chore(toolchain): remove conflicting lockfiles and standardize on single package manager

- **Target Files:**
  - `frontend/texon-ui/package-lock.json`
  - `frontend/texon-ui/pnpm-lock.yaml`
- **Implementation Intent:** Delete redundant package-lock.json and standardize purely on pnpm across frontend repository.
- **Acceptance & Paired Tests:** Verify only pnpm-lock.yaml exists; running pnpm install produces zero lockfile changes.

### `COMMIT-003`: fix(asgi): remove stale ai.routing import causing expected ASGI startup crash

- **Target Files:**
  - `backend/config/asgi.py`
- **Implementation Intent:** Remove reference to non-existent backend/ai/routing.py in ASGI protocol router.
- **Acceptance & Paired Tests:** Run 'daphne -b 0.0.0.0 -p 8000 config.asgi:application --dry-run' and verify clean boot.

### `COMMIT-004`: chore(backend): add pyproject.toml and pytest-django test harness

- **Target Files:**
  - `backend/pyproject.toml`
  - `backend/pytest.ini`
  - `backend/tests/conftest.py`
- **Implementation Intent:** Configure pytest with pytest-django, database fixtures, and test settings for automated execution.
- **Acceptance & Paired Tests:** Execute 'pytest' and verify test runner discovers and executes existing tests.

### `COMMIT-005`: chore(docker): create docker-compose for PostgreSQL, Redis and Odoo 20 CE development

- **Target Files:**
  - `docker-compose.yml`
  - `docker/odoo.conf`
  - `docker/Dockerfile.odoo`
- **Implementation Intent:** Define multi-container environment with Postgres 16, Redis 7, and Odoo 20.0 Community Edition.
- **Acceptance & Paired Tests:** Execute 'docker compose up -d' and verify Postgres, Redis, and Odoo 20 health checks return 200.

### `COMMIT-006`: chore(ci): add GitHub Actions workflow for linting and test execution

- **Target Files:**
  - `.github/workflows/ci.yml`
- **Implementation Intent:** Create CI workflow running flake8/black on backend and eslint/type-check on frontend.
- **Acceptance & Paired Tests:** Verify pipeline executes and passes cleanly on pull requests.

### `COMMIT-007`: docs(specs): document environment variables and secret rotation policy

- **Target Files:**
  - `backend/.env.example`
  - `frontend/texon-ui/.env.example`
  - `docs/backend/02-env-configuration.md`
- **Implementation Intent:** Provide verified environment configuration templates for development, staging, and production.
- **Acceptance & Paired Tests:** Verify all required variables are listed with type descriptions and secure defaults.

### `COMMIT-008`: refactor(backend): replace SQLite default in settings.py with PostgreSQL configuration

- **Target Files:**
  - `backend/config/settings.py`
- **Implementation Intent:** Configure dj-database-url with PostgreSQL as default engine; fail fast if DB URL missing in prod.
- **Acceptance & Paired Tests:** Verify Django connects to PostgreSQL and runs 'manage.py check --database default' without errors.

### `COMMIT-009`: chore(backend): add migration consistency check script

- **Target Files:**
  - `scripts/check_migrations.sh`
- **Implementation Intent:** Script to run 'manage.py makemigrations --check --dry-run' in CI to prevent uncommitted model drift.
- **Acceptance & Paired Tests:** Script exits 0 when migrations are up to date, exits 1 when uncommitted model changes exist.

### `COMMIT-010`: test(backend): add baseline database connection and health check tests

- **Target Files:**
  - `backend/tests/test_health.py`
- **Implementation Intent:** Add automated test verifying database connectivity, cache accessibility, and version metadata.
- **Acceptance & Paired Tests:** Pytest passes and validates live DB connection.

### `COMMIT-011`: chore(frontend): add vitest and testing-library setup for frontend components

- **Target Files:**
  - `frontend/texon-ui/vitest.config.ts`
  - `frontend/texon-ui/tests/setup.ts`
- **Implementation Intent:** Configure Vitest with React Testing Library and jsdom environment.
- **Acceptance & Paired Tests:** Run 'pnpm test' and verify test runner executes successfully.

### `COMMIT-012`: test(frontend): add initial render test for login page and layout

- **Target Files:**
  - `frontend/texon-ui/tests/login.test.tsx`
- **Implementation Intent:** Unit test verifying login page renders fields and submits credentials correctly.
- **Acceptance & Paired Tests:** Vitest passes with 100% assertion success on form rendering.

### `COMMIT-013`: chore(backend): configure Celery with Redis broker and result backend

- **Target Files:**
  - `backend/config/celery.py`
  - `backend/config/__init__.py`
  - `backend/config/settings.py`
- **Implementation Intent:** Initialize Celery application with Redis broker for asynchronous outbox processing.
- **Acceptance & Paired Tests:** Run 'celery -A config worker --loglevel=info --dry-run' and verify clean initialization.

### `COMMIT-014`: test(backend): add celery ping task and async execution verification test

- **Target Files:**
  - `backend/core/tasks.py`
  - `backend/tests/test_celery.py`
- **Implementation Intent:** Create test celery task and test case using CELERY_TASK_ALWAYS_EAGER=True.
- **Acceptance & Paired Tests:** Pytest verifies task execution and return value.

### `COMMIT-015`: chore(backend): add django-redis cache backend configuration

- **Target Files:**
  - `backend/config/settings.py`
- **Implementation Intent:** Configure Redis cache backend for caching ERP read projections and session data.
- **Acceptance & Paired Tests:** Verify 'cache.set()' and 'cache.get()' succeed against Redis.

### `COMMIT-016`: test(backend): add cache backend unit tests

- **Target Files:**
  - `backend/tests/test_cache.py`
- **Implementation Intent:** Verify cache invalidation, key TTL expiration, and serialized object retrieval.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-017`: chore(odoo): scaffold odoo_addons directory and bridge module structure

- **Target Files:**
  - `odoo_addons/texon_bridge/__init__.py`
  - `odoo_addons/texon_bridge/__manifest__.py`
- **Implementation Intent:** Initialize Odoo 20 addon manifest with LGPL-3 license, version 20.0.1.0.0, and dependencies on sale, mrp, stock.
- **Acceptance & Paired Tests:** Install module in test Odoo instance via 'odoo -i texon_bridge --stop-after-init' without errors.

### `COMMIT-018`: chore(odoo): add odoo test suite scaffolding and test runner

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/__init__.py`
  - `odoo_addons/texon_bridge/tests/common.py`
- **Implementation Intent:** Create base test case extending TransactionCase for testing bridge RPC methods.
- **Acceptance & Paired Tests:** Run 'odoo --test-enable -i texon_bridge --stop-after-init' and verify test framework runs.

### `COMMIT-019`: chore(scripts): add local dev setup orchestration script

- **Target Files:**
  - `scripts/setup_dev.sh`
- **Implementation Intent:** Script to boot containers, apply Django migrations, and install Odoo bridge addon.
- **Acceptance & Paired Tests:** Fresh clone running setup_dev.sh boots all services cleanly.

### `COMMIT-020`: docs(architecture): add architectural glossary and system boundary reference

- **Target Files:**
  - `docs/architecture/01-glossary.md`
- **Implementation Intent:** Define canonical terms: Style vs Template, Roll vs Lot, Buyer PO vs Sale Order, Outbox vs Inbox.
- **Acceptance & Paired Tests:** Verify glossary matches technical problem solving specifications.

### `COMMIT-021`: chore(backend): configure structured JSON logging for audit and integration debugging

- **Target Files:**
  - `backend/config/logging.py`
  - `backend/config/settings.py`
- **Implementation Intent:** Configure python-json-logger emitting structured logs with correlation IDs and operation UUIDs.
- **Acceptance & Paired Tests:** Verify logs output valid JSON containing timestamp, level, message, and context.

### `COMMIT-022`: test(backend): verify structured logging context injection

- **Target Files:**
  - `backend/tests/test_logging.py`
- **Implementation Intent:** Test that correlation ID passed in request headers is propagated to application logs.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-023`: security(core): create StrictModelPermissions closing DRF GET vulnerability

- **Target Files:**
  - `backend/core/permissions.py`
- **Implementation Intent:** Implement DRF permission class mapping GET/HEAD/OPTIONS to view_%(model_name)s permission.
- **Acceptance & Paired Tests:** Unit test verifies unprivileged authenticated users receive 403 on model GET endpoints.

### `COMMIT-024`: test(core): add comprehensive permission denial test matrix for GET requests

- **Target Files:**
  - `backend/tests/test_permissions.py`
- **Implementation Intent:** Test matrix covering ordinary user, department user, and admin across core ERP models.
- **Acceptance & Paired Tests:** Pytest passes confirming strict read authorization.

### `COMMIT-025`: security(core): remove staff bypass in core/mixins.py tenant queryset filtering

- **Target Files:**
  - `backend/core/mixins.py`
- **Implementation Intent:** Remove 'if request.user.is_staff: return queryset' so company boundaries apply universally.
- **Acceptance & Paired Tests:** Test proves staff user cannot view records belonging to other companies.

### `COMMIT-026`: refactor(core): implement CompanyContextMiddleware enforcing active company scope

- **Target Files:**
  - `backend/core/middleware.py`
  - `backend/config/settings.py`
- **Implementation Intent:** Middleware extracting validated company_id from user session and binding to thread-local context.
- **Acceptance & Paired Tests:** Requests without valid company association are rejected with 400 Bad Request.

### `COMMIT-027`: test(core): add middleware tests for company context resolution

- **Target Files:**
  - `backend/tests/test_middleware.py`
- **Implementation Intent:** Test scenarios for valid company, switched company, and invalid cross-tenant header injection.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-028`: security(core): enforce CompanyScopedModel base class across ERP models

- **Target Files:**
  - `backend/core/models.py`
  - `backend/core/migrations/0004_company_scoping.py`
- **Implementation Intent:** Add abstract base class with company ForeignKey and automatic manager filtering.
- **Acceptance & Paired Tests:** Querying CompanyScopedModel automatically filters to active thread-local company.

### `COMMIT-029`: security(api): retire generic writable model routes in core/api.py for orders app

- **Target Files:**
  - `backend/core/api.py`
- **Implementation Intent:** Remove automatic dynamic CRUD route registration for orders and merchandising models.
- **Acceptance & Paired Tests:** POST/PUT/PATCH to /api/v1/orders/ returns 405 Method Not Allowed; read routes remain.

### `COMMIT-030`: test(api): verify retirement of generic writable endpoints for orders

- **Target Files:**
  - `backend/tests/test_api_gateway.py`
- **Implementation Intent:** Test verifies POST/PATCH to legacy generic order endpoints are rejected.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-031`: security(api): retire generic writable model routes for inventory app

- **Target Files:**
  - `backend/core/api.py`
- **Implementation Intent:** Disable generic CRUD writes for Fabric, Trim, and StockMovement models.
- **Acceptance & Paired Tests:** Generic writes rejected; only explicit stock command endpoints permitted.

### `COMMIT-032`: security(api): retire generic writable model routes for production app

- **Target Files:**
  - `backend/core/api.py`
- **Implementation Intent:** Disable generic CRUD writes for ProductionOrder, CuttingRecord, and SewingRecord.
- **Acceptance & Paired Tests:** Generic writes rejected.

### `COMMIT-033`: security(api): retire generic writable model routes for accounts app

- **Target Files:**
  - `backend/core/api.py`
- **Implementation Intent:** Disable all generic writes to accounts and journal models to prevent ledger tampering.
- **Acceptance & Paired Tests:** Generic writes rejected.

### `COMMIT-034`: security(auth): enforce fail-safe production secret requirement in settings.py

- **Target Files:**
  - `backend/config/settings.py`
- **Implementation Intent:** Raise ImproperlyConfigured if SECRET_KEY uses insecure default when DEBUG is False.
- **Acceptance & Paired Tests:** Test verifies startup failure when secret key is unset in production mode.

### `COMMIT-035`: security(auth): restrict employee and is_verified fields on user update API

- **Target Files:**
  - `backend/authentication/api.py`
  - `backend/authentication/serializers.py`
- **Implementation Intent:** Make employee FK and is_verified read-only to non-superusers to prevent privilege escalation.
- **Acceptance & Paired Tests:** Ordinary user attempting to update employee field receives 400 validation error.

### `COMMIT-036`: test(auth): add test coverage for user profile update field restrictions

- **Target Files:**
  - `backend/authentication/tests/test_user_api.py`
- **Implementation Intent:** Assert non-superuser cannot change employee, is_staff, is_superuser, or is_verified.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-037`: security(auth): add rate limiting to login and token refresh endpoints

- **Target Files:**
  - `backend/authentication/api.py`
  - `backend/config/settings.py`
- **Implementation Intent:** Configure django-ratelimit on /api/v1/auth/login/ (5 req/min per IP).
- **Acceptance & Paired Tests:** 6th rapid login attempt receives 429 Too Many Requests.

### `COMMIT-038`: test(auth): test authentication rate limiting

- **Target Files:**
  - `backend/authentication/tests/test_rate_limit.py`
- **Implementation Intent:** Verify 429 response triggered upon exceeding login threshold.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-039`: security(rbac): add permission checks on role assignment view

- **Target Files:**
  - `backend/rbac/views.py`
- **Implementation Intent:** Require explicit roles.assign permission to attach roles to users.
- **Acceptance & Paired Tests:** Unauthorized user receives 403 when assigning roles.

### `COMMIT-040`: test(rbac): test role assignment permission enforcement

- **Target Files:**
  - `backend/rbac/tests/test_rbac_views.py`
- **Implementation Intent:** Verify role assignment permissions.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-041`: security(cors): harden CORS and CSRF configuration

- **Target Files:**
  - `backend/config/settings.py`
- **Implementation Intent:** Restrict CORS to trusted domain origins; enable CSRF cookie secure flags.
- **Acceptance & Paired Tests:** Verify CORS header behavior with allowed and disallowed origins.

### `COMMIT-042`: test(cors): test CORS origin validation

- **Target Files:**
  - `backend/tests/test_cors.py`
- **Implementation Intent:** Test that unauthorized origin receives no Access-Control-Allow-Origin header.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-043`: security(core): add SQL injection protection audit on search filters

- **Target Files:**
  - `backend/core/admin_search.py`
  - `backend/core/api.py`
- **Implementation Intent:** Ensure all dynamic search queries use parameterized ORM queries.
- **Acceptance & Paired Tests:** Verify search with sql injection payloads executes safely as literal strings.

### `COMMIT-044`: test(core): test parameterized search filtering

- **Target Files:**
  - `backend/tests/test_search.py`
- **Implementation Intent:** Search endpoint handles quotes and SQL syntax safely.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-045`: docs(security): document backend security architecture and permission matrix

- **Target Files:**
  - `docs/backend/03-security-permissions.md`
- **Implementation Intent:** Document StrictModelPermissions, company isolation, and retired generic routes.
- **Acceptance & Paired Tests:** Documentation reviewed and verified against codebase.

### `COMMIT-046`: refactor(frontend): remove localStorage JWT token storage in login-form.tsx

- **Target Files:**
  - `frontend/texon-ui/components/login-form.tsx`
- **Implementation Intent:** Remove localStorage.setItem for access and refresh tokens upon login.
- **Acceptance & Paired Tests:** Verify browser localStorage remains empty after successful login.

### `COMMIT-047`: refactor(frontend): remove localStorage token refresh in lib/api/client.ts

- **Target Files:**
  - `frontend/texon-ui/lib/api/client.ts`
- **Implementation Intent:** Remove client-side reading of localStorage tokens; delegate auth to HttpOnly cookies.
- **Acceptance & Paired Tests:** API client makes requests with credentials: include, relying on cookies.

### `COMMIT-048`: feat(frontend): implement secure HttpOnly session cookie in auth/actions/login.ts

- **Target Files:**
  - `frontend/texon-ui/auth/actions/login.ts`
- **Implementation Intent:** Set secure, HttpOnly, SameSite=Lax cookie with encrypted JWT session.
- **Acceptance & Paired Tests:** Verify cookies tab shows session cookie flagged HttpOnly and Secure.

### `COMMIT-049`: test(frontend): test server action login cookie generation

- **Target Files:**
  - `frontend/texon-ui/tests/auth/login-action.test.ts`
- **Implementation Intent:** Verify cookie options (httpOnly, secure, sameSite) on login return.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-050`: feat(frontend): hydrate user roles and permissions into session on login

- **Target Files:**
  - `frontend/texon-ui/auth/actions/login.ts`
  - `frontend/texon-ui/auth/lib/session.ts`
- **Implementation Intent:** Fetch user profile and active permissions and encode into session token payload.
- **Acceptance & Paired Tests:** Session payload contains non-empty roles and permissions arrays.

### `COMMIT-051`: feat(frontend): implement server-side single-flight token refresh in session.ts

- **Target Files:**
  - `frontend/texon-ui/auth/lib/session.ts`
- **Implementation Intent:** Deduplicate concurrent refresh requests so 5 simultaneous requests cause 1 backend refresh.
- **Acceptance & Paired Tests:** Concurrent request test produces exactly one call to backend refresh endpoint.

### `COMMIT-052`: test(frontend): test single-flight session token refresh deduplication

- **Target Files:**
  - `frontend/texon-ui/tests/auth/session-refresh.test.ts`
- **Implementation Intent:** Simulate 5 concurrent requests with expired access token; verify 1 refresh API call.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-053`: feat(frontend): create backend API proxy route handler in Next.js App Router

- **Target Files:**
  - `frontend/texon-ui/app/api/proxy/[...path]/route.ts`
- **Implementation Intent:** Server-side proxy forwarding client requests to Django API with injected authorization.
- **Acceptance & Paired Tests:** Browser network tab reveals calls to /api/proxy/*, never direct backend URLs.

### `COMMIT-054`: security(frontend): harden session encryption secret with fail-fast validation

- **Target Files:**
  - `frontend/texon-ui/auth/lib/session.ts`
- **Implementation Intent:** Throw Error during startup if SESSION_SECRET is missing or default in production.
- **Acceptance & Paired Tests:** Test verifies exception thrown when SESSION_SECRET is unset in production.

### `COMMIT-055`: refactor(frontend): update proxy.ts route guard with strict session validation

- **Target Files:**
  - `frontend/texon-ui/proxy.ts`
- **Implementation Intent:** Verify valid signed session token rather than merely checking cookie existence.
- **Acceptance & Paired Tests:** Tampered cookie triggers redirect to /login with session-expired param.

### `COMMIT-056`: test(frontend): test route guard with invalid and expired cookies

- **Target Files:**
  - `frontend/texon-ui/tests/auth/proxy-guard.test.ts`
- **Implementation Intent:** Assert redirect behavior on expired, invalid, and missing session cookies.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-057`: feat(frontend): implement logout server action with cookie deletion and backend blacklist

- **Target Files:**
  - `frontend/texon-ui/auth/actions/logout.ts`
- **Implementation Intent:** Invalidate refresh token on backend blacklist and delete session cookie.
- **Acceptance & Paired Tests:** Logout clears cookie and backend refresh token cannot be reused.

### `COMMIT-058`: test(frontend): test logout action cookie removal and token revocation

- **Target Files:**
  - `frontend/texon-ui/tests/auth/logout.test.ts`
- **Implementation Intent:** Verify session cookie deleted upon logout invocation.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-059`: refactor(frontend): replace client-side unbounded pagination loop in lib/api/rest.ts

- **Target Files:**
  - `frontend/texon-ui/lib/api/rest.ts`
- **Implementation Intent:** Remove 100-page client download loop; replace with server pagination query parameters.
- **Acceptance & Paired Tests:** Network inspect confirms single request fetching requested page size.

### `COMMIT-060`: test(frontend): test server pagination parameter forwarding

- **Target Files:**
  - `frontend/texon-ui/tests/api/rest-pagination.test.ts`
- **Implementation Intent:** Verify page and page_size query parameters correctly formatted.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-061`: feat(frontend): create UI error state components for unauthenticated, forbidden, and offline

- **Target Files:**
  - `frontend/texon-ui/components/ui/error-boundary-view.tsx`
- **Implementation Intent:** Component rendering distinct states for 401, 403, 503 Connector Offline, and Empty Data.
- **Acceptance & Paired Tests:** Component renders designated illustration and action button for each error code.

### `COMMIT-062`: refactor(frontend): stop swallowing API exceptions in lib/api/module-data.ts

- **Target Files:**
  - `frontend/texon-ui/lib/api/module-data.ts`
- **Implementation Intent:** Propagate error objects to caller instead of returning empty arrays and error: null.
- **Acceptance & Paired Tests:** Upstream components receive actual error code and render error boundary.

### `COMMIT-063`: test(frontend): test error propagation in module-data helper

- **Target Files:**
  - `frontend/texon-ui/tests/api/module-data-error.test.ts`
- **Implementation Intent:** Assert API 500 error throws or returns error payload, not empty array.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-064`: feat(frontend): add operation UUID generator utility for business command dispatch

- **Target Files:**
  - `frontend/texon-ui/lib/utils/operation-uuid.ts`
- **Implementation Intent:** UUIDv4 generator creating client command tracking keys.
- **Acceptance & Paired Tests:** Returns valid RFC4122 UUIDv4.

### `COMMIT-065`: feat(frontend): implement operation polling hook for async ERP commands

- **Target Files:**
  - `frontend/texon-ui/hooks/use-operation-status.ts`
- **Implementation Intent:** React hook polling /api/proxy/operations/{uuid}/status until completion or failure.
- **Acceptance & Paired Tests:** Hook updates status state through PENDING, PROCESSING, COMPLETED, FAILED.

### `COMMIT-066`: test(frontend): test useOperationStatus hook state transitions

- **Target Files:**
  - `frontend/texon-ui/tests/hooks/use-operation-status.test.ts`
- **Implementation Intent:** Test hook polling with mock responses until COMPLETED.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-067`: refactor(frontend): remove static mock 'System Active' badge on dashboard

- **Target Files:**
  - `frontend/texon-ui/app/page.tsx`
- **Implementation Intent:** Replace static 'Last sync: Just now' with dynamic ERP connector health badge.
- **Acceptance & Paired Tests:** Badge displays 'Live' when bridge responds, 'Sync Degraded' when latency exceeds threshold.

### `COMMIT-068`: docs(frontend): document frontend authentication flow and BFF architecture

- **Target Files:**
  - `docs/frontend/08-auth-and-bff-architecture.md`
- **Implementation Intent:** Document cookie session flow, single-flight refresh, and command dispatch pattern.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-069`: feat(outbox): create integration_outbox model in core app

- **Target Files:**
  - `backend/core/models/outbox.py`
  - `backend/core/migrations/0005_integration_outbox.py`
- **Implementation Intent:** Model with operation_uuid, tenant_id, company_id, command_name, payload, status, retry_count.
- **Acceptance & Paired Tests:** Migration applies cleanly; index on status and next_retry_at created.

### `COMMIT-070`: test(outbox): test outbox model creation and unique constraint on operation_uuid

- **Target Files:**
  - `backend/core/tests/test_outbox_model.py`
- **Implementation Intent:** Duplicate operation_uuid raises IntegrityError.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-071`: feat(outbox): implement OutboxService for atomic domain command dispatch

- **Target Files:**
  - `backend/core/services/outbox_service.py`
- **Implementation Intent:** Service inserting outbox record within active transaction.atomic() context.
- **Acceptance & Paired Tests:** Outbox entry rolled back if enclosing transaction fails.

### `COMMIT-072`: test(outbox): verify atomic rollback of outbox record on domain exception

- **Target Files:**
  - `backend/core/tests/test_outbox_atomic.py`
- **Implementation Intent:** Simulate failure after outbox enqueue; verify zero outbox records committed.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-073`: feat(outbox): create Celery task to process pending outbox events

- **Target Files:**
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Worker querying PENDING outbox items using select_for_update(skip_locked=True).
- **Acceptance & Paired Tests:** Worker locks batch without blocking concurrent workers.

### `COMMIT-074`: feat(outbox): implement exponential backoff and retry policy in outbox processor

- **Target Files:**
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Calculate next_retry_at = now() + (2 ^ retry_count) with maximum 5 retries.
- **Acceptance & Paired Tests:** Failed item rescheduled with exponential delay; status set to DEAD_LETTER after 5 attempts.

### `COMMIT-075`: test(outbox): test outbox retry scheduling and dead-letter queue transition

- **Target Files:**
  - `backend/core/tests/test_outbox_retry.py`
- **Implementation Intent:** Verify retry intervals and dead-letter transition on repeated failures.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-076`: feat(outbox): add payload sha256 hash calculation and verification

- **Target Files:**
  - `backend/core/services/outbox_service.py`
- **Implementation Intent:** Compute canonical SHA-256 hash of JSON payload to prevent tamper on replay.
- **Acceptance & Paired Tests:** Payload hash stored and verified against serialized content.

### `COMMIT-077`: test(outbox): test payload hash generation and tamper detection

- **Target Files:**
  - `backend/core/tests/test_payload_hash.py`
- **Implementation Intent:** Assert alteration of single character in payload changes hash and fails verification.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-078`: feat(inbox): create integration_inbox model for incoming ERP events

- **Target Files:**
  - `backend/core/models/inbox.py`
  - `backend/core/migrations/0006_integration_inbox.py`
- **Implementation Intent:** Model for recording incoming Odoo event webhooks with event_id, deduplication key, and status.
- **Acceptance & Paired Tests:** Migration applies cleanly; unique index on (source_system, event_id).

### `COMMIT-079`: test(inbox): test inbox duplicate event rejection

- **Target Files:**
  - `backend/core/tests/test_inbox_dedup.py`
- **Implementation Intent:** Attempting to insert same event_id twice raises IntegrityError.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-080`: feat(inbox): implement InboxService dispatching events to local domain handlers

- **Target Files:**
  - `backend/core/services/inbox_service.py`
- **Implementation Intent:** Service routing incoming events to domain projection updaters atomically.
- **Acceptance & Paired Tests:** Event status marked PROCESSED upon handler completion.

### `COMMIT-081`: test(inbox): test inbox event processing and projection update

- **Target Files:**
  - `backend/core/tests/test_inbox_processing.py`
- **Implementation Intent:** Simulate incoming event; assert local read-model updated and inbox marked PROCESSED.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-082`: feat(api): create operation status polling endpoint

- **Target Files:**
  - `backend/core/api_operations.py`
  - `backend/core/urls.py`
- **Implementation Intent:** GET /api/v1/operations/{uuid}/status returning current outbox status and result payload.
- **Acceptance & Paired Tests:** Returns 200 with status PENDING, COMMITTED, or FAILED.

### `COMMIT-083`: test(api): test operation status endpoint across lifecycle states

- **Target Files:**
  - `backend/core/tests/test_operation_status_api.py`
- **Implementation Intent:** Verify response structure for PENDING, COMMITTED, and FAILED states.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-084`: feat(outbox): add outbox cleanup periodic task for committed records

- **Target Files:**
  - `backend/core/tasks/outbox_maintenance.py`
- **Implementation Intent:** Celery beat task purging COMMITTED outbox records older than 30 days.
- **Acceptance & Paired Tests:** Old committed records removed; uncommitted and recent records preserved.

### `COMMIT-085`: test(outbox): test outbox cleanup retention policy

- **Target Files:**
  - `backend/core/tests/test_outbox_cleanup.py`
- **Implementation Intent:** Verify records older than 30 days deleted while 29-day records retained.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-086`: feat(outbox): add Prometheus metrics for outbox queue depth and processing latency

- **Target Files:**
  - `backend/core/metrics.py`
- **Implementation Intent:** Expose gauge outbox_pending_count and histogram outbox_processing_duration_seconds.
- **Acceptance & Paired Tests:** Metrics exposed on /metrics endpoint.

### `COMMIT-087`: test(outbox): test outbox metrics collection

- **Target Files:**
  - `backend/core/tests/test_metrics.py`
- **Implementation Intent:** Verify queue depth gauge increments on outbox enqueue.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-088`: feat(outbox): add dead-letter queue alert notification task

- **Target Files:**
  - `backend/core/tasks/outbox_alerts.py`
- **Implementation Intent:** Celery task triggering webhook/email alert when records enter DEAD_LETTER status.
- **Acceptance & Paired Tests:** Alert triggered upon outbox failure reaching threshold.

### `COMMIT-089`: test(outbox): test DLQ alert dispatch

- **Target Files:**
  - `backend/core/tests/test_dlq_alert.py`
- **Implementation Intent:** Verify alert fired on dead-letter transition.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-090`: feat(outbox): add manual replay command for dead-letter outbox records

- **Target Files:**
  - `backend/core/management/commands/replay_outbox.py`
- **Implementation Intent:** Management command 'manage.py replay_outbox --uuid=<uuid>' resetting failed record to PENDING.
- **Acceptance & Paired Tests:** Record status reset to PENDING and retry_count reset to 0.

### `COMMIT-091`: test(outbox): test manual replay management command

- **Target Files:**
  - `backend/core/tests/test_replay_command.py`
- **Implementation Intent:** Verify command resets dead-letter record.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-092`: feat(outbox): add correlation ID tracking across outbox and Celery tasks

- **Target Files:**
  - `backend/core/services/outbox_service.py`
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Propagate correlation_id from web request header through outbox record into Celery task context.
- **Acceptance & Paired Tests:** Log records in worker output contain original correlation_id.

### `COMMIT-093`: test(outbox): test correlation ID propagation to worker logs

- **Target Files:**
  - `backend/core/tests/test_correlation_tracking.py`
- **Implementation Intent:** Assert correlation ID present in outbox processing context.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-094`: feat(outbox): add batch processing support to outbox poller

- **Target Files:**
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Process up to 50 outbox records per worker cycle to maximize throughput.
- **Acceptance & Paired Tests:** Poller handles batch of 50 records in single invocation.

### `COMMIT-095`: docs(outbox): document outbox/inbox architecture, schemas and failure modes

- **Target Files:**
  - `docs/integration/01-outbox-inbox-engine.md`
- **Implementation Intent:** Complete architecture guide for messaging engine.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-096`: feat(odoo): create texon.command.receipt model in texon_bridge addon

- **Target Files:**
  - `odoo_addons/texon_bridge/models/command_receipt.py`
  - `odoo_addons/texon_bridge/models/__init__.py`
- **Implementation Intent:** Model storing operation_uuid, company_id, command_name, payload_hash, response_data, and status.
- **Acceptance & Paired Tests:** Module upgrade creates texon_command_receipt table in Odoo PostgreSQL.

### `COMMIT-097`: test(odoo): test unique constraint and index on operation_uuid in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_command_receipt.py`
- **Implementation Intent:** Duplicate operation_uuid raises ValidationError.
- **Acceptance & Paired Tests:** Odoo test suite passes.

### `COMMIT-098`: feat(odoo): create texon.bridge.service abstract model with execute_atomic_command

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bridge_service.py`
- **Implementation Intent:** Atomic facade model providing entry point for JSON-2 RPC integration calls.
- **Acceptance & Paired Tests:** Method dispatches to internal command handlers inside single savepoint.

### `COMMIT-099`: feat(odoo): implement payload hash verification and tamper rejection in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bridge_service.py`
- **Implementation Intent:** Verify incoming payload hash matches stored receipt if operation_uuid repeated.
- **Acceptance & Paired Tests:** Tampered payload raises UserError('Operation UUID reused with altered payload').

### `COMMIT-100`: test(odoo): test idempotency and tamper rejection in Odoo bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_bridge_idempotency.py`
- **Implementation Intent:** Identical payload returns cached response; altered payload raises UserError.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-101`: feat(odoo): add multi-company switching and validation in bridge service

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bridge_service.py`
- **Implementation Intent:** Set allowed_company_ids in context; verify company exists and caller authorized.
- **Acceptance & Paired Tests:** Command fails if target company_id not in allowed companies.

### `COMMIT-102`: test(odoo): test cross-company boundary enforcement in Odoo bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_bridge_company.py`
- **Implementation Intent:** Unauthorized company ID raises AccessError.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-103`: feat(odoo): create restricted Texon Integration User and Security Group

- **Target Files:**
  - `odoo_addons/texon_bridge/security/security.xml`
  - `odoo_addons/texon_bridge/security/ir.model.access.csv`
- **Implementation Intent:** Create group_texon_integration with permissions strictly on required models; no superuser access.
- **Acceptance & Paired Tests:** Integration user can execute bridge methods but cannot access unrestricted admin models.

### `COMMIT-104`: feat(backend): implement OdooRpcClient in Django using JSON-2 protocol

- **Target Files:**
  - `backend/core/integrations/odoo_client.py`
- **Implementation Intent:** HTTP client targeting /json/2/<model>/<method> with Bearer token authentication.
- **Acceptance & Paired Tests:** Client performs POST requests with proper JSON-2 headers and error handling.

### `COMMIT-105`: test(backend): test OdooRpcClient request construction and error mapping

- **Target Files:**
  - `backend/core/tests/test_odoo_client.py`
- **Implementation Intent:** Mock HTTP requests and verify header formatting and exception parsing.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-106`: feat(backend): add API token rotation and expiry management in Django

- **Target Files:**
  - `backend/core/integrations/token_manager.py`
- **Implementation Intent:** Track token expiry; raise alarm 14 days before 90-day manual key expiration.
- **Acceptance & Paired Tests:** Warn logged when token age exceeds 76 days.

### `COMMIT-107`: test(backend): test token manager expiration warning

- **Target Files:**
  - `backend/core/tests/test_token_manager.py`
- **Implementation Intent:** Assert warning generated for near-expiry token.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-108`: feat(backend): wire outbox worker to OdooRpcClient for command execution

- **Target Files:**
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Worker calls OdooRpcClient.execute_command() and handles response.
- **Acceptance & Paired Tests:** Outbox status transitions to COMMITTED upon 200 response from Odoo.

### `COMMIT-109`: test(backend): integration test: outbox item dispatched to mock Odoo RPC

- **Target Files:**
  - `backend/core/tests/test_outbox_to_odoo.py`
- **Implementation Intent:** Verify end-to-end flow from outbox record creation to mock RPC call.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-110`: feat(odoo): add ping/health check method in texon.bridge.service

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bridge_service.py`
- **Implementation Intent:** Add 'ping' method returning server timestamp, version info, and active company.
- **Acceptance & Paired Tests:** POST /json/2/texon.bridge.service/execute_atomic_command with command='ping' returns 200.

### `COMMIT-111`: test(odoo): test bridge ping command execution

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_ping.py`
- **Implementation Intent:** Ping returns correct version and status.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-112`: feat(backend): implement OdooHealthCheck management command in Django

- **Target Files:**
  - `backend/core/management/commands/check_odoo_connection.py`
- **Implementation Intent:** Command 'manage.py check_odoo_connection' pinging Odoo and validating RPC credentials.
- **Acceptance & Paired Tests:** Command prints green success message when connection valid; exits 1 on failure.

### `COMMIT-113`: test(backend): test check_odoo_connection management command

- **Target Files:**
  - `backend/core/tests/test_check_odoo.py`
- **Implementation Intent:** Verify command handles success and failure cases.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-114`: feat(odoo): add structured logging for all executed bridge commands in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bridge_service.py`
- **Implementation Intent:** Emit JSON logs with operation_uuid, command_name, duration_ms, and actor_id.
- **Acceptance & Paired Tests:** Odoo server log outputs structured log entry per command.

### `COMMIT-115`: feat(backend): handle remote Odoo UserError and ValidationError in Django outbox

- **Target Files:**
  - `backend/core/tasks/outbox_processor.py`
- **Implementation Intent:** Classify 4xx/business errors as non-retryable FAILED; do not retry permanently invalid requests.
- **Acceptance & Paired Tests:** Business failure sets status=FAILED immediately without burning 5 retries.

### `COMMIT-116`: test(backend): test non-retryable business failure classification

- **Target Files:**
  - `backend/core/tests/test_business_error_handling.py`
- **Implementation Intent:** Assert UserError marks outbox FAILED on first attempt.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-117`: feat(odoo): implement audit log extension on command receipts

- **Target Files:**
  - `odoo_addons/texon_bridge/models/command_receipt.py`
- **Implementation Intent:** Track IP address, request timestamp, and response duration on receipt model.
- **Acceptance & Paired Tests:** Receipt contains complete execution audit metadata.

### `COMMIT-118`: test(odoo): test receipt audit metadata persistence

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_receipt_audit.py`
- **Implementation Intent:** Verify audit fields populated upon execution.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-119`: feat(backend): add connection pooling and timeout tuning to OdooRpcClient

- **Target Files:**
  - `backend/core/integrations/odoo_client.py`
- **Implementation Intent:** Configure requests.Session with HTTPAdapter pool_connections=10, timeout=(3.05, 30.0).
- **Acceptance & Paired Tests:** Client reuses TCP connections across calls.

### `COMMIT-120`: test(backend): test RPC client connection reuse and timeout configuration

- **Target Files:**
  - `backend/core/tests/test_rpc_pool.py`
- **Implementation Intent:** Verify adapter pooling and timeout params.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-121`: feat(odoo): add database constraint preventing concurrent duplicate receipts

- **Target Files:**
  - `odoo_addons/texon_bridge/models/command_receipt.py`
- **Implementation Intent:** PostgreSQL unique constraint on operation_uuid handles concurrent duplicate race conditions.
- **Acceptance & Paired Tests:** Concurrent execution of same UUID causes second transaction to roll back gracefully.

### `COMMIT-122`: test(odoo): test concurrent execution of same operation UUID in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_concurrency.py`
- **Implementation Intent:** Assert concurrency test handles duplicate without corruption.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-123`: feat(backend): add circuit breaker to OdooRpcClient on repeated connection timeouts

- **Target Files:**
  - `backend/core/integrations/circuit_breaker.py`
- **Implementation Intent:** Open circuit breaker after 5 consecutive connection failures; prevent worker hammering.
- **Acceptance & Paired Tests:** Subsequent calls fast-fail with CircuitBreakerOpenException until recovery timeout.

### `COMMIT-124`: test(backend): test circuit breaker tripping and reset behavior

- **Target Files:**
  - `backend/core/tests/test_circuit_breaker.py`
- **Implementation Intent:** Verify state transitions: CLOSED -> OPEN -> HALF-OPEN -> CLOSED.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-125`: docs(integration): document Odoo JSON-2 RPC protocol, bridge architecture and security

- **Target Files:**
  - `docs/integration/02-odoo-bridge-rpc.md`
- **Implementation Intent:** Complete reference documentation for Odoo bridge module.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-126`: feat(master_data): define partner synchronization command and payload schema

- **Target Files:**
  - `backend/buyers/schemas.py`
  - `backend/procurement/schemas.py`
- **Implementation Intent:** Pydantic schemas for buyer and supplier sync with external_id, name, email, country, tax_id.
- **Acceptance & Paired Tests:** Schema validates buyer and supplier payloads.

### `COMMIT-127`: feat(odoo): implement sync_partner handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/partner_handler.py`
- **Implementation Intent:** Search res.partner by ref=external_id or create; update name, email, vat, company_id.
- **Acceptance & Paired Tests:** Handler creates or updates partner and returns Odoo partner_id.

### `COMMIT-128`: test(odoo): test sync_partner creation and idempotent update in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_sync_partner.py`
- **Implementation Intent:** Creating same partner twice updates record without creating duplicate.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-129`: feat(buyers): dispatch outbox command on Buyer create and update in Django

- **Target Files:**
  - `backend/buyers/signals.py`
  - `backend/buyers/apps.py`
- **Implementation Intent:** Post-save signal enqueues sync_partner command with buyer data into outbox.
- **Acceptance & Paired Tests:** Creating Buyer in Django creates PENDING outbox record.

### `COMMIT-130`: test(buyers): test Buyer save creates partner outbox record

- **Target Files:**
  - `backend/buyers/tests/test_buyer_sync.py`
- **Implementation Intent:** Assert outbox item enqueued with correct buyer payload.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-131`: feat(procurement): dispatch outbox command on Supplier create and update

- **Target Files:**
  - `backend/procurement/signals.py`
  - `backend/procurement/apps.py`
- **Implementation Intent:** Post-save signal enqueues sync_partner command with supplier data.
- **Acceptance & Paired Tests:** Creating Supplier in Django enqueues outbox record.

### `COMMIT-132`: test(procurement): test Supplier save creates partner outbox record

- **Target Files:**
  - `backend/procurement/tests/test_supplier_sync.py`
- **Implementation Intent:** Assert outbox item enqueued for supplier.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-133`: feat(inventory): standardize Unit of Measure models on meters and yards

- **Target Files:**
  - `backend/inventory/models/uom.py`
  - `backend/inventory/migrations/0007_standardize_uom.py`
- **Implementation Intent:** Define primary stock UOMs (Meters, Yards) and remove free-text UOM strings.
- **Acceptance & Paired Tests:** Migration applies; all fabric models require validated UOM FK.

### `COMMIT-134`: refactor(inventory): forbid direct kilogram-to-meter automatic conversions in backend

- **Target Files:**
  - `backend/inventory/models/fabric.py`
- **Implementation Intent:** Raise ValidationError if transaction attempts conversion between weight and length without density scale.
- **Acceptance & Paired Tests:** Direct kg-to-meter conversion rejected.

### `COMMIT-135`: test(inventory): test rejection of invalid UOM cross-category conversions

- **Target Files:**
  - `backend/inventory/tests/test_uom_validation.py`
- **Implementation Intent:** Assert ValidationError raised when attempting conversion without measured density.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-136`: feat(odoo): configure internal garment warehouse locations in Odoo data

- **Target Files:**
  - `odoo_addons/texon_bridge/data/locations.xml`
- **Implementation Intent:** Create locations: WH/Stock, WH/Quarantine, WH/Cutting, WH/Sewing, WH/FinishedGoods.
- **Acceptance & Paired Tests:** Module upgrade creates locations under primary warehouse.

### `COMMIT-137`: feat(inventory): create Fabric sync command and payload schema

- **Target Files:**
  - `backend/inventory/schemas/fabric.py`
- **Implementation Intent:** Schema for fabric raw material: code, name, weave_type, composition, default_uom, gsm.
- **Acceptance & Paired Tests:** Schema validates fabric payload.

### `COMMIT-138`: feat(odoo): implement sync_raw_material handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/product_handler.py`
- **Implementation Intent:** Create or update product.template with detailed_type='product' and default_code=fabric_code.
- **Acceptance & Paired Tests:** Handler creates product template and returns odoo_product_template_id.

### `COMMIT-139`: test(odoo): test sync_raw_material template creation in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_sync_product.py`
- **Implementation Intent:** Verify product template created with correct stock UOM.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-140`: feat(inventory): dispatch outbox command on Fabric creation and modification

- **Target Files:**
  - `backend/inventory/signals.py`
- **Implementation Intent:** Post-save signal enqueues sync_raw_material outbox command.
- **Acceptance & Paired Tests:** Saving Fabric creates outbox record.

### `COMMIT-141`: test(inventory): test Fabric save enqueues sync_raw_material command

- **Target Files:**
  - `backend/inventory/tests/test_fabric_sync.py`
- **Implementation Intent:** Verify outbox payload.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-142`: feat(odoo): extend stock.lot with garment fabric roll metadata

- **Target Files:**
  - `odoo_addons/texon_bridge/models/stock_lot.py`
- **Implementation Intent:** Add fields: dye_lot_number, shade_group, measured_gsm, shrinkage_warp_pct, shrinkage_weft_pct, inspection_status.
- **Acceptance & Paired Tests:** Model extension reflected in stock_lot table.

### `COMMIT-143`: test(odoo): test stock.lot garment roll fields and validation

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_stock_lot.py`
- **Implementation Intent:** Create lot with roll metadata; verify persistence.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-144`: feat(inventory): create FabricRoll model in Django matching Odoo lot structure

- **Target Files:**
  - `backend/inventory/models/fabric_roll.py`
  - `backend/inventory/migrations/0008_fabric_roll.py`
- **Implementation Intent:** Model tracking individual rolls with roll_number, lot_number, length_meters, shade, inspection_status.
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-145`: test(inventory): test FabricRoll model creation and validation

- **Target Files:**
  - `backend/inventory/tests/test_fabric_roll.py`
- **Implementation Intent:** Verify roll attributes.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-146`: feat(frontend): update buyer and supplier forms with Odoo sync status indicator

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/buyers/buyer-form.tsx`
- **Implementation Intent:** Display 'Synced with ERP' badge with Odoo Partner ID and last sync timestamp.
- **Acceptance & Paired Tests:** Form renders sync status badge.

### `COMMIT-147`: feat(frontend): update fabric master form with validated UOM dropdown

- **Target Files:**
  - `frontend/texon-ui/app/inventory/fabric-stock/fabric-form.tsx`
- **Implementation Intent:** Restrict UOM selection to meters or yards; remove free-text input.
- **Acceptance & Paired Tests:** Dropdown displays standard units only.

### `COMMIT-148`: test(frontend): test fabric form UOM validation

- **Target Files:**
  - `frontend/texon-ui/tests/inventory/fabric-form.test.tsx`
- **Implementation Intent:** Form prevents submission with invalid UOM.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-149`: feat(master_data): add full master data reconciliation management command

- **Target Files:**
  - `backend/core/management/commands/reconcile_master_data.py`
- **Implementation Intent:** Command verifying that all Buyers, Suppliers, and Fabrics match Odoo records; queues deltas.
- **Acceptance & Paired Tests:** Command outputs reconciliation report identifying matched and unlinked records.

### `COMMIT-150`: docs(master_data): document master data mapping between Texon and Odoo

- **Target Files:**
  - `docs/integration/03-master-data-mapping.md`
- **Implementation Intent:** Complete mapping tables for Partners, Materials, Locations, and UOM.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-151`: feat(merchandising): create StyleRevision model to version-control approved styles

- **Target Files:**
  - `backend/merchandising/models/revision.py`
  - `backend/merchandising/migrations/0005_style_revision.py`
- **Implementation Intent:** Model capturing revision_number, change_summary, approved_by, approved_at, and is_locked.
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-152`: test(merchandising): test StyleRevision creation and locking logic

- **Target Files:**
  - `backend/merchandising/tests/test_style_revision.py`
- **Implementation Intent:** Verify locked revision prevents in-place edits.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-153`: feat(merchandising): create Color and Size attribute definition models

- **Target Files:**
  - `backend/merchandising/models/attributes.py`
  - `backend/merchandising/migrations/0006_style_attributes.py`
- **Implementation Intent:** Models for GarmentAttribute (Color, Size) and GarmentAttributeValue (Navy, Crimson, S, M, L, XL).
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-154`: feat(merchandising): create StyleVariantMatrix model generating size-color matrix

- **Target Files:**
  - `backend/merchandising/models/matrix.py`
  - `backend/merchandising/migrations/0007_variant_matrix.py`
- **Implementation Intent:** Model binding Style, Color, and Size values with deterministic SKU generation.
- **Acceptance & Paired Tests:** Generating matrix for 2 colors and 3 sizes creates exactly 6 SKU variant entries.

### `COMMIT-155`: test(merchandising): test deterministic SKU generation from color/size matrix

- **Target Files:**
  - `backend/merchandising/tests/test_variant_matrix.py`
- **Implementation Intent:** Assert 6 unique SKUs generated with pattern STYLE-COLOR-SIZE.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-156`: feat(odoo): implement sync_style_template handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/style_handler.py`
- **Implementation Intent:** Create or update product.template with style_number and configure product.template.attribute.line.
- **Acceptance & Paired Tests:** Odoo automatically generates product.product variants for all size/color combinations.

### `COMMIT-157`: test(odoo): test style template and variant creation in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_style_handler.py`
- **Implementation Intent:** Verify 6 product.product variants created with matching attribute values.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-158`: feat(merchandising): dispatch outbox command on Style approval

- **Target Files:**
  - `backend/merchandising/services/style_service.py`
- **Implementation Intent:** Service approving style revision and enqueuing sync_style_template command into outbox.
- **Acceptance & Paired Tests:** Approving style locks revision and enqueues outbox record.

### `COMMIT-159`: test(merchandising): test style approval outbox dispatch

- **Target Files:**
  - `backend/merchandising/tests/test_style_approval.py`
- **Implementation Intent:** Assert outbox item contains complete attribute matrix payload.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-160`: feat(merchandising): create BillOfMaterials and BOMLine models in merchandising

- **Target Files:**
  - `backend/merchandising/models/bom.py`
  - `backend/merchandising/migrations/0008_bom_models.py`
- **Implementation Intent:** BOM model with style FK, revision_number, component (Fabric/Trim), quantity_per_garment, and variant restrictions.
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-161`: feat(merchandising): add variant-specific component applicability to BOMLine

- **Target Files:**
  - `backend/merchandising/models/bom.py`
- **Implementation Intent:** Many-to-many relationship to GarmentAttributeValue for size/color restricted components.
- **Acceptance & Paired Tests:** BOM line can be scoped to specific colors or sizes.

### `COMMIT-162`: test(merchandising): test BOM line variant applicability configuration

- **Target Files:**
  - `backend/merchandising/tests/test_bom_applicability.py`
- **Implementation Intent:** Verify components restricted to Navy apply only to Navy variants.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-163`: feat(odoo): implement sync_bom handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/bom_handler.py`
- **Implementation Intent:** Create mrp.bom linked to product.template and set bom_product_template_attribute_value_ids on lines.
- **Acceptance & Paired Tests:** Odoo creates mrp.bom with variant-scoped component lines.

### `COMMIT-164`: test(odoo): test variant BOM creation and line filtering in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_bom_handler.py`
- **Implementation Intent:** Verify variant-specific components filter correctly during MO explosion.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-165`: feat(merchandising): dispatch outbox command on BOM approval

- **Target Files:**
  - `backend/merchandising/services/bom_service.py`
- **Implementation Intent:** Service locking BOM revision and enqueuing sync_bom command.
- **Acceptance & Paired Tests:** BOM approval creates outbox record and sets is_locked=True.

### `COMMIT-166`: test(merchandising): test BOM approval locks specification and enqueues outbox

- **Target Files:**
  - `backend/merchandising/tests/test_bom_approval.py`
- **Implementation Intent:** Verify outbox payload and lock behavior.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-167`: security(merchandising): prevent modification of locked Style and BOM records

- **Target Files:**
  - `backend/merchandising/models/style.py`
  - `backend/merchandising/models/bom.py`
- **Implementation Intent:** Raise ValidationError in save() method if record is locked and modifications attempted.
- **Acceptance & Paired Tests:** Attempting to edit locked style or BOM raises ValidationError.

### `COMMIT-168`: test(merchandising): test locked specification immutability

- **Target Files:**
  - `backend/merchandising/tests/test_immutability.py`
- **Implementation Intent:** Assert save() rejected on locked style/BOM.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-169`: feat(frontend): create Style Matrix designer UI in Next.js

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/styles/matrix-designer.tsx`
- **Implementation Intent:** Interactive UI to define colors, sizes, and review generated SKU list before approval.
- **Acceptance & Paired Tests:** Designer displays matrix grid and computed SKU count.

### `COMMIT-170`: feat(frontend): create BOM Editor UI with variant component filtering

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/styles/bom-editor.tsx`
- **Implementation Intent:** UI allowing merchandiser to assign fabric/trims to all variants or specific color/size values.
- **Acceptance & Paired Tests:** Editor highlights variant-restricted component rows.

### `COMMIT-171`: test(frontend): test BOM editor component assignment and validation

- **Target Files:**
  - `frontend/texon-ui/tests/merchandising/bom-editor.test.tsx`
- **Implementation Intent:** Verify component consumption input and variant selector.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-172`: feat(frontend): display Odoo template and BOM sync status on style overview

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/styles/[id]/page.tsx`
- **Implementation Intent:** Show Odoo Template ID, Variant Count, and BOM ID with live status badge.
- **Acceptance & Paired Tests:** Overview renders ERP link and sync state.

### `COMMIT-173`: feat(merchandising): add style variant reconciliation command

- **Target Files:**
  - `backend/merchandising/management/commands/reconcile_styles.py`
- **Implementation Intent:** Verify all approved styles in Texon match active product.template and product.product in Odoo.
- **Acceptance & Paired Tests:** Outputs report of verified SKUs and flags any missing variants.

### `COMMIT-174`: test(merchandising): test style reconciliation management command

- **Target Files:**
  - `backend/merchandising/tests/test_reconcile_styles.py`
- **Implementation Intent:** Verify reconciliation detects missing variants and queues sync.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-175`: docs(styles): document style matrix, variant generation and BOM versioning

- **Target Files:**
  - `docs/integration/04-style-variant-bom-lifecycle.md`
- **Implementation Intent:** Comprehensive documentation on style lifecycle and Odoo mapping.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-176`: refactor(orders): deprecate orders.Order model and create migration mapping to merchandising.PurchaseOrder

- **Target Files:**
  - `backend/orders/models.py`
  - `backend/orders/migrations/0002_deprecate_order.py`
- **Implementation Intent:** Add deprecation warning; prepare schema migration moving orders into merchandising.PurchaseOrder.
- **Acceptance & Paired Tests:** Migration applies; existing data preserved in canonical table.

### `COMMIT-177`: refactor(merchandising): rename PurchaseOrder to BuyerPurchaseOrder for commercial clarity

- **Target Files:**
  - `backend/merchandising/models/buyer_order.py`
  - `backend/merchandising/migrations/0009_rename_buyer_order.py`
- **Implementation Intent:** Model represents Buyer Purchase Order (Sales Order in Odoo); add odoo_sale_order_id field.
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-178`: feat(merchandising): create BuyerOrderItem model with size/color matrix quantities

- **Target Files:**
  - `backend/merchandising/models/buyer_order_item.py`
  - `backend/merchandising/migrations/0010_order_items.py`
- **Implementation Intent:** Order line item binding to specific GarmentVariant with quantity, unit_price, and line_total.
- **Acceptance & Paired Tests:** Order items breakdown order by size and color.

### `COMMIT-179`: test(merchandising): test BuyerPurchaseOrder line item calculations and totals

- **Target Files:**
  - `backend/merchandising/tests/test_order_totals.py`
- **Implementation Intent:** Order total matches sum of line item totals.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-180`: feat(odoo): implement sync_sale_order handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/sale_handler.py`
- **Implementation Intent:** Create sale.order and sale.order.line records matching buyer order and variant SKUs.
- **Acceptance & Paired Tests:** Odoo creates quotation matching order lines and returns sale_order_id.

### `COMMIT-181`: test(odoo): test sale order creation with variant lines in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_sale_handler.py`
- **Implementation Intent:** Verify sale.order created with correct partner and variant line quantities.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-182`: feat(odoo): implement confirm_sale_order atomic handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/sale_handler.py`
- **Implementation Intent:** Execute order.action_confirm() atomically; transition from quotation to confirmed sale order.
- **Acceptance & Paired Tests:** Odoo confirms sale.order and generates delivery picking record.

### `COMMIT-183`: test(odoo): test atomic sale order confirmation in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_sale_confirm.py`
- **Implementation Intent:** Verify state transitions to 'sale' and procurement generated.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-184`: feat(merchandising): implement confirm_buyer_order service dispatching outbox command

- **Target Files:**
  - `backend/merchandising/services/order_service.py`
- **Implementation Intent:** Service updating local status to PENDING_ERP and enqueuing confirm_sale_order command.
- **Acceptance & Paired Tests:** Confirming order creates outbox record with full size/color line payload.

### `COMMIT-185`: test(merchandising): test order confirmation outbox dispatch

- **Target Files:**
  - `backend/merchandising/tests/test_order_confirm.py`
- **Implementation Intent:** Verify outbox command payload and state transition.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-186`: feat(merchandising): create event handler updating BuyerPurchaseOrder on Odoo confirmation

- **Target Files:**
  - `backend/merchandising/events.py`
- **Implementation Intent:** Inbox handler receiving sale.order confirmed event, saving odoo_sale_order_id, setting status=CONFIRMED.
- **Acceptance & Paired Tests:** Local order reflects confirmed ERP state and records ERP reference number.

### `COMMIT-187`: test(merchandising): test local order update from Odoo confirmation event

- **Target Files:**
  - `backend/merchandising/tests/test_order_event_handler.py`
- **Implementation Intent:** Assert local order status set to CONFIRMED.
- **Acceptance & Paired Tests:** Pytest passes.

### `COMMIT-188`: feat(frontend): update Buyer PO creation form with size/color matrix quantity grid

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/bulk-po-management/new/po-matrix-form.tsx`
- **Implementation Intent:** Grid allowing merchandiser to enter quantities per size and color with instant totals.
- **Acceptance & Paired Tests:** Grid calculates total pieces and order value dynamically.

### `COMMIT-189`: feat(frontend): replace ad hoc status dropdowns in bulk PO with business action button

- **Target Files:**
  - `frontend/texon-ui/app/merchandising/bulk-po-management/[id]/page.tsx`
- **Implementation Intent:** Replace status dropdown with explicit 'Confirm Order' button dispatching operation UUID.
- **Acceptance & Paired Tests:** Clicking confirm triggers operation status polling hook.

### `COMMIT-190`: test(frontend): test PO confirmation button and polling hook interaction

- **Target Files:**
  - `frontend/texon-ui/tests/merchandising/po-confirm.test.tsx`
- **Implementation Intent:** Verify confirm button triggers command and handles response.
- **Acceptance & Paired Tests:** Vitest passes.

### `COMMIT-191`: feat(merchandising): add order amendment tracking when confirmed order altered

- **Target Files:**
  - `backend/merchandising/models/amendment.py`
  - `backend/merchandising/migrations/0011_amendment.py`
- **Implementation Intent:** Record order quantity/date amendments; queue revision command to Odoo sale.order.
- **Acceptance & Paired Tests:** Amendment logged with timestamp and user ref.

### `COMMIT-192`: feat(odoo): implement update_sale_order_lines handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/sale_handler.py`
- **Implementation Intent:** Update existing unfulfilled sale.order lines without canceling entire document.
- **Acceptance & Paired Tests:** Order line quantities updated and subtotal recalculated.

### `COMMIT-193`: test(odoo): test sale order line amendment in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_sale_amendment.py`
- **Implementation Intent:** Verify updated lines and totals.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-194`: feat(merchandising): add sales order reconciliation management command

- **Target Files:**
  - `backend/merchandising/management/commands/reconcile_orders.py`
- **Implementation Intent:** Compare all local BuyerPurchaseOrders against Odoo sale.orders; report discrepancies.
- **Acceptance & Paired Tests:** Command reports matched, pending, and mismatched orders.

### `COMMIT-195`: docs(commercial): document commercial buyer order lifecycle and Odoo sales integration

- **Target Files:**
  - `docs/integration/05-commercial-orders-sales.md`
- **Implementation Intent:** Complete reference documentation for commercial order flow.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-196`: feat(procurement): map RawMaterialBooking to Odoo purchase.order schema

- **Target Files:**
  - `backend/procurement/schemas.py`
- **Implementation Intent:** Define schema mapping fabric/trim booking to Odoo supplier purchase order.
- **Acceptance & Paired Tests:** Schema validates supplier PO payload.

### `COMMIT-197`: feat(odoo): implement create_purchase_order handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/purchase_handler.py`
- **Implementation Intent:** Create purchase.order and lines in Odoo with partner_id, product_id, and expected delivery.
- **Acceptance & Paired Tests:** Odoo creates purchase order and returns purchase_order_id.

### `COMMIT-198`: test(odoo): test supplier purchase order creation in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_purchase_handler.py`
- **Implementation Intent:** Verify purchase.order created in draft state with correct supplier.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-199`: feat(odoo): implement receive_fabric_rolls_quarantine atomic handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/stock_handler.py`
- **Implementation Intent:** Receive stock picking lines directly into WH/Quarantine; create tracked stock.lot per roll.
- **Acceptance & Paired Tests:** Stock move completed into WH/Quarantine; stock.lot records created with PENDING status.

### `COMMIT-200`: test(odoo): test receiving rolls into quarantine with stock.lot creation

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_receive_quarantine.py`
- **Implementation Intent:** Verify quants located in WH/Quarantine and lots tagged PENDING.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-201`: feat(quality): create FabricInspectionRecord model in quality app

- **Target Files:**
  - `backend/quality/models/inspection.py`
  - `backend/quality/migrations/0002_fabric_inspection.py`
- **Implementation Intent:** Model linking to FabricRoll with 4-point inspection score, measured GSM, shade group, pass/fail result.
- **Acceptance & Paired Tests:** Migration applies cleanly.

### `COMMIT-202`: feat(quality): implement inspect_fabric_roll service dispatching outbox command

- **Target Files:**
  - `backend/quality/services/inspection_service.py`
- **Implementation Intent:** Service recording QC score; enqueues release_roll_to_stock or reject_roll command.
- **Acceptance & Paired Tests:** Passed roll enqueues release command; failed roll enqueues reject command.

### `COMMIT-203`: feat(odoo): implement release_roll_to_stock handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/stock_handler.py`
- **Implementation Intent:** Internal stock.move transferring lot from WH/Quarantine to WH/Stock; update lot status to APPROVED.
- **Acceptance & Paired Tests:** Quant moved to WH/Stock and available for MO reservation.

### `COMMIT-204`: test(odoo): test roll transfer from quarantine to available stock in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_roll_release.py`
- **Implementation Intent:** Verify stock quant location updated and lot inspection_status set to APPROVED.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-205`: feat(odoo): implement reject_roll_quarantine handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/stock_handler.py`
- **Implementation Intent:** Transfer rejected lot from WH/Quarantine to WH/RejectedStock; mark lot REJECTED.
- **Acceptance & Paired Tests:** Lot isolated in rejected location; cannot be reserved.

### `COMMIT-206`: test(odoo): test rejected roll quarantine isolation

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_roll_rejection.py`
- **Implementation Intent:** Verify rejected lot blocked from production reservation.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-207`: security(odoo): enforce rule blocking non-approved lots from MO reservation

- **Target Files:**
  - `odoo_addons/texon_bridge/models/mrp_production.py`
- **Implementation Intent:** Override check_assign on mrp.production to reject lots where inspection_status != APPROVED.
- **Acceptance & Paired Tests:** Attempting to reserve PENDING or REJECTED lot raises UserError.

### `COMMIT-208`: test(odoo): test unapproved lot reservation denial in manufacturing orders

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_mo_reservation_guard.py`
- **Implementation Intent:** Assert UserError raised when uninspected lot assigned to MO.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-209`: feat(frontend): create Fabric Roll Receipt & QC Terminal UI

- **Target Files:**
  - `frontend/texon-ui/app/quality-control/fabric-inspection/qc-terminal.tsx`
- **Implementation Intent:** Terminal interface for storekeepers and QC inspectors to log roll length, shade, and 4-point score.
- **Acceptance & Paired Tests:** Terminal validates input and displays live pass/quarantine/reject result.

### `COMMIT-210`: docs(inventory): document fabric roll receipt, quarantine, and inspection workflow

- **Target Files:**
  - `docs/integration/06-procurement-quarantine-inspection.md`
- **Implementation Intent:** Complete workflow documentation for procurement and QC.
- **Acceptance & Paired Tests:** Documentation reviewed.

### `COMMIT-211`: feat(production): create production order dispatch command schema

- **Target Files:**
  - `backend/production/schemas.py`
- **Implementation Intent:** Schema generating mrp.production for specific garment style variant with target quantity.
- **Acceptance & Paired Tests:** Schema validates production command.

### `COMMIT-212`: feat(odoo): implement create_manufacturing_order handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/mrp_handler.py`
- **Implementation Intent:** Create mrp.production for product.product variant with linked mrp.bom; confirm order.
- **Acceptance & Paired Tests:** Odoo creates confirmed MO with exploded raw material component requirements.

### `COMMIT-213`: test(odoo): test manufacturing order creation and component explosion in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_mrp_handler.py`
- **Implementation Intent:** Verify MO created with variant-specific components reserved.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-214`: feat(production): implement record_cutting_output service dispatching outbox command

- **Target Files:**
  - `backend/production/services/cutting_service.py`
- **Implementation Intent:** Record fabric roll consumed, cut pieces produced, and fabric scrap in meters.
- **Acceptance & Paired Tests:** Service enqueues record_production_run command with lot consumption.

### `COMMIT-215`: feat(odoo): implement record_production_run atomic handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/mrp_handler.py`
- **Implementation Intent:** Consume specific fabric stock.lot, record scrap quantity to scrap location, produce finished units.
- **Acceptance & Paired Tests:** Stock moves completed: raw lot deducted, scrap booked, finished goods received.

### `COMMIT-216`: test(odoo): test atomic fabric lot consumption and scrap recording in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_production_run.py`
- **Implementation Intent:** Verify raw fabric balance deducted and finished stock credited.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-217`: feat(production): implement finished goods packing and delivery dispatch service

- **Target Files:**
  - `backend/production/services/delivery_service.py`
- **Implementation Intent:** Record finished garments packed into cartons; dispatch validate_delivery_order command.
- **Acceptance & Paired Tests:** Service enqueues validate_delivery outbox command.

### `COMMIT-218`: feat(odoo): implement validate_delivery_order handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/stock_handler.py`
- **Implementation Intent:** Validate stock.picking for customer shipment; move finished goods from WH/FinishedGoods to Customers.
- **Acceptance & Paired Tests:** Picking validated; stock move completed to customer location.

### `COMMIT-219`: test(odoo): test delivery picking validation in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_delivery_handler.py`
- **Implementation Intent:** Verify stock picking status set to done.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-220`: feat(odoo): implement generate_customer_invoice handler in texon_bridge

- **Target Files:**
  - `odoo_addons/texon_bridge/models/account_handler.py`
- **Implementation Intent:** Create draft account.move (Customer Invoice) from delivered sale.order.
- **Acceptance & Paired Tests:** Draft customer invoice created in Odoo.

### `COMMIT-221`: test(odoo): test customer invoice creation from sale order in Odoo

- **Target Files:**
  - `odoo_addons/texon_bridge/tests/test_invoice_handler.py`
- **Implementation Intent:** Verify invoice created with matching buyer and delivered quantities.
- **Acceptance & Paired Tests:** Odoo test passes.

### `COMMIT-222`: test(e2e): implement end-to-end acceptance tests for scenarios 1 through 7

- **Target Files:**
  - `backend/tests/e2e/test_scenarios_1_to_7.py`
- **Implementation Intent:** Automated tests: style/variant generation, BOM selection, roll receipt, UOM validation, shortage, scrap, QC hold.
- **Acceptance & Paired Tests:** All 7 acceptance scenario tests pass against live Odoo test container.

### `COMMIT-223`: test(e2e): implement end-to-end acceptance tests for scenarios 8 through 15

- **Target Files:**
  - `backend/tests/e2e/test_scenarios_8_to_15.py`
- **Implementation Intent:** Automated tests: customer returns, concurrent commands, timeout-after-commit replay, worker reboot, out-of-order events, cross-tenant denial, and backup recovery.
- **Acceptance & Paired Tests:** All 8 acceptance scenario tests pass.

### `COMMIT-224`: chore(cutover): create zero-downtime production database cutover and migration script

- **Target Files:**
  - `scripts/cutover_production.py`
- **Implementation Intent:** Script to freeze legacy writes, reconcile outbox queue, execute delta sync to Odoo, and verify document totals.
- **Acceptance & Paired Tests:** Script executes dry-run validation and verifies zero discrepancy.

### `COMMIT-225`: docs(handover): create final implementation handover guide and operational runbook

- **Target Files:**
  - `docs/HANDOVER_RUNBOOK.md`
- **Implementation Intent:** Complete operational runbook for developers, devops, and support teams.
- **Acceptance & Paired Tests:** Runbook approved.

