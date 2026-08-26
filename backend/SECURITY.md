# Security Policy — OWASP Top 10 Implementation

How this project addresses the OWASP Top 10 (2021). All settings live in
`config/settings.py`; enforcement checks in `core/checks.py`; audit logging in
`core/security_logging.py`.

| # | Risk | Controls |
|---|------|----------|
| A01 | Broken Access Control | `DEFAULT_PERMISSION_CLASSES = IsAuthenticated` globally; RBAC app (`rbac/`) for role-based access; object-level permission mixins in `core/permissions.py`. `X-Frame-Options: DENY` blocks clickjacking; CSP `frame-ancestors 'none'`. |
| A02 | Cryptographic Failures | Secrets from env only — boot **fails** without `DJANGO_SECRET_KEY` when `DEBUG=False` (`config/settings.py`). TLS enforced: `SECURE_SSL_REDIRECT`, HSTS (1y, preload, subdomains), `SECURE_PROXY_SSL_HEADER` behind Vercel. All cookies (session, CSRF, JWT) `Secure` + `HttpOnly` + `SameSite=Lax` in production. DB requires `sslmode=require`. |
| A03 | Injection | 100% Django ORM usage (no raw SQL / `.extra()` / string-built queries — verified by grep). DRF serializers validate all input. JSON parser only. CSP deployed to mitigate XSS impact. |
| A04 | Insecure Design | Rate limiting: anon 100/h, user 1000/h, login 30/h per IP (`ScopedRateThrottle` on login view). Email verification mandatory in production. Open-redirect defence: OAuth callback URLs validated against `SOCIAL_CALLBACK_ALLOWLIST`. |
| A05 | Security Misconfiguration | `DEBUG=False` gates hardening. System checks `texon.W001–W005` fail loudly on `ALLOWED_HOSTS=*`, wildcard CORS with credentials, dev secret keys, missing SSL redirect/HSTS. Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`. CSP via Django 6 native support — starts report-only, enforce with env `CSP_ENFORCE=1`. |
| A06 | Vulnerable Components | Dependencies declared in `pyproject.toml` with minimum versions; run `uv pip install pip-audit && pip-audit` in CI to catch CVEs. |
| A07 | Identification & Auth Failures | Password policy: 12+ chars, common-password + user-similarity + numeric validators. JWT: short-lived access tokens (15 min default), refresh rotation **with blacklist**. Brute-force throttling on login. Auth lifecycle logged (see A09). |
| A08 | Software & Data Integrity | No unsigned dependency sources; lockfile (`uv.lock`) committed. Missing/weak secret keys abort startup rather than degrading. |
| A09 | Security Logging & Monitoring Failures | `texon.security` logger records `auth.login_failed` / `auth.login_ok` / `auth.logout` with client IP (signal receivers in `core/security_logging.py`). `django.request` logs all 4xx/5xx; `django.security` catches `SuspiciousOperation`s. Unhandled request exceptions logged with method/path/IP. |
| A10 | SSRF | No outbound HTTP calls driven by user input (verified by grep); OAuth flows talk only to fixed provider endpoints. If SSRF-prone features are added, validate against an allowlist and block private CIDRs. |

## Production checklist

1. Set explicit `ALLOWED_HOSTS` (no `*`) and `CORS_ALLOWED_ORIGINS` — checks
   `texon.W001/W002` will warn until fixed.
2. Rotate `DJANGO_SECRET_KEY` away from the development default (`texon.W003`).
3. Run `python manage.py check --deploy` before each release.
4. After confirming no CSP violations in browser consoles, set `CSP_ENFORCE=1`.

## Reporting

Report vulnerabilities privately to the maintainers; do not open public issues.
