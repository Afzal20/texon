"use server"

import { setSession } from "@/auth/lib/session"
import { DJANGO_API_URL } from "@/lib/django-auth"

interface LoginInput {
  email: string
  password: string
}

export async function loginAction(input: LoginInput): Promise<{
  success: boolean
  error?: string
  accessToken?: string
  refreshToken?: string
}> {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/users/api/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return {
        success: false,
        error:
          data?.detail ??
          (typeof data === "object" && data !== null
            ? Object.values(data).flat().join("; ")
            : "Login failed"),
      }
    }

    const tokens: { access: string; refresh: string } = await res.json()

    let userId = 0
    let email = input.email
    try {
      const meRes = await fetch(`${DJANGO_API_URL}/api/v1/auth/user/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      })
      if (meRes.ok) {
        const me = await meRes.json()
        userId = me.pk ?? me.id ?? 0
        email = me.email ?? email
      }
    } catch {
      // profile fetch is best-effort; session still works
    }

    await setSession({
      userId,
      email,
      roles: [],
      permissions: [],
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
    })

    return { success: true, accessToken: tokens.access, refreshToken: tokens.refresh }
  } catch {
    return { success: false, error: "Network error. Server may be offline." }
  }
}