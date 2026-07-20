"use server"

import { clearSession, getSession } from "@/auth/lib/session"
import { DJANGO_API_URL } from "@/lib/django-auth"

export async function logoutAction(): Promise<void> {
  try {
    const session = await getSession()
    if (session?.refreshToken) {
      await fetch(`${DJANGO_API_URL}/api/v1/auth/logout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: session.refreshToken }),
      })
    }
  } catch {
    // Ignore backend errors during logout
  }
  await clearSession()
}
