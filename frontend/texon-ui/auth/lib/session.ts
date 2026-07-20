import "server-only"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import type { NextRequest } from "next/server"

const SESSION_NAME = "__session"
const ENCRYPTION_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "texon-dev-secret-min-32-chars-long!!",
)
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export interface SessionPayload {
  userId: number
  email: string
  role: string
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
