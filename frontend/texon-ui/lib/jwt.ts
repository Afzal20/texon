/**
 * Base64url-safe JWT payload decoder.
 *
 * SimpleJWT (the backend's auth library) encodes token claims using
 * base64url (`-`/`_` instead of `+`/`/`, no padding), which plain `atob()`
 * and Node's "base64" decoder both choke on. This normalizes first.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8")
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== "number") return true
  return payload.exp * 1000 < Date.now()
}
