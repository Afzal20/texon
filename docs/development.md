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
