# Phase 10 — Frontend Shell (Parallel with Phase 6–7)

---

- [ ] **10.1** Setup Next.js project structure

  ```
  /src/app
    (auth)/login/page.tsx
    (dashboard)/layout.tsx
    (dashboard)/page.tsx          ← main KPI dashboard
    (dashboard)/orders/page.tsx
    (dashboard)/inventory/page.tsx
    (dashboard)/production/page.tsx
    (dashboard)/quality/page.tsx
  ```

- [ ] **10.2** API client layer (`src/lib/api.ts`)

  Axios or fetch with:

  - Base URL from env
  - JWT attach interceptor
  - 401 → redirect to login
  - Refresh token logic

- [ ] **10.3** Auth flow

  - Login page → `POST /api/auth/login/`
  - Store access token in memory (**NOT** localStorage)
  - Store refresh token in httpOnly cookie
  - Context/Zustand for user state + permissions

- [ ] **10.4** Layout components

  - Sidebar (role-aware — shows only permitted nav items)
  - Header (user info, notifications bell, logout)
  - Responsive: sidebar collapses on mobile

- [ ] **10.5** Dashboard page

  - 4 KPI cards: Output Today, Efficiency %, DHU, Stock Alerts
  - Line production chart (Recharts BarChart)
  - WIP pipeline visualization
  - Orders at risk list

- [ ] **10.6** Orders page

  TanStack Table with: PO number, Buyer, Style, Qty, Ship Date, Status, Progress %

  - Filters: Status, Buyer, Date range
  - Click → Order detail page

- [ ] **10.7** Daily Production Entry (mobile-optimized)

  - Large buttons, minimal typing
  - Select: Line, Shift, Date
  - Enter: Target, Actual, Rejects
  - This is what operators use on the floor
  - Make it work on a cheap Android phone

- [ ] **10.8** Inventory page

  - Stock balance table per material
  - Red highlight: below reorder point
  - Stock movement history per material/batch

---

**Previous:** [Phase 9](phase-09-dashboard-reports.md) · **Next:** [Pre-factory visit checklist](pre-factory-visit-checklist.md)
