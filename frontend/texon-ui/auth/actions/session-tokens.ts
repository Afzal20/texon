"use server"

import { getValidSession } from "@/auth/lib/session"

/**
 * Returns the JWT pair embedded in the signed httpOnly __session cookie so the
 * browser can rehydrate localStorage after it was cleared (e.g. Safari's 7-day
 * ITP eviction) while the session itself is still valid.
 *
 * Security: the session cookie signature is verified server-side before any
 * token is released — without a valid cookie this returns nothing.
 */
export async function getSessionTokens(): Promise<{
  accessToken?: string
  refreshToken?: string
}> {
  const session = await getValidSession()
  if (!session?.accessToken || !session.refreshToken) return {}
  return { accessToken: session.accessToken, refreshToken: session.refreshToken }
}
