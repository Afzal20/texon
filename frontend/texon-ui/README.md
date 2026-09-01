# Texon ERP — Web Client (texon-ui)

Next.js (App Router) frontend for the **Texon ERP** — an Enterprise Resource
Planning system for the **Ready-Made Garment (RMG) industry**. It provides a
complete web UI for managing buyers, orders, merchandising, production,
inventory, procurement, HR, quality, finance, compliance and more, and talks
to a Django REST backend. This app was copied out of the original monorepo
[github.com/Afzal20/texon](https://github.com/Afzal20/texon) into its own
separate Git repository (together with the backend as a second repository)
so the two can be deployed to Vercel independently; the backend code lives
in `../../backend/` in this workspace.

## Live Deployment

| | URL |
|---|---|
| **App (frontend)** | https://texon-ui.vercel.app |
| **Backend API** | https://texon-backend.vercel.app |
| **API docs (Swagger UI)** | https://texon-backend.vercel.app/swagger-ui/ |

## Features

- **Full ERP module coverage** — dedicated app routes for merchandising,
  buyers & CRM, orders, commercial management (LCs, invoices, shipments),
  production, planning & scheduling, TNA, IE planning, inventory,
  procurement, costing, accounts & finance, fixed assets, HR & payroll,
  performance, quality control, compliance, subcontracting, reporting,
  security/RBAC, settings and a Django-style admin section
- **JWT authentication** — login, registration, email verification, password
  reset, Google/GitHub social login; Bearer token injection and transparent
  auto-refresh on 401 (`lib/api/client.ts`), plus session-cookie route
  protection via `middleware.ts`
- **Generic REST data layer** — `lib/api/rest.ts` maps every module 1:1 to
  the backend's `/api/v1/<slug>/` endpoints (verified against the live
  OpenAPI schema), with shared `restList/restGet/restCreate/restUpdate/
  restDelete` helpers, filtering, search and pagination
- **AI assistant (`ai-insights`)** — chat UI with conversation history,
  streaming responses over WebSocket with automatic fallback to plain HTTP
  when WebSockets are unavailable
- **Modern stack** — React 19, Tailwind CSS, shadcn/radix UI components,
  TanStack Table, Recharts dashboards, react-hook-form + zod validation,
  dark/light theming

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
| `NEXT_PUBLIC_WS_URL` | derived from API URL | WebSocket base (AI chat streaming) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend base URL |
| `AUTH_SECRET` | — | Session signing secret (min 32 chars) |

## Known Limitations on the Deployed Demo

These apply to https://texon-ui.vercel.app only — running the app locally
against a local backend behaves fully.

1. **AI chat streams over WebSocket, which the free hosting plan can't
   support.** The AI assistant page opens a WebSocket to the backend for
   token-by-token streaming. The deployed backend runs on Vercel's Hobby
   (free) plan, whose serverless functions have strict execution-time
   limits that make long-lived WebSocket connections impractical — so
   streaming replies and other real-time features don't work on the live
   site. The chat UI detects this and automatically falls back to a plain
   HTTP request, so you can still chat with the assistant, but the answer
   arrives as a single block instead of word-by-word, and very long
   answers can be cut off by the function time limit.
2. **The AI behind the assistant is a free, rate-limited API.** The
   backend uses a free OpenRouter API key (free-tier `deepseek` model).
   It is throttled and intermittently unavailable, so replies from the
   AI assistant on the live demo can be slow, or occasionally fail with
   an error message ("The AI service is unavailable right now. Please
   try again."). Retrying after a short wait usually works; every other
   module (orders, production, HR, …) is unaffected.

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

More documentation: [`API_DOCUMENTATION.md`](../../backend/API_DOCUMENTATION.md)
in the backend, or the live Swagger UI at `<API_URL>/swagger-ui/`.