import "server-only"
import { NextResponse } from "next/server"
import { getSession, type SessionPayload } from "@/auth/lib/session"

type ApiHandler<T = unknown> = (
  request: Request,
  session: SessionPayload,
  params: T,
) => Promise<NextResponse>

export function withAuth<T>(handler: ApiHandler<T>) {
  return async (request: Request, context: { params: T }) => {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return handler(request, session, context.params)
  }
}

export function withRole<T>(role: string, handler: ApiHandler<T>) {
  return async (request: Request, context: { params: T }) => {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.role !== role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return handler(request, session, context.params)
  }
}
