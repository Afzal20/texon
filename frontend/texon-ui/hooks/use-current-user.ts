"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchMe, type DjangoUser } from "@/lib/django-auth"

export function useCurrentUser() {
  const [user, setUser] = useState<DjangoUser | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUser(await fetchMe())
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { user, loading, reload: load, setUser }
}

export function userInitials(user: Pick<DjangoUser, "first_name" | "last_name" | "email"> | null): string {
  if (!user) return "TX"
  const initials = `${user.first_name ?? ""} ${user.last_name ?? ""}`
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  return initials || (user.email ? user.email[0].toUpperCase() : "TX")
}
