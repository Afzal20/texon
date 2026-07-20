"use server"

import { getSession } from "@/auth/lib/session"

export async function getSessionClaims(): Promise<{
  email: string
  userId: number
  role: string
} | null> {
  const session = await getSession()
  if (!session) return null
  return { email: session.email, userId: session.userId, role: session.role }
}
