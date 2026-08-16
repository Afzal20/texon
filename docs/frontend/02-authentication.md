# 02 — Authentication

## Auth Stack

- **dj-rest-auth** (REST auth endpoints) + **djangorestframework-simplejwt** (JWT) on the backend.
- The frontend stores tokens in **both** `localStorage` and a session cookie (see
  `frontend/texon-ui/lib/django-auth.ts`).
- Route protection is session-cookie based via `proxy.ts` middleware
  (`sessionCookieExists()` + `publicPaths`).

## Token Lifecycle

```
1. POST /api/v1/auth/login/        {email, password}  → {access, refresh}
2. Store access + refresh (localStorage + cookie)
3. Every GraphQL/REST call:       Authorization: Bearer <access>
4. Access expires (~1h, SIMPLE_JWT ACCESS_TOKEN_LIFETIME)
5. POST /api/v1/auth/token/refresh/  {refresh}  → {access (and refresh, if ROTATE_REFRESH_TOKENS)}
6. On 401: lib/api/client.ts interceptor queues requests, refreshes once, retries
```

## Real REST Auth Endpoints (verified against backend urls)

Base: `http://localhost:8000` (i.e. `NEXT_PUBLIC_API_URL`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/login/` | Login → `{access, refresh, user}` |
| POST | `/api/v1/auth/logout/` | Logout (blacklists refresh token) |
| GET | `/api/v1/auth/user/` | Current user (this is the **me** endpoint) |
| POST | `/api/v1/auth/password/change/` | Change own password |
| POST | `/api/v1/auth/password/reset/` | Request password reset email |
| POST | `/api/v1/auth/password/reset/confirm/` | Confirm reset with UID/token |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| POST | `/api/v1/auth/token/verify/` | Verify a token is valid |
| POST | `/api/v1/auth/registration/` | Register a new user |
| POST | `/api/v1/auth/registration/verify-email/` | Verify email |
| POST | `/api/v1/auth/registration/resend-email/` | Resend verification email |
| GET | `/api/v1/auth/devices/` | Logged-in sessions/devices |
| DELETE | `/api/v1/auth/devices/<token_id>/` | Revoke a session |
| GET | `/api/v1/auth/social/url/<provider>/` | Get social login URL (`google`/`github`) |
| POST | `/api/v1/auth/google/`, `/api/v1/auth/github/` | Social login callback |
| POST | `/api/users/api/token/` | SimpleJWT token pair (email/password) — used by GraphQL tooling |

> REST auth views are **session-OR-token** authenticated (rest-auth default).
> GraphQL requires the **JWT Bearer** header (see below).

## GraphQL Authentication

The GraphQL endpoint is protected by `JWTAuthMiddleware`
(`backend/config/graphql/middleware.py`):

- Accepts `Authorization: Bearer <access>` (JWT, **recommended**).
- Also accepts a valid Django session cookie (so logged-in admins can use GraphiQL).
- Missing/invalid credentials → GraphQL error:
  `Authentication required. Please provide a valid 'Authorization: Bearer <token>' header.`

## ✅ Endpoint Mapping (fixed in the frontend)

The frontend auth helpers now hit the real backend endpoints (previously
mismatched):

| Helper | Endpoint used now |
|---|---|
| `loginAction` (`auth/actions/login.ts`) | `POST /api/users/api/token/` (JWT obtain — returns `access` **and** `refresh` in the body; dj_rest_auth's `/api/v1/auth/login/` returns the refresh only as an httpOnly cookie, so it can't seed the Iron-session) |
| `registerAction` (`auth/actions/register.ts`), `registerUser` | `POST /api/v1/auth/registration/` with `username: email, password1, password2` — note: registration currently fails backend-side (`User.username = None` → serializer rejects `username`, `max_length=0`) |
| `fetchMe`, session profile refresh | `GET /api/v1/auth/user/` (maps `pk` → `id`) |
| `refreshDjangoToken`, session refresh | `POST /api/users/api/token/refresh/` (returns rotated `access` + `refresh`; both are persisted) |
| `forgotPassword` | `POST /api/v1/auth/password/reset/` |
| `resetPassword` | `POST /api/v1/auth/password/reset/confirm/` (`uid/token/new_password1/new_password2`; unused today) |
| `updatePassword` | `POST /api/v1/auth/password/change/` (`old_password/new_password1/new_password2`) |
| `logout` | `POST /api/v1/auth/logout/` |

Login flow: `loginAction` obtains tokens via `/api/users/api/token/`, fetches
the profile via `/api/v1/auth/user/`, then `setSession(...)` (JWT-signed
`__session` cookie, `AUTH_SECRET`). `getValidSession` refreshes via
`/api/users/api/token/refresh/` and rotates the stored refresh token
(`ROTATE_REFRESH_TOKENS=True` on the backend blacklists the old one).

## Token Storage Keys (frontend)

Defined in `frontend/texon-ui/lib/django-auth.ts`:

| Key | Value |
|---|---|
| `django_access_token` | access JWT (localStorage + cookie) |
| `django_refresh_token` | refresh JWT (localStorage) |

Never send the refresh token to GraphQL; the axios client
(`frontend/texon-ui/lib/api/client.ts`) handles refresh automatically
(`isTokenExpired`, `failedQueue`).