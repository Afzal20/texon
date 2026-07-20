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

export function withRole<T>(...roles: string[]) {
  return (handler: ApiHandler<T>) =>
    async (request: Request, context: { params: T }) => {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (!roles.some(r => session.roles.includes(r))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return handler(request, session, context.params)
    }
}

export function withPermission<T>(...perms: string[]) {
  return (handler: ApiHandler<T>) =>
    async (request: Request, context: { params: T }) => {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (!perms.some(p => session.permissions.includes(p))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return handler(request, session, context.params)
    }
}
