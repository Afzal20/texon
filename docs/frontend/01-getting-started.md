# 01 — Getting Started

## Prerequisites

- Python 3.14 + [uv](https://docs.astral.sh/uv/)
- Node.js 20+ (Next.js 15 / React 19)
- No external services required — SQLite database, everything local.

## Backend

```bash
cd backend
uv sync                     # installs deps incl. graphene-django (see pyproject.toml)
.venv/bin/python manage.py migrate
.venv/bin/python seed_all.py   # seeds all apps + creates admin@texon.com / Test@123
.venv/bin/python manage.py runserver 8000 --noreload
```

Verify:

- GraphQL playground (needs admin login first): http://localhost:8000/graphql/
- Token endpoint: `POST http://localhost:8000/api/users/api/token/`

```
curl -X POST http://localhost:8000/api/users/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@texon.com", "password": "Test@123"}'
# → {"access": "...", "refresh": "..."}
```

## Frontend

```bash
cd frontend/texon-ui
npm install
cp .env.example .env.local   # if present, else create manually (see below)
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the Django backend (used by `lib/api/client.ts`) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend base URL (used by auth redirects) |

### Quick smoke test

```bash
# 1. Get tokens
curl -s -X POST http://localhost:8000/api/users/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@texon.com","password":"Test@123"}'
# 2. Query GraphQL
curl -s http://localhost:8000/graphql/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ACCESS>' \
  -d '{"query": "{ allBuyers { id name } }"}'
# → {"data": {"allBuyers": [...]}}
```

## Troubleshooting

- **GraphiQL shows errors** → log in at http://localhost:8000/admin/ first
  (GraphiQL authenticates via the Django session cookie).
- **API responds `Authentication required...`** → the `Authorization: Bearer <access>`
  header is missing/expired. Refresh via `POST /api/v1/auth/token/refresh/`.
- **Changed Django models?** → `manage.py makemigrations <app>` + `migrate` + reseed.
- **Backend on a different port** → update `NEXT_PUBLIC_API_URL` and restart `npm run dev`
  (Next.js caches env vars at build/dev-server start).