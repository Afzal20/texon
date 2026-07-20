import "server-only"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import type { NextRequest } from "next/server"

const SESSION_NAME = "__session"
const ENCRYPTION_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "texon-dev-secret-min-32-chars-long!!",
)
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface SessionPayload {
  userId: number
  email: string
  roles: string[]
  permissions: string[]
  accessToken: string
  refreshToken: string
}

async function encode(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(ENCRYPTION_KEY)
}

async function decode(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ENCRYPTION_KEY)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await encode(payload)
  const store = await cookies()
  store.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  })
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const store = await cookies()
    const raw = store.get(SESSION_NAME)?.value
    if (!raw) return null
    return decode(raw)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

async function refreshAccessToken(refresh: string): Promise<{ access: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getValidSession(): Promise<SessionPayload | null> {
  const session = await getSession()
  if (!session?.accessToken) return null

  if (!isTokenExpired(session.accessToken)) return session

  if (!session.refreshToken) return null

  const data = await refreshAccessToken(session.refreshToken)
  if (!data) {
    await clearSession()
    return null
  }

  const updated: SessionPayload = { ...session, accessToken: data.access }
  await setSession(updated)

  const meRes = await fetch(`${API_BASE_URL}/api/v1/auth/me/`, {
    headers: { Authorization: `Bearer ${data.access}` },
  })
  if (meRes.ok) {
    const me = await meRes.json()
    updated.permissions = me.permissions ?? []
    updated.roles = me.roles ?? []
    await setSession(updated)
  }

  return updated
}

export function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const raw = request.cookies.get(SESSION_NAME)?.value
  if (!raw) return Promise.resolve(null)
  return decode(raw)
}

export function sessionCookieExists(request: NextRequest): boolean {
  return !!request.cookies.get(SESSION_NAME)?.value
}
