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
    const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return {
        success: false,
        error: data?.detail ?? data?.message ?? "Login failed",
      }
    }

    const tokens: {
      access: string
      refresh: string
      user?: { id: number; email: string }
      roles?: string[]
      permissions?: string[]
    } = await res.json()

    await setSession({
      userId: tokens.user?.id ?? 0,
      email: tokens.user?.email ?? input.email,
      roles: tokens.roles ?? [],
      permissions: tokens.permissions ?? [],
      accessToken: tokens.access,
      refreshToken: tokens.refresh,
    })

    return { success: true, accessToken: tokens.access, refreshToken: tokens.refresh }
  } catch (err) {
    return { success: false, error: "Network error. Server may be offline." }
  }
}
