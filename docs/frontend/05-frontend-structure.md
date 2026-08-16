# 05 — Frontend Structure

How the Next.js app (`frontend/texon-ui`) is organized and the conventions the
team should follow.

## Stack

- **Next.js 15 (App Router), React 19, TypeScript**
- **axios** for HTTP (single instance in `lib/api/client.ts`)
- **jose** (JWT helpers), **shadcn/ui** components, Tailwind
- Backend: Django 6 + GraphQL (see [03 — GraphQL API](03-graphql-api.md))

## Layout

```
frontend/texon-ui/
├── app/                  # Next.js App Router pages (one folder per ERP module)
│   ├── (auth)/…          # login, sign-up, forgot-password, reset-password, verify-otp, error
│   ├── buyers/  orders/  production/  hr/  inventory/  costing/  tna/  subcontract/
│   ├── commercial-management/  ie-planning/  quality-control/  scheduling/
│   ├── procurement/  compliance/  crm/  fixed-assets/  accounts-finance/
│   ├── multi-company/  performance/  planning/  reporting/  security/  settings/
│   └── admin/  ai-insights/  dashboards/  protected/  …
├── lib/
│   ├── api/              # REST clients — DEPRECATED for ERP modules (see below)
│   │   ├── client.ts     # axios instance + Bearer injection + auto-refresh
│   │   ├── auth.ts       # auth REST helpers
│   │   └── orders.ts, production.ts, hr.ts, …  # per-module clients → 404 today
│   ├── django-auth.ts    # token storage, login/register/logout helpers
│   ├── graphql/          # (create here) GraphQL queries + fetcher
│   └── …
├── proxy.ts              # session-cookie route protection
└── components/  hooks/  types/  …
```

## Session & Route Protection (`proxy.ts`)

- `publicPaths`: `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`,
  `/auth/reset-password`, `/auth/verify-otp`, `/auth/error` — always accessible.
- Everything else requires `sessionCookieExists()` (reads the auth cookie set by
  `lib/django-auth.ts`).
- On the client, gate UI with the same helpers to avoid flashes.

## API Client (`lib/api/client.ts`) — auth/legacy REST only

- Base URL: `NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'`
- Injects `Authorization: Bearer <access>` from localStorage
  (`django_access_token`).
- Interceptor: on 401 → checks `isTokenExpired(refresh)`, calls
  `POST /api/v1/auth/token/refresh/`, retries queued requests (`failedQueue`).
- Never store/read tokens manually in pages — use `lib/django-auth.ts` helpers.
- Only the auth endpoints (`lib/api/auth.ts`) still use REST. All ERP data
  access goes through the GraphQL-backed modules below.

## Data layer (GraphQL-backed) — use for ALL ERP data

Per-module clients (`lib/api/orders.ts`, `production.ts`, `hr.ts`, `buyers.ts`,
etc.) and server actions (`lib/data/*-actions.ts`) are thin wrappers over
GraphQL — the old `/api/v1/<module>/...` REST routes are **not registered** on
the backend and 404.

### Shared helpers (`lib/api/graphql.ts`)

| Helper | Returns | Notes |
|---|---|---|
| `gqlList(app, model, params?, token?)` | `{ data: rows[] }` | `all<X>` query; rows have **snake_case keys**, `id` coerced to `number`; `params` filter rows client-side |
| `gqlGet(app, model, id, token?)` | `{ data: row \| null }` | `<Model>ById` query |
| `gqlCreate / gqlUpdate / gqlDelete` | `{ data: row }` / `{ data: { success } }` | map to `create<X> / update<X> / delete<X>` mutations |
| `toSnake / toCamel` | string | key converters |

- Token resolution: explicit `token` param first, else `localStorage
  django_access_token` (browser). Server actions always pass
  `await getApiToken()`.
- `MODEL_REGISTRY` (`lib/graphql/registry.ts`) maps every model → `all<X>`
  query name + exact queryable fields (106 models, 25 apps). Registry fields
  are scalar/enum only (FK ids are not included — related names like
  `buyer_name` are not available through the generic layer).
- Return shapes intentionally mirror the old REST shapes (`{ data: rows }`),
  so page code (`res.data?.results ?? res.data`) kept working unchanged.

### `lib/data/*-actions.ts` (server actions)

`order-actions.ts`, `hr-actions.ts`, `inventory-actions.ts`,
`accounts-actions.ts`, `compliance-actions.ts`, `production-actions.ts` fetch
through `gqlList(..., await getApiToken())` and compute the summary objects
(`getInventorySummary`, `getAccountsSummary`, `getAttendanceSummary`,
`getDashboardSummary`, `getComplianceSummary`,
`getDashboardOrdersSummary`) from the fetched rows. Note: `getDocuments()`
(compliance) has no backend model and returns `[]`; `lib/api/ai.ts` is mocked
(no AI models on the backend).

### `app/data/` (all-data explorer)

`app/data/actions.ts` uses `fetchAllData(token)` (`lib/graphql/client.ts`) to
pull every registry model in one batched query (106 models, ~1.3k seeded
rows). `app/data/page.tsx` + `_components/data-explorer.tsx` render it with
model selector, search and CSV export. Route is guarded (307 → login).

## ⚠️ Deprecated: legacy per-module REST clients

The historical per-module clients under `lib/api/` and server actions under
`lib/data/` used `/api/v1/<module>/...` routes that are **not registered** on
the backend (404). They have been rewritten as GraphQL-backed wrappers — the
exported function names and signatures are unchanged, so page code did not
need edits. Keep using the wrappers; do not reintroduce REST calls.

Server actions use the shared helpers like this (see `app/data/actions.ts`):

```ts
"use server"
import { getApiToken } from "@/auth/lib/api-client"
import { gqlList } from "@/lib/api/graphql"

export async function getDepartments() {
  return (await gqlList("hr", "Department", undefined, await getApiToken())).data
}
```

### `/data` — Data Explorer

`app/data/` renders **every model's data** from one GraphQL request
(`FetchAllData`, ~106 aliased list queries): per-app collapsible cards, one
table per model, row counts, and a JSON detail view on row click. Use it as a
reference for what each model exposes and as a smoke test for the GraphQL
layer.

## Adding a New Page

1. Create `app/<module>/page.tsx` (App Router; server component that fetches
   via GraphQL, or a client component with `use client` + `gql`).
2. If the page needs no auth exemption, nothing else — `proxy.ts` guards it.
3. Put shared queries in `lib/graphql/<module>.ts` so they are reusable.
4. Follow existing pages: same table/form component patterns (shadcn/ui),
   same error handling (toast/alert on `errors`).

## Conventions

- **Dates** from GraphQL arrive as `YYYY-MM-DD` strings — render as-is or format
  client-side; don't `new Date()`-parse them into UTC-shifted dates.
- **Decimals** are strings (`"4.25"`) — parse only for arithmetic.
- **Enums**: pass enum names or raw strings; for reads, prefer the enum (typed).
- **FK writes**: use `<field>Id` args (`buyerId`, `productionLineId`, …).
- Mutations return `{ ok, errors, <model> }` — always check `ok` before reading
  the payload.