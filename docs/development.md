# Local development and checks

Use Node from the root `.node-version`, pnpm 10.28.2, and uv. The backend Python version and dependencies are defined in `backend/pyproject.toml` and `backend/uv.lock` (currently Python 3.14+).

```bash
pnpm install --frozen-lockfile
uv sync --directory backend --frozen
pnpm test
pnpm check:backend
pnpm check:migrations
```

The root `pnpm test` currently runs the Django backend suite. It changes to `backend` before discovery: invoking Django tests from the repository root can incorrectly discover zero tests. Frontend and real Odoo integration suites will be added to this entry point when their harnesses exist; this command does not yet verify them.

The backend test runner creates a separate test database. Do not run migrations or seed commands against the checked-in development database to test a change. Local virtual environments and generated backend artifacts are ignored.

Run targeted backend checks with `uv --directory backend run --frozen python manage.py test core --noinput`. Use the full root test command before completing a part. A successful test command does not establish Odoo runtime or production readiness.

## Continuous integration

`.github/workflows/backend.yml` runs the root dependency install, locked uv sync, Django system check, migration drift check, and backend suite for pushes and pull requests. This first CI job uses an isolated SQLite test database; PostgreSQL and Odoo runtime jobs are separate remaining backlog items. Local checks can validate the commands, but the hosted GitHub Actions run must pass before its result is claimed.

## Backend health probes

`GET /health/live/` checks that the HTTP process can respond without touching the database. `GET /health/ready/` checks a database round trip and returns 503 on database failure. Both return minimal status JSON, disable caching, and accept GET/HEAD only. These are backend infrastructure probes; neither claims that Odoo is connected, modules are installed, migrations are current, or business data is synchronized. Monitor Odoo/integration health separately.
