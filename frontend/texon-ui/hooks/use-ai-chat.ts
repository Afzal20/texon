"use client"

import * as React from "react"
import { getValidAccessToken, getStoredAccessToken } from "@/lib/django-auth"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
// Derive ws(s):// from the API origin when no explicit WS URL is configured,
// so https pages never attempt an insecure ws:// connection (mixed content).
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? API_BASE.replace(/^http/, "ws")

function getWebSocketUrl(token: string): string {
  return `${WS_BASE}/ws/ai/chat/?token=${encodeURIComponent(token)}`
}

type ChannelStatus = "idle" | "connecting" | "open" | "unavailable"

export function useAiChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const wsRef = React.useRef<WebSocket | null>(null)
  // Single-shot channel: if the socket is unavailable we stop trying for this
  // session and fall back to plain HTTP. The old infinite 3s reconnect loop
  // spammed "WebSocket connection error" whenever the backend had no /ws route.
  const statusRef = React.useRef<ChannelStatus>("idle")
  const isMountedRef = React.useRef(true)

  const handleServerMessage = React.useCallback((data: Record<string, unknown>) => {
    switch (data.type) {
      case "chunk": {
        const messageId = data.message_id as string
        const content = data.content as string
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === "assistant" && last.id === messageId) {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...last,
              content: last.content + content,
            }
            return updated
          }
          return prev
        })
        break
      }

      case "message_start":
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: String(data.message_id ?? crypto.randomUUID()),
            role: "assistant",
            content: (data.content as string) ?? "",
            timestamp: new Date((data.timestamp as string) ?? Date.now()),
          },
        ])
        break

      case "message_complete":
        setIsTyping(false)
        break

      case "error":
        setError((data.message as string) ?? "An error occurred")
        setIsTyping(false)
        break
    }
  }, [])

  const connect = React.useCallback(async () => {
    if (!isMountedRef.current) return
    if (statusRef.current === "open" || statusRef.current === "connecting") return
    statusRef.current = "connecting"

    const token = await getValidAccessToken()
    if (!isMountedRef.current) return
    if (!token) {
      statusRef.current = "unavailable"
      setError("Not authenticated")
      return
    }

    let ws: WebSocket
    try {
      ws = new WebSocket(getWebSocketUrl(token))
    } catch {
      statusRef.current = "unavailable"
      return
    }

    ws.onopen = () => {
      if (!isMountedRef.current) {
        ws.close()
        return
      }
      statusRef.current = "open"
      wsRef.current = ws
      setError(null)
    }

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return
      try {
        handleServerMessage(JSON.parse(event.data))
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => {
      // surfaced via onclose — no user-facing error here, we fall back to HTTP
    }

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null
      if (isMountedRef.current && statusRef.current !== "idle") {
        statusRef.current = "unavailable"
      }
    }
  }, [handleServerMessage])

  const disconnect = React.useCallback(() => {
    statusRef.current = "idle"
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  React.useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [disconnect])

  const sendViaHttp = React.useCallback(
    async (content: string, token: string | null) => {
      setIsTyping(true)
      try {
        const res = await fetch(`${API_BASE}/api/v1/ai/chat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: content }),
        })

        if (res.status === 404) {
          setError("AI assistant isn't available on the server yet. Please check back soon.")
          return
        }
        if (!res.ok) throw new Error("Chat request failed")

        const data = await res.json()
        setError(null)
        setMessages((prev) => [
          ...prev,
          {
            id: data.id ?? crypto.randomUUID(),
            role: "assistant",
            content: data.response ?? data.content ?? "",
            timestamp: new Date(data.timestamp ?? Date.now()),
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed")
      } finally {
        setIsTyping(false)
      }
    },
    [],
  )

  const send = React.useCallback(
    async (content: string) => {
      if (!content.trim() || isTyping) return

      const text = content.trim()
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      const token = getStoredAccessToken()
      if (token && wsRef.current?.readyState === WebSocket.OPEN) {
        setIsTyping(true)
        wsRef.current.send(JSON.stringify({ type: "chat_message", content: text }))
      } else {
        await sendViaHttp(text, token)
      }
    },
    [isTyping, sendViaHttp],
  )

  const clear = React.useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isTyping, error, send, clear, connect, disconnect }
}
