# Texon — RMG ERP System

A comprehensive Enterprise Resource Planning (ERP) system for the
Ready-Made Garment (RMG) industry. Texon streamlines production, inventory,
order management, and the day-to-day operational workflows of garment
manufacturing — from merchandising and cost sheets to shop-floor quality,
HR, and finance.

This repository is the main monorepo containing both applications:

| Directory | Application |
|---|---|
| `backend/` | Django 6 + Django REST Framework API — see [`backend/README.md`](backend/README.md) |
| `frontend/texon-ui/` | Next.js (App Router) web client — see [`frontend/texon-ui/README.md`](frontend/texon-ui/README.md) |

The two applications were also copied into separate Git repositories so they
can be deployed to Vercel independently.

## Live Deployment

| | URL |
|---|---|
| **Web app (frontend)** | https://texon-ui.vercel.app |
| **Backend API** | https://texon-backend.vercel.app |
| **API docs (Swagger UI)** | https://texon-backend.vercel.app/swagger-ui/ |

## Features

### Backend
- 100+ REST resources under `/api/v1/` (full CRUD with filtering, search
  and pagination) covering merchandising & commercial, production, inventory
  & procurement, HR & payroll, finance & accounts, quality & compliance,
  planning & reporting
- JWT authentication (SimpleJWT) with registration, email verification,
  password reset, Google & GitHub social login, and device/session management
- Role-based access control (roles, permissions, user-role bulk assignment)
- AI assistant (`/api/v1/ai/chat/`) with per-user conversation history,
  backed by any OpenAI-compatible provider (OpenRouter, OpenAI, DeepSeek,
  local LM Studio)
- OpenAPI 3 schema + Swagger UI (drf-spectacular), Django admin, and
  WebSocket AI streaming via Django Channels (local development)

### Frontend
- Complete UI for every ERP module: merchandising, buyers & CRM, orders,
  commercial management (LCs, invoices, shipments), production, planning &
  scheduling, TNA, IE planning, inventory, procurement, costing, accounts &
  finance, fixed assets, HR & payroll, performance, quality control,
  compliance, subcontracting, reporting, security/RBAC, settings, admin
- JWT auth with transparent token refresh and protected routes
- Generic REST data layer mapping every module 1:1 to the backend endpoints
- AI assistant chat with streaming (WebSocket) and automatic HTTP fallback
- React 19, Tailwind CSS, shadcn/radix UI components, TanStack Table,
  Recharts, react-hook-form + zod

## Project Structure

```
backend/
├── config/              # Django project settings and root URLs
├── api/                 # Serverless entry point (Vercel)
├── authentication/      # JWT auth, registration, social login, devices
├── rbac/                # Roles, permissions, user-role assignments
├── ai/                  # AI assistant (chat, conversations, LLM clients)
├── buyers/ crm/ merchandising/ orders/    # Buy-side and order management
├── commercial/          # LCs, invoices, shipments, realizations
├── production/ planning/ scheduling/ ie_planning/ tna/  # Manufacturing
├── inventory/ procurement/                # Materials and purchasing
├── costing/ accounts/ fixed_assets/       # Finance and assets
├── hr/ performance/                       # Workforce
├── quality/ compliance/                   # QC and audits
└── reporting/ subcontract/ core/ templates/ static/

frontend/texon-ui/
├── app/                 # One route folder per ERP module
├── components/          # Shared UI components
├── lib/api/             # Axios client, REST registry, auth helpers
├── hooks/               # React hooks (AI chat, etc.)
└── middleware.ts        # Session-cookie route protection
```

## Tech Stack

### Backend
- **Framework**: Django 6, Django REST Framework
- **Database**: PostgreSQL (Supabase in production), SQLite for local dev
- **Auth**: SimpleJWT, dj-rest-auth, django-allauth
- **Realtime**: Django Channels (WebSocket AI streaming, local dev)
- **Docs**: drf-spectacular (OpenAPI 3 / Swagger UI)
- **Validation**: Pydantic (via `pydantic-settings`)
- **Deployment**: Vercel serverless functions; Docker/Gunicorn optional

### Frontend
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/radix UI components
- **Data**: Axios REST client, TanStack Table, Recharts
- **Forms**: react-hook-form + zod
- **Deployment**: Vercel

## Getting Started (Local Development)

Prerequisites: [Python](https://www.python.org/downloads/) 3.13+ with
[uv](https://github.com/astral-sh/uv), [Node.js](https://nodejs.org/) 18+,
and PostgreSQL (optional locally — SQLite works out of the box).

### Backend

```bash
cd backend
uv sync
uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py runserver        # http://localhost:8000
```

Create a `backend/.env` file (see [`backend/README.md`](backend/README.md)
for the full list of variables). Swagger UI:
http://localhost:8000/swagger-ui/

### Frontend

```bash
cd frontend/texon-ui
npm install
cp .env.example .env.local
npm run dev                       # http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local` and keep the
backend running. Seeded test login: `admin@texon.com` / `Test@123`

A step-by-step backend setup guide (uv, PostgreSQL, Redis) for Linux and
Windows is included in the
[Appendix](#appendix-backend-setup-guide-uv-only) below.

## Deployment

The two applications are deployed to Vercel as separate projects, each from
its own Git repository — the frontend as a Next.js app and the backend as a
Python serverless function (see [`backend/vercel.json`](backend/vercel.json)
and [`backend/DEPLOY.md`](backend/DEPLOY.md)).

| | URL |
|---|---|
| Frontend | https://texon-ui.vercel.app |
| Backend API | https://texon-backend.vercel.app |
| Swagger UI | https://texon-backend.vercel.app/swagger-ui/ |

For self-hosting, the backend also ships a Docker configuration:

```bash
docker-compose -f docker-compose.yml up -d --build
```

- App: http://localhost:8000
- Admin: http://localhost:8000/admin
- API docs: http://localhost:8000/swagger-ui/

## Known Limitations on the Deployed Demo

- **WebSockets**: Vercel's Hobby (free) plan runs the backend as short-lived
  serverless functions, so the Channels-based WebSocket AI streaming
  (`/ws/ai/chat/`) is unavailable in production — clients fall back to the
  non-streaming HTTP chat endpoint. Full streaming works when the project is
  run locally or self-hosted.
- **Free AI API**: the assistant runs on an OpenRouter free-tier key
  (`deepseek/deepseek-chat`) that is rate-limited and occasionally
  unavailable, so replies can be slow or fail intermittently. Configure a
  paid provider via `AI_LLM_PROVIDER` for production use.

Details: [`backend/README.md`](backend/README.md) and
[`frontend/texon-ui/README.md`](frontend/texon-ui/README.md).

## Testing

```bash
cd backend && uv run pytest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Appendix: Backend Setup Guide (uv only)

Setup guide for **Arch Linux**, **Debian/Ubuntu** and **Windows** using [uv](https://docs.astral.sh/uv/) as the only Python tool. Required services: **PostgreSQL** and **Redis**.

> Repo: https://github.com/Afzal20/texon

---

## 1. Install uv

uv is the only Python tool you need. It downloads and manages Python itself (no manual Python install required).

### Arch Linux
```bash
sudo pacman -S uv
```

### Debian / Ubuntu
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# restart your shell, then verify
uv --version
```

### Windows (PowerShell)
```powershell
winget install astral-sh.uv
# or
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## 2. Install PostgreSQL and Redis

### Arch Linux
```bash
sudo pacman -S postgresql redis

# initialize the PostgreSQL data directory (required on Arch)
sudo -u postgres initdb -D /var/lib/postgres/data

# enable and start services
sudo systemctl enable --now postgresql
sudo systemctl enable --now redis
```

### Debian / Ubuntu
```bash
sudo apt update
sudo apt install -y postgresql redis-server

sudo systemctl enable --now postgresql
sudo systemctl enable --now redis-server
```

### Windows (PowerShell)
```powershell
winget install PostgreSQL.PostgreSQL.16
winget install Redis.Redis
```

After installation, start the services (they normally start automatically):
- **PostgreSQL**: Start "PostgreSQL 16" service in Services (services.msc)
- **Redis**: Start "Redis" service in Services (services.msc)

---

## 3. Clone the repository

```bash
git clone https://github.com/Afzal20/texon.git
cd texon/backend
```

---

## 4. Set up the Python environment (uv only)

```bash
# install the Python version required by the project (3.14)
uv python install 3.14

# create the virtual environment and install all dependencies from uv.lock
uv sync
```

`uv sync` creates `.venv` and installs every dependency automatically. No pip, no manual venv.

---

## 5. Create the PostgreSQL database and user

### Linux (Arch / Debian)
```bash
sudo -u postgres psql
```
Inside the psql prompt:
```sql
CREATE USER texon WITH PASSWORD 'texon_password';
CREATE DATABASE texon OWNER texon;
ALTER USER texon CREATEDB;
\q
```

### Windows (PowerShell)
```powershell
# connect as the postgres superuser (password was set during PostgreSQL install)
psql -U postgres
```
Inside the psql prompt, run the same SQL as above.

---

## 6. Configure environment variables

Create a `.env` file inside `backend/`:

```env
# Django
DJANGO_SECRET_KEY=your_secret_key_here
DJANGO_DEBUG=True
ALLOWED_HOSTS=*

# PostgreSQL
DB_NAME=texon
DB_USER=texon
DB_PASSWORD=texon_password
DB_HOST=127.0.0.1
DB_PORT=5432

# Redis (used by Channels)
REDIS_URL=redis://127.0.0.1:6379/0

# Email (optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Switch the database from SQLite to PostgreSQL** — edit `backend/config/settings.py`, replace the `DATABASES` block (line ~139):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='texon'),
        'USER': config('DB_USER', default='texon'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='127.0.0.1'),
        'PORT': config('DB_PORT', default='5432', cast=int),
    }
}
```

**Use Redis for Channels** — in the same file, replace the `CHANNEL_LAYERS` block (line ~362):

```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [config('REDIS_URL', default='redis://127.0.0.1:6379/0')],
        },
    },
}
```

Then add the Redis channels backend (uv only):

```bash
uv add channels-redis
```

---

## 7. Run migrations and start the server

```bash
# apply database migrations
uv run manage.py migrate

# (optional) collect static files
uv run manage.py collectstatic --noinput

# create an admin user
uv run manage.py createsuperuser

# start the development server
uv run manage.py runserver
```

Open:
- **App**: http://localhost:8000
- **Admin**: http://localhost:8000/admin
- **API Docs (Swagger)**: http://localhost:8000/swagger-ui/

---

## 8. Run tests (optional)

```bash
uv run pytest
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `uv` not found after install | Restart your shell / terminal |
| `connection refused` for PostgreSQL | Ensure the service is running (`systemctl status postgresql` / Services on Windows) |
| `initdb` error on Arch | Run `sudo -u postgres initdb -D /var/lib/postgres/data` first |
| Redis not running | `systemctl status redis` (Linux) or the "Redis" Windows service |
| Python version error | `uv python install 3.14` then `uv sync` again |