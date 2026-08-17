# Frontend Fetch & Render Plan (All Pages)

Status: **Planned** | Updated: 2026-08-17 | Companion: `docs/backend/01-rest-api-design.md`

## 1. Goal

Every ERP page must fetch and render **real backend data** — no dummy/hardcoded rows, no `localStorage` token fallback in the browser. Transport: **REST** (per `docs/backend/01-rest-api-design.md`, 103 model endpoints at `/api/v1/`). Rendering: **server-side page-data layer + thin client components** so the JWT never leaves the server for data requests.

## 2. Inventory (215 pages)

| Bucket | Count | Handling |
|---|---|---|
| Data pages (fetch backend) | ~195 | Convert to server components with page-data functions |
| Admin dummy pages | 8 (already rewritten) | Move `gqlList` → REST page-data functions |
| Static/placeholder pages | ~17 | Leave as-is (nav indexes, `PlaceholderPage` stubs) |
| `auth/*` pages (login/register/etc.) | 5 | Leave as-is (client-side, session flow) |

Breakdown by module (total = data pages to wire):

- merchandising **52**, production **21**, inventory **18**, commercial-management **15**, hr **12**, accounts-finance **11**, ie-planning **10**, quality-control **11**, tna **9**, admin **8**, procurement **8**, reporting **7**, crm **5**, multi-company **5**, others ≤2 (fixed-assets, subcontract, orders, buyers, compliance, costing, performance, planning, scheduling, security, settings, modules, protected).

## 3. Architecture (3 tiers)

```
REST API  ←  lib/api/server.ts (server-only fetchers, JWT from session)
                │
                ├─ lib/data/<module>-actions.ts  — page-data functions
                │     get<Module>PageData(): Promise<{ summaries, rows, ... }>
                │
                ▼
async Server Components (page.tsx)  — await page data, render client UI with props
                │
                ▼
Client components (<Module>Workspace / _components/*)  — props + local interactivity
```

### Tier A — `lib/api/server.ts` (new, server-only)
- `getApiToken()` (exists in `auth/lib/api-client.ts` — session cookie → JWT)
- `restList(path, { filters, search, ordering, page })` / `restGet(path, id)` — thin wrappers over `client.ts` axios instance with Bearer token; returns `{ data: rows }`, unwraps DRF `results` pagination envelope
- `fetchPageData(fetchers)` — runs fetchers in parallel; on auth failure → `redirect("/auth/login")`; on other errors → throw (caught by route `error.tsx`)
- **No `localStorage` token usage on server.**

### Tier B — `lib/data/<module>-actions.ts` (extend existing)
One exported function per page (or per page group), named `get<PageName>Data()`:
- Fetches every list the page needs in parallel (one `Promise.all`), returns plain serializable object
- Computes summaries/KPIs from rows (existing pattern: `getDashboardOrdersSummary`, `getAccountsSummary`)
- Leaves filtering/searching/formatting to the client component (workspaces already accept `metrics`/`rows`/`rawItems` props)

### Tier C — pages
- `page.tsx` becomes `export default async function Page()` with **no `"use client"`**; calls page-data function; passes props to client component
- Interactive markup moves to client components (existing `*-workspace.tsx` files and new `_components/*` under each route)
- Route-level `loading.tsx` (skeleton) + `error.tsx` (retry button) added per segment
- Search/filter/tabs/pagination remain client state over the passed-in rows

## 4. Security

- JWT only read server-side from the Iron-session cookie; browser never stores it for data fetches
- All REST calls go through the backend auth/permission layer (`JWTAuthentication` + `DjangoModelPermissions`)
- Auth guard: page-data layer throws → `redirect("/auth/login")` (middleware `sessionCookieExists` stays as first line of defense)
- No secrets, credentials, or raw SQL in client bundles

## 5. Performance & time complexity

- One page = 1–4 REST requests in parallel (not per-row): page fetches 20–100 rows (DRF pagination cap) — bounded payloads
- Server-side rendering removes client mount refetch (no double fetch), `useEffect` loading states gone
- `React.cache()` around page-data fetches dedupes overlapping requests per render
- `fetch` with `next: { revalidate: 30 }` (or `no-store` for live ERP data) per endpoint config — revalidation strategy decided per module during conversion
- Workspace tables render only the rows passed (≤100), client-side search filters in memory — O(n) per keystroke, n ≤ 100

## 6. Execution order (by module, smallest → largest)

Each module is independently shippable + verifiable.

| Phase | Module | Pages | Notes |
|---|---|---|---|
| 0 | Foundation | — | `lib/api/server.ts`, route `loading/error` templates, regenerate `lib/api/*.ts` over REST, verify transport |
| 1 | orders, buyers, security, settings, admin | 12 | Proof of pattern (admin pages migrate from `gqlList` to REST) |
| 2 | accounts-finance, fixed-assets, costing, compliance, performance, planning, scheduling, modules, protected | 20 | Simple list/detail pages |
| 3 | crm, multi-company, subcontract, procurement, reporting | 29 | Workspace-driven modules (props already supported) |
| 4 | hr, ie-planning, quality-control, tna | 42 | Medium complexity (KPIs + tables) |
| 5 | accounts-finance (deep), commercial-management | 26 | Nested pages, many fetches each |
| 6 | inventory, production, merchandising | 91 | Largest modules, done last after pattern is proven |

Phase 0 checklist:
1. `gen_rest.py` regenerates `lib/api/*.ts` (481 exports, same names, REST-backed)
2. `lib/api/server.ts` helpers + `restList`/`restGet`
3. Root `loading.tsx`/`error.tsx`; curl smoke matrix
4. `npx tsc --noEmit` + `npx eslint` green

## 7. Per-module conversion recipe (repeat per page)

1. Add `get<Page>Data()` to `lib/data/<module>-actions.ts` (parallel fetches, typed returns)
2. Convert `page.tsx`: async server component, remove `"use client"`, move interactive JSX to `_components/<Page>Client.tsx`
3. Pass props; delete `useEffect` fetch + `localStorage` token fallback
4. Add segment `loading.tsx`/`error.tsx` where missing
5. Lint + typecheck; spot-check in browser with live backend

## 8. Verification

- `npx tsc --noEmit`, `npx eslint`, `npm run build` — zero errors
- Grep gates: no `gqlList` in `app/`; no `getStoredAccessToken` in `app/` or `components/` (auth pages excepted); no hardcoded row arrays rendered from data pages
- Browser spot-check on live stack: login → dashboard → orders → admin → one page per module (log `next-dev` / `graphql-server` clean)
- Count check: every data page renders ≥1 backend record or an explicit empty state

## 9. Out of scope

- GraphQL gateway (stays, per decision; no new consumers)
- `auth/*` pages and session flow (already working)
- Static placeholder pages
- AI insights (mocked `lib/api/ai.ts` by design)
