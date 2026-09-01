# Texon ERP — Backend API

Django 6 + Django REST Framework backend powering **Texon**, an Enterprise
Resource Planning (ERP) system for the **Ready-Made Garment (RMG) industry**.
It exposes a single versioned REST gateway (`/api/v1/`) covering the entire
garment-manufacturing value chain — from merchandising and orders to
production, inventory, HR, finance and compliance — plus a built-in AI
assistant and interactive OpenAPI/Swagger documentation.

## Live Deployment

| | URL |
|---|---|
| **API base** | https://texon-backend.vercel.app |
| **Swagger UI (interactive docs)** | https://texon-backend.vercel.app/swagger-ui/ |
| **OpenAPI schema** | https://texon-backend.vercel.app/api/schema/ |
| **Frontend (this API powers it)** | https://texon-ui.vercel.app |

## Features

- **100+ REST resources** (`/api/v1/<slug>/`, full CRUD + list filtering,
  search and pagination) spanning every ERP module:
  - **Merchandising & Commercial** — buyers, styles, seasons, orders, order
    items, samples, letters of credit, invoices, bills of exchange,
    realizations, shipments, disbursements, supplier documents
  - **Production** — production plans/orders/lines/shifts, line plans and
    capacities, cutting, sewing, inline & end-line QC, final inspections,
    OEE logs, downtimes, bottleneck alerts, heatmap data
  - **Inventory & Procurement** — fabrics, trims, accessories, warehouses,
    stock movements, requisitions, bookings, purchase orders, suppliers,
    physical inventories
  - **HR & Payroll** — employees, departments, designations, attendance,
    leaves, overtime, bonuses, salary sheets, skill inventory, performance
  - **Finance & Accounts** — chart of accounts, journal entries, cost
    centers, cost sheets, pre-costings, expenses, AP/AR, fixed assets and
    depreciation
  - **Quality, Compliance & CRM** — defect categories/logs, rejection
    reports, compliance records, buyer enquiries, communications, ratings,
    portfolios, risk assessments
  - **Planning & Reporting** — TNA timelines, tasks, schedules, dashboards,
    reports, budgets, quotations and style analyses
- **Authentication & security** — JWT access/refresh tokens (SimpleJWT),
  email registration + verification, password reset/change, Google &
  GitHub social login, device/session management with per-token revoke
- **RBAC** — roles, permissions, user-role assignments (incl. bulk assign)
  and a `my-permissions` endpoint guarding every action
- **AI assistant** — `POST /api/v1/ai/chat/` with per-user conversation
  history (`/api/v1/ai/conversations/`), backed by any OpenAI-compatible
  LLM provider (OpenRouter by default, also OpenAI, DeepSeek, local
  LM Studio)
- **API documentation** — OpenAPI 3 schema generated with drf-spectacular
  and served through Swagger UI
- **Admin panel** — Django admin plus a secondary "operations" admin site
- **Seeding** — `seed_all.py` / `seed.sh` scripts for demo data

## Tech Stack

- **Framework**: Django 6, Django REST Framework
- **Database**: PostgreSQL (Supabase in production), SQLite for local dev
- **Auth**: SimpleJWT, dj-rest-auth, django-allauth
- **Docs**: drf-spectacular (OpenAPI 3 / Swagger UI)
- **Realtime (local)**: Django Channels WebSocket endpoint for token-level
  AI streaming (`/ws/ai/chat/`)
- **Deployment**: Vercel serverless functions (`api/index.py` + WhiteNoise)

## Local Development

```bash
# from the backend/ directory
uv sync                              # create .venv and install dependencies
uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py runserver
```

Then open:

- **Swagger UI**: http://localhost:8000/swagger-ui/
- **Django admin**: http://localhost:8000/admin/

### Environment variables

```env
DJANGO_SECRET_KEY=your_secret_key_here
DJANGO_DEBUG=True
ALLOWED_HOSTS=*

# PostgreSQL (optional — falls back to SQLite locally)
DB_NAME=texon
DB_USER=texon
DB_PASSWORD=texon_password
DB_HOST=127.0.0.1
DB_PORT=5432

# AI provider (OpenRouter free tier by default)
AI_LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=deepseek/deepseek-chat

# Email (optional in dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

See [`DEPLOY.md`](DEPLOY.md) for full Vercel deployment instructions and
[`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) for endpoint examples.

## Deployment (Vercel)

This application was copied out of the original monorepo
[github.com/Afzal20/texon](https://github.com/Afzal20/texon) into its own
separate Git repository (together with the frontend as a second repository)
so that the two can be deployed to Vercel independently. The backend is
deployed on Vercel as a Python serverless function:
`vercel.json` routes all traffic to `api/index.py` (the Django WSGI app),
and `config/settings.py` auto-detects `VERCEL=1`. Migrations are **not**
applied automatically — run `uv run manage.py migrate` locally against the
production database after the first deploy.

## Known Limitations on the Deployed Demo

1. **WebSockets are not available.** Vercel's Hobby (free) plan runs the
   backend as short-lived serverless functions with strict execution-time
   limits, so long-lived WebSocket connections (Django Channels consumers)
   are impractical. As a result the **token-by-token streaming chat**
   (`/ws/ai/chat/`) does not work on the live deployment — features that
   depend on it (real-time streaming responses) are effectively disabled
   there. The backend automatically falls back to the plain-HTTP,
   non-streaming endpoint `POST /api/v1/ai/chat/`, so the AI assistant
   still works — you just receive the full reply in one block instead of
   streamed tokens. Running the project locally (where Channels work)
   restores full streaming behavior.
2. **The AI provider runs on a free API key.** Chat completions go through
   OpenRouter's **free tier** (`deepseek/deepseek-chat`). Free models are
   rate-limited, throttled and occasionally go offline, so AI replies can
   be slow or intermittently fail with a `502 Bad Gateway`
   ("The AI service is unavailable right now"). Retrying usually resolves
   it. For production use, switch to a paid provider via
   `AI_LLM_PROVIDER` (`openai`, `deepseek`, …) and its API key env var —
   no code changes required.
