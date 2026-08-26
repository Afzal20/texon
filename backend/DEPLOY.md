# Deploying the Texon Backend to Vercel

This project is configured for deployment on [Vercel](https://vercel.com) as a
Python serverless application.

## What's already set up

| File | Purpose |
| --- | --- |
| `vercel.json` | Routes all traffic to the serverless function, pins Python 3.13 |
| `api/index.py` | Serverless entry point exposing the Django WSGI app |
| `config/settings.py` | Auto-detects Vercel (`VERCEL=1`) and adjusts hosts/storage/proxy settings |

## Prerequisites

- A Postgres database — **SQLite will not work on Vercel** (the filesystem is
  ephemeral). This project supports Supabase out of the box via the
  `SUPABASE_DB_*` environment variables.
- The [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

## Environment variables

Set these in the Vercel dashboard (**Project → Settings → Environment
Variables**) or via `vercel env add <NAME>`:

### Required

| Variable | Example | Notes |
| --- | --- | --- |
| `DJANGO_DEBUG` | `false` | Must be `false` in production |
| `DJANGO_SECRET_KEY` | (long random string) | Required when `DEBUG=false` |
| `SUPABASE_DB_HOST` | `db.xxx.supabase.co` | Presence switches to Postgres |
| `SUPABASE_DB_NAME` | `postgres` | |
| `SUPABASE_DB_USER` | `postgres` | |
| `SUPABASE_DB_PASSWORD` | •••••• | |
| `SUPABASE_DB_PORT` | `5432` or `6543` | Use the pooler port for serverless |

### Recommended

| Variable | Example | Notes |
| --- | --- | --- |
| `ALLOWED_HOSTS` | `.yourdomain.com` | `*.vercel.app` is added automatically |
| `CSRF_TRUSTED_ORIGINS` | `https://app.yourdomain.com` | Needed for admin POSTs behind a proxy |
| `CORS_ALLOWED_ORIGINS` | `https://app.yourdomain.com` | Frontend origin(s) |
| `SOCIAL_CALLBACK_ALLOWLIST` | `app.yourdomain.com:443` | OAuth callback allowlist |
| `ACCOUNT_EMAIL_VERIFICATION` | `none` or `mandatory` | Defaults to `mandatory` when `DEBUG=false` |
| `EMAIL_BACKEND` / SMTP vars | | Real email backend for OTP/verification mails |

## Deploying

```bash
# From the backend/ directory
vercel link          # one-time: associate with a Vercel project
vercel env pull      # optional: sync env vars locally
vercel --prod        # deploy to production
```

## After the first deploy

Run migrations and create an admin user against the production database from
your local machine (using the same Supabase credentials):

```bash
uv run manage.py migrate
uv run manage.py createsuperuser
```

Or run them as one-off jobs in CI. Migrations are **not** applied automatically
on deploy.

## Known limitations on Vercel

- **WebSockets**: Django Channels consumers do not work on serverless
  functions; only plain HTTP requests are supported.
- **Static files** are served through WhiteNoise inside the function. For
  heavy traffic consider moving them to object storage/CDN.
- **Cold starts**: keep an eye on lambda size (`maxLambdaSize` is set to 15 MB).