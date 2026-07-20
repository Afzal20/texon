import "server-only"
import { redirect } from "next/navigation"
import { getSession, type SessionPayload } from "@/auth/lib/session"

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect("/auth/login")
  return session
}

export async function requireRole(...roles: string[]): Promise<SessionPayload> {
  const session = await requireAuth()
  if (!roles.includes(session.role)) redirect("/")
  return session
}
