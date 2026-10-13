# Local development and checks

Use Node from the root `.node-version`, pnpm 10.28.2, and uv. The backend Python version and dependencies are defined in `backend/pyproject.toml` and `backend/uv.lock` (currently Python 3.14+).

```bash
pnpm install --frozen-lockfile
pnpm --dir frontend/texon-ui install --frozen-lockfile
uv sync --directory backend --frozen
pnpm test
pnpm check:backend
pnpm check:migrations
```

The root `pnpm test` runs the Django backend suite followed by the frontend Vitest suite. Install the frontend dependencies with `pnpm --dir frontend/texon-ui install --frozen-lockfile` first. It changes to `backend` before discovery: invoking Django tests from the repository root can incorrectly discover zero tests. Real Odoo business integration tests remain separate backlog work; this command does not yet verify those workflows.

The backend test runner creates a separate test database. Do not run migrations or seed commands against the checked-in development database to test a change. Local virtual environments and generated backend artifacts are ignored.

Run targeted backend checks with `uv --directory backend run --frozen python manage.py test core --noinput`. Use the full root test command before completing a part. A successful test command does not establish Odoo runtime or production readiness.

## Continuous integration

`.github/workflows/backend.yml` runs the locked backend checks and a separate frontend test/typecheck/build job for pushes and pull requests. The CI matrix runs against SQLite and an isolated PostgreSQL 16 service. Real Odoo runtime workflow tests remain separate backlog work. Local checks can validate the commands, but the hosted GitHub Actions run must pass before its result is claimed.

## Backend health probes

`GET /health/live/` checks that the HTTP process can respond without touching the database. `GET /health/ready/` checks a database round trip and returns 503 on database failure. Both return minimal status JSON, disable caching, and accept GET/HEAD only. These are backend infrastructure probes; neither claims that Odoo is connected, modules are installed, migrations are current, or business data is synchronized. Monitor Odoo/integration health separately.

## PostgreSQL

Set `DATABASE_URL` to a PostgreSQL URL with an explicit database name. The accepted schemes are `postgres` and `postgresql`; URL-encode special characters in credentials. SSL options such as `?sslmode=require` are forwarded to psycopg. Use a dedicated database/user for Texon; never point Django at Odoo's database.

When `DJANGO_DEBUG=False`, a PostgreSQL URL is mandatory. With debug enabled and no URL, the legacy local SQLite database remains available. This setting does not migrate or overwrite existing data; migration/cutover is a separate task.

For backend tests, use an isolated PostgreSQL instance and a user allowed to create/drop test databases. Django creates `test_<database name>` and removes it after tests. Do not give a production connection URL to the test runner. Run the same `pnpm test`, `pnpm check:backend`, and `pnpm check:migrations` commands with this environment selected. Database URLs and credentials must remain outside committed environment files.

ASGI connections use `CONN_MAX_AGE=0`, and PostgreSQL has a default five-second connection timeout. See [Django connection guidance](https://docs.djangoproject.com/en/6.0/ref/databases/) and [URL configuration](https://github.com/jazzband/dj-database-url).

## Frontend runtime

Use the root Node version and pnpm version for the frontend as well. Next.js 16.2.9, React/React DOM 19.2.7, and the matching Next.js ESLint configuration are pinned; the frontend pnpm lockfile captures the remaining dependency graph. The root lockfile belongs to orchestration and the frontend lockfile belongs to the UI package. Do not regenerate an npm lockfile.

```bash
pnpm --dir frontend/texon-ui install --frozen-lockfile
pnpm --dir frontend/texon-ui typecheck
pnpm --dir frontend/texon-ui build
```

The frontend lint command uses native flat configuration. Existing lint findings are tracked separately from reproducible installation/typechecking; do not suppress them globally to claim a clean lint run.

Validation on 2026-10-13: frozen install, TypeScript, and the 215-page production build pass. The build required a Suspense boundary around the legacy weekly planning view's current-time calculation. Full lint remains unresolved: 568 errors and 74 warnings were reported by the matched configuration, predominantly existing explicit `any` usage (548 errors). This is a known source cleanup backlog, not a passed check.

## Frontend tests

Vitest uses jsdom, React Testing Library, and jest-dom matchers. Test files use `.test.ts`/`.test.tsx`; cleanup runs after each test. Start with `pnpm test:frontend` or use `pnpm --dir frontend/texon-ui test:watch`. Initial tests exercise the workspace data hook's loading, empty results, stale-request isolation, and stable request identity. They do not claim the existing network-error suppression is fixed.
