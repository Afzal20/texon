# 03 — GraphQL API

The GraphQL API is the **primary data API** for the ERP. It is auto-generated
from the Django models by `backend/core/graphql.py` and served at
`POST /graphql/` (gateway schema in `backend/config/graphql/schema.py`).

## Endpoint & Authentication

- **URL:** `http://localhost:8000/graphql/` (i.e. `${NEXT_PUBLIC_API_URL}/graphql/`)
- **Method:** POST, `Content-Type: application/json`
- **Auth:** `Authorization: Bearer <access>` — required for **every** request
- **Playground:** http://localhost:8000/graphql/ (login at `/admin/` first, or
  add the Bearer header via the browser devtools)

## Full Reference

The complete contract — hand-written Orders & Production queries, all auto-
generated queries by app, mutations, and field/type conventions — is in:

> **`frontend_graphql_guide.md`** (repo root)

Sections: 1–3 contract queries, 3C/4 generated queries per app, 5 advanced
patterns, 6 mutations reference, 7 model additions.

## Schema at a Glance

- **228 queries, 321 mutations** (auto-generated from models).
- Naming conventions:

| Pattern | Example |
|---|---|
| List all | `allBuyers`, `allPurchaseOrders`, `allOeeLogs` (pluralized) |
| Get by id | `buyerById(id: ID!)`, `oeeLog(id: ID!)` |
| Create | `createBuyer(input: {...})` |
| Update | `updateBuyer(id: ID!, input: {...})` |
| Delete | `deleteBuyer(id: ID!)` |
| FK argument | `<field>Id` (e.g. `buyerId`, `styleId`) — never pass `buyer: {...}` |
| M2M argument | `<field>Ids` |
| Dates | `YYYY-MM-DD` |
| DateTimes | ISO-8601 (`2026-08-17T10:30:00Z`) |
| Decimals | **strings** (`"123.45"`), not floats |

- Every generated model type includes `id`, `created_at`, `updated_at` where the
  model has them.
- Enum fields become GraphQL enums (`status: Status` etc.); you can pass enum
  names or raw strings.

## Mutations Shape

```graphql
mutation {
  createPurchaseOrder(input: { buyerId: 3, styleId: 5, poNumber: "PO-1001",
                              orderDate: "2026-08-17", deliveryDate: "2026-12-01",
                              quantity: 5000, unitPrice: "4.25" }) {
    ok
    errors
    purchaseOrder { id poNumber status }
  }
}
```

- Success: `ok: true`, `errors: null`
- Failure: `ok: false`, `errors` (string or list of strings)
- Delete mutations return `{ ok, errors, deletedId }`

## Example Queries

```graphql
# List with filters + ordering
query {
  allPurchaseOrders(status: "confirmed", ordering: "-created_at") {
    id poNumber status quantity totalValue
    buyer { id name }
    style { id name styleNumber }
  }
}

# Single record + nested relations
query {
  purchaseOrderById(id: 1) {
    id poNumber orderDate deliveryDate
    items { id color size qty }
    stageLogs { id stage changedAt }
  }
}
```

### Nested writes (two steps — no nested create/update)

```graphql
mutation {
  createOrderItem(input: { purchaseOrderId: 1, color: "Black", size: "M", qty: 120 }) {
    ok errors
    orderItem { id color qty }
  }
}
```

## Conventions & Exclusions (for reference)

Defined in `backend/core/graphql.py`:

- `SKIP_APPS`: admin, auth, sessions, token_blacklist, social auth, rest-auth
  internals, etc. → no GraphQL types for them.
- `QUERY_EXCLUDE`: `orders.Order` (kept as PO-only to avoid confusion with
  `orders` business domain), `production.HeatmapData` (redundant list) —
  hand-written queries exist instead (see guide).
- `MUTATION_EXCLUDE`: none — every model has full CRUD, including
  `authentication.User` (`createUser`/`updateUser`/`deleteUser`; passwords are
  hashed automatically and never returned).
- Hand-written (guide-specified) types in `backend/orders/graphql_schema.py` and
  `backend/production/graphql_schema.py` are merged into the gateway schema —
  including fields like `allSalesOrders`, `allProductionUnits`, `allOeeLogs`.

## REST → GraphQL Migration Notes

- Do **not** create new REST endpoints for ERP modules; every model already has
  full GraphQL CRUD.
- The per-module REST clients in `frontend/texon-ui/lib/api/*.ts`
  (`getBuyers`, `getProductionOrders`, ...) hit unregistered `/api/v1/<module>/`
  routes and will 404 — replace with GraphQL calls.
- Hand-written GraphQL pairs that have **no** generic equivalent are documented
  in `frontend_graphql_guide.md` §3–4 (e.g. `GetProductionDashboard`,
  `GetAllOrdersWithDetails`, `orderByPoNumber`).