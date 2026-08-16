# Texon ERP — Frontend Team Documentation

Documentation for developers working on the **Texon ERP** web client
(`frontend/texon-ui`, Next.js App Router) against the Django backend
(`backend/`, Django 6 + GraphQL).

## Documentation Index

| Document | Purpose |
|---|---|
| [01 — Getting Started](01-getting-started.md) | Local environment setup (backend + frontend), env vars, seeding, running |
| [02 — Authentication](02-authentication.md) | JWT auth flow, real REST auth endpoints, GraphQL auth, known frontend mismatches |
| [03 — GraphQL API](03-graphql-api.md) | GraphQL quickstart, naming conventions, auth rules; full reference in the root `frontend_graphql_guide.md` |
| [04 — Data Models](04-data-models.md) | Accurate model reference (every app, every model, field types, relations) |
| [05 — Frontend Structure](05-frontend-structure.md) | App conventions: routes, API clients, session handling, adding a page |

## Ready-made reference tool

Open **`http://localhost:3000/data`** (after login) — the Data Explorer fetches
**every model in the ERP in one GraphQL request** and renders it per app/model
tables (counts + JSON detail). It doubles as a smoke test for the whole
GraphQL layer (`lib/graphql/` in `frontend/texon-ui`).

## API Surface — What Actually Works

| API | Endpoint | Status |
|---|---|---|
| **GraphQL** (primary data API) | `POST /graphql/` | ✅ Full ERP: 228 queries, 321 mutations, JWT-authenticated |
| **REST — Auth** | `/api/v1/auth/*` (dj-rest-auth + SimpleJWT) | ✅ Login, logout, user, password, registration, refresh, devices |
| **REST — Accounts** | `/api/v1/accounts/*` (DRF ViewSets) | ✅ chart-of-accounts, journal-entries, accounts-payable, accounts-receivable, expenses, cost-centers |
| **JWT token endpoint** | `POST /api/users/api/token/` | ✅ SimpleJWT `TokenObtainPairView` (email/password) |
| REST for other modules (`/api/v1/buyers/`, `/api/v1/hr/`, ...) | — | ❌ Routes not registered in the backend; per-module clients in `lib/api/*.ts` currently call **non-existent endpoints**. Use GraphQL instead. |
| Django admin / Operations site | `/admin/`, `/operations/` | ✅ Internal only |

> **Key decision for the team:** every ERP domain (buyers, merchandising, orders,
> production, costing, HR, inventory, TNA, subcontract, quality, etc.) is exposed
> through **GraphQL**. Do not build new REST clients — use GraphQL.

## Credentials (seeded database)

- Admin: `admin@texon.com` / `Test@123`
- Reseed anytime: `python seed_all.py` (from `backend/`)