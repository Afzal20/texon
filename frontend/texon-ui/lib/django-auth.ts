import { decodeJwtPayload } from "@/lib/jwt"
import { getSessionTokens } from "@/auth/actions/session-tokens"

export const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
export const TOKEN_KEY = "django_access_token"
export const REFRESH_KEY = "django_refresh_token"

export interface DjangoTokenResponse {
  access: string
  refresh: string
}

export interface DjangoUser {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  avatar: string
  is_verified: boolean
  is_superuser: boolean
  is_staff: boolean
  date_joined: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface RegisterResponse {
  user: DjangoUser
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

/**
 * Store tokens in localStorage for client-side API access.
 *
 * Security note: JWTs are deliberately NOT mirrored into document.cookie.
 * A JS-readable cookie adds zero value (nothing reads it — route protection
 * uses the server-only, httpOnly `__session` cookie set by auth/lib/session.ts)
 * while giving XSS an extra place to steal long-lived credentials from.
 */
export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  // Expire legacy mirrored cookies from older builds (best effort cleanup).
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
    document.cookie = `${REFRESH_KEY}=; path=/; max-age=0`
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredAccessToken()
}

let hydrationAttempted = false

/**
 * Rehydrates the token pair from the signed httpOnly session cookie when
 * localStorage has lost them (cleared manually, storage pressure, or Safari's
 * 7-day ITP eviction). Attempted at most once per page load; returns true when
 * a usable refresh token is available afterwards.
 */
export async function ensureTokensAvailable(): Promise<boolean> {
  if (getStoredAccessToken() && getStoredRefreshToken()) return true
  if (hydrationAttempted) return false
  hydrationAttempted = true

  try {
    const tokens = await getSessionTokens()
    if (tokens.accessToken && tokens.refreshToken) {
      storeTokens(tokens.accessToken, tokens.refreshToken)
      return true
    }
  } catch {
    // session invalid or network issue — fall through
  }
  return false
}

export async function loginWithDjango(
  email: string,
  password: string,
): Promise<DjangoTokenResponse> {
  const res = await fetch(`${DJANGO_API_URL}/api/users/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail ?? data?.message ?? "Login failed")
  }

  const tokens: DjangoTokenResponse = await res.json()
  storeTokens(tokens.access, tokens.refresh)
  return tokens
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/registration/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      username: payload.email,
      password1: payload.password,
      password2: payload.password,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message =
      typeof data === "object" && data !== null
        ? Object.values(data).flat().join("; ")
        : "Registration failed"
    throw new Error(message)
  }

  const result: RegisterResponse = await res.json()
  storeTokens(result.access, result.refresh)

  // dj_rest_auth returns a blank refresh token in the body when JWT cookies
  // are enabled; fall back to the SimpleJWT login endpoint for real tokens.
  if (!result.refresh) {
    try {
      const tokenRes = await fetch(`${DJANGO_API_URL}/api/users/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      })
      if (tokenRes.ok) {
        const tokens = await tokenRes.json()
        storeTokens(tokens.access, tokens.refresh)
      }
    } catch {
      // best-effort; the user object is still returned
    }
  }

  console.log("Registered user:", result.user)
  return result

}

export async function refreshDjangoToken(): Promise<string | null> {
  const refresh = getStoredRefreshToken()
  if (!refresh) return null

  try {
    const res = await fetch(`${DJANGO_API_URL}/api/users/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      clearTokens()
      return null
    }

    const data: { access: string; refresh?: string } = await res.json()
    storeTokens(data.access, data.refresh ?? refresh)
    return data.access
  } catch {
    clearTokens()
    return null
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  let access = getStoredAccessToken()
  if (!access) {
    await ensureTokensAvailable()
    access = getStoredAccessToken()
  }
  if (!access) return null

  const payload = decodeJwtPayload(access)
  const exp = payload && typeof payload.exp === "number" ? payload.exp * 1000 : null
  if (exp && Date.now() < exp - 30000) return access
  return refreshDjangoToken()
}

export async function fetchMe(): Promise<DjangoUser> {
  const token = await getValidAccessToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/user/`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    clearTokens()
    throw new Error("Failed to fetch user")
  }

  const data: Record<string, unknown> = await res.json()
  return {
    id: Number(data.pk ?? data.id ?? 0),
    email: String(data.email ?? ""),
    first_name: String(data.first_name ?? ""),
    last_name: String(data.last_name ?? ""),
    phone: String(data.phone ?? ""),
    avatar: String(data.avatar ?? ""),
    is_verified: Boolean(data.is_verified ?? false),
    is_superuser: Boolean(data.is_superuser ?? false),
    is_staff: Boolean(data.is_staff ?? false),
    date_joined: String(data.date_joined ?? ""),
  }
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<DjangoUser> {
  const token = await getValidAccessToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/user/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message =
      typeof data === "object" && data !== null
        ? Object.values(data).flat().join("; ")
        : "Failed to update profile"
    throw new Error(message)
  }

  const data: Record<string, unknown> = await res.json()
  return {
    id: Number(data.pk ?? data.id ?? 0),
    email: String(data.email ?? ""),
    first_name: String(data.first_name ?? ""),
    last_name: String(data.last_name ?? ""),
    phone: String(data.phone ?? ""),
    avatar: String(data.avatar ?? ""),
    is_verified: Boolean(data.is_verified ?? false),
    is_superuser: Boolean(data.is_superuser ?? false),
    is_staff: Boolean(data.is_staff ?? false),
    date_joined: String(data.date_joined ?? ""),
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/password/reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail ?? data?.message ?? "Failed to send reset email")
  }
}

export async function resetPassword(
  uid: string,
  token: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/password/reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid,
      token,
      new_password1: password,
      new_password2: password,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail ?? data?.message ?? "Failed to reset password")
  }
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const token = await getValidAccessToken()
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/password/change/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: currentPassword,
      new_password1: newPassword,
      new_password2: newPassword,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.detail ?? data?.message ?? "Failed to update password")
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getStoredAccessToken()
    if (token) {
      await fetch(`${DJANGO_API_URL}/api/v1/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh: getStoredRefreshToken() }),
      })
    }
  } catch {
    // ignore logout errors
  }
  clearTokens()
}

export function decodeToken(token: string): Record<string, unknown> | null {
  return decodeJwtPayload(token)
}
