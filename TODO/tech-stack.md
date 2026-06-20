# Tech Stack Decision

## Backend

**Python + Django REST Framework** — the original choice is correct.

```
Python         → Has every algorithm library you need:
                 PuLP (LP), NumPy, Pandas, scikit-learn,
                 statsmodels (ARIMA), TensorFlow/PyTorch (LSTM)
                 No other language matches this for your AI modules.

Django         → Battle-tested ORM, migrations, admin panel
                 (free internal tool for early customers),
                 built-in auth base, signals for audit logs

DRF            → API serialization, ViewSets, permissions,
                 throttling — production patterns built in

PostgreSQL     → Row-level security, JSONB for flexible fields,
                 partitioning, materialized views — enterprise grade

Redis          → JWT blacklist, Celery broker, real-time caching,
                 rate limiting store

Celery         → Async tasks: BOM explosion, forecast runs,
                 LP optimizer, email alerts — never block the API

Celery Beat    → Scheduled tasks: nightly reorder checks,
                 daily KPI snapshots, forecast refresh
```

## Frontend

**Next.js 14 (React) + TypeScript**

```
Why not Django Templates?
  → You want a company. Clients judge UI instantly.
    A React app looks and feels like enterprise software.
    Django templates will look like 2015.

Why Next.js?
  → App Router for clean page structure
  → Server Components for fast initial load
  → API routes if you need lightweight BFF layer
  → Vercel deploy is one command (or self-host)

Why TypeScript?
  → Your API will have complex types:
    BOM lines, production orders, matrix data
  → TS catches bugs before runtime
  → As a solo dev, TS is your second pair of eyes
```

## UI Component Library

**shadcn/ui + Tailwind CSS**

```
Why shadcn/ui?
  → Not a dependency — you copy components into your project
  → Full control over every pixel
  → Accessible by default (Radix UI primitives)
  → Data tables, forms, dialogs, charts — all there
  → Looks professional, not generic

Charts: Recharts (already in shadcn ecosystem)
Tables: TanStack Table (best-in-class for complex ERP grids)
Forms:  React Hook Form + Zod validation
```

## Infrastructure

```
VPS:        DigitalOcean Droplet ($12/mo, 2GB RAM to start)
Reverse:    nginx (SSL termination, rate limiting)
Process:    Gunicorn (Django WSGI server)
Container:  Docker + Docker Compose (dev/prod parity)
Storage:    DigitalOcean Spaces or AWS S3 (markers, docs)
CI/CD:      GitHub Actions → auto deploy on push to main
Monitoring: Sentry (errors, free tier)
```

## Full Stack at a Glance

```
Client (Next.js + TypeScript + shadcn)
    ↕ HTTPS / REST + WebSocket
nginx (SSL, rate limit, static files)
    ↕
Gunicorn → Django DRF (Python 3.12)
    ↕                    ↕
PostgreSQL 16         Redis 7
    ↕
Celery Workers (async) + Celery Beat (scheduled)
    ↕
AI/ML Layer (scikit-learn, statsmodels, PuLP)
```
