import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sessionCookieExists } from "@/auth/lib/session"

const publicPaths = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-otp",
  "/auth/error",
]

// Also allow these API prefixes without session
const publicPrefixes = ["/_next", "/favicon"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow static assets
  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check static file extensions
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)) {
    return NextResponse.next()
  }

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p),
  )
  const hasSession = sessionCookieExists(request)

  // Authenticated user on public page → redirect to dashboard
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Unauthenticated user on protected page → redirect to login
  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
