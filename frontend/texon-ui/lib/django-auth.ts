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

export function storeTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  document.cookie = `${TOKEN_KEY}=${access}; path=/; max-age=86400; SameSite=Lax`
  document.cookie = `${REFRESH_KEY}=${refresh}; path=/; max-age=86400; SameSite=Lax`
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  document.cookie = `${REFRESH_KEY}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  return !!getStoredAccessToken()
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
    localStorage.setItem(TOKEN_KEY, data.access)
    document.cookie = `${TOKEN_KEY}=${data.access}; path=/; max-age=86400; SameSite=Lax`
    if (data.refresh) {
      localStorage.setItem(REFRESH_KEY, data.refresh)
      document.cookie = `${REFRESH_KEY}=${data.refresh}; path=/; max-age=86400; SameSite=Lax`
    }
    return data.access
  } catch {
    clearTokens()
    return null
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const access = getStoredAccessToken()
  if (!access) return null

  try {
    const payload = JSON.parse(atob(access.split(".")[1]))
    const exp = payload.exp * 1000
    if (Date.now() < exp - 30000) return access
    return refreshDjangoToken()
  } catch {
    return refreshDjangoToken()
  }
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
  email: string,
  otp: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/password/reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: email,
      token: otp,
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
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}
