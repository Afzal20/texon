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

The app talks to the Django REST API (`NEXT_PUBLIC_API_URL`, default
`http://localhost:8000`; production: https://texon-backend.vercel.app).
OpenAPI schema: `<API_URL>/api/schema/` (Swagger UI: `/swagger-ui/`).

- **Auth**: JWT bearer tokens (SimpleJWT + dj-rest-auth):
  - Login: `POST /api/users/api/token/` or `POST /api/v1/auth/login/`
  - Refresh: `POST /api/users/api/token/refresh/` or `POST /api/v1/auth/token/refresh/`
  - User/password/social: `/api/v1/auth/*` — see `lib/api/auth.ts`
- **Data**: generic CRUD via `/api/v1/<slug>/` — registry in
  `lib/api/rest.ts` maps `(app, model)` → slug 1:1 against the live schema
  (`lib/api/all_endpoints.txt`). Helpers: `restList/restGet/restCreate/
  restUpdate/restDelete`.


## Documentation

See `docs/frontend/` in the repo root for the full team guide (auth, GraphQL,
data models, conventions).