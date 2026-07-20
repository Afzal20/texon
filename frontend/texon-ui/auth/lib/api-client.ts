import "server-only"
import { getValidSession } from "@/auth/lib/session"

export async function getApiToken(): Promise<string> {
  const session = await getValidSession()
  if (!session?.accessToken) throw new Error("Not authenticated")
  return session.accessToken
}
