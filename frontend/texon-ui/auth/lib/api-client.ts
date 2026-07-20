import "server-only"
import { getSession } from "@/auth/lib/session"

export async function getApiToken(): Promise<string> {
  const session = await getSession()
  if (!session?.accessToken) throw new Error("Not authenticated")
  return session.accessToken
}
