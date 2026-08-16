"use server"

import { setSession } from "@/auth/lib/session"
import { DJANGO_API_URL } from "@/lib/django-auth"

interface RegisterInput {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}

export async function registerAction(input: RegisterInput): Promise<{
  success: boolean
  error?: string
  accessToken?: string
}> {
  try {
    const res = await fetch(`${DJANGO_API_URL}/api/v1/auth/registration/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        username: input.email,
        password1: input.password,
        password2: input.password,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      const message =
        typeof data === "object" && data !== null
          ? Object.values(data).flat().join("; ")
          : "Registration failed"
      return { success: false, error: message }
    }

    const result: {
      access: string
      refresh: string
      user: { id: number; email: string }
      roles?: string[]
      permissions?: string[]
    } = await res.json()

    await setSession({
      userId: result.user.id,
      email: result.user.email,
      roles: result.roles ?? [],
      permissions: result.permissions ?? [],
      accessToken: result.access,
      refreshToken: result.refresh,
    })

    return { success: true, accessToken: result.access }
  } catch {
    return { success: false, error: "Network error. Server may be offline." }
  }
}
