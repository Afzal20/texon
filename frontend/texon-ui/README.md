# Texon ERP — Web Client

Next.js (App Router) frontend for the Texon ERP. Backend: Django 6 + GraphQL
at `backend/` in this repo.

## Quick Start

```bash
npm install
cp .env.example .env.local   # or create manually, see Env vars below
npm run dev                  # http://localhost:3000
```

The backend must be running (see `backend/README.md` / `docs/frontend/`):

```bash
cd backend && .venv/bin/python manage.py runserver 8000 --noreload
```

Test login (seeded): `admin@texon.com` / `Test@123`

## Env Vars

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Django backend base URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend base URL |

## Structure

- `app/` — pages, one folder per ERP module (buyers, orders, production, hr, …)
- `lib/api/client.ts` — axios instance (Bearer JWT injection + auto-refresh)
- `lib/django-auth.ts` — auth helpers & token storage
- `proxy.ts` — session-cookie route protection

## API Access

- **GraphQL** (`POST <API_URL>/graphql/`) is the primary data API — full ERP
  CRUD. See `docs/frontend/03-graphql-api.md` and `frontend_graphql_guide.md`
  (repo root).
- REST auth: `/api/v1/auth/*` (login, refresh, user, password, registration).
- ⚠️ The per-module REST clients in `lib/api/*.ts` target `/api/v1/<module>/`
  routes that are **not registered** on the backend — use GraphQL instead.

## Documentation

See `docs/frontend/` in the repo root for the full team guide (auth, GraphQL,
data models, conventions).