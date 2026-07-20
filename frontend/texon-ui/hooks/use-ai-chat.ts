"use client"

import * as React from "react"
import { getValidAccessToken, getStoredAccessToken } from "@/lib/django-auth"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000"

function getWebSocketUrl(token: string): string {
  return `${WS_BASE}/ws/ai/chat/?token=${encodeURIComponent(token)}`
}

export function useAiChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const wsRef = React.useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const isMountedRef = React.useRef(true)

  const connect = React.useCallback(async () => {
    const token = await getValidAccessToken()
    if (!token) {
      setError("Not authenticated")
      return
    }

    const url = getWebSocketUrl(token)
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case "chunk":
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (last && last.role === "assistant" && last.id === data.message_id) {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.content,
                }
                return updated
              }
              return prev
            })
            break

          case "message_start":
            setIsTyping(false)
            setMessages((prev) => [
              ...prev,
              {
                id: data.message_id,
                role: "assistant",
                content: data.content ?? "",
                timestamp: new Date(data.timestamp ?? Date.now()),
              },
            ])
            break

          case "message_complete":
            setIsTyping(false)
            break

          case "error":
            setError(data.message ?? "An error occurred")
            setIsTyping(false)
            break
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onerror = () => {
      if (isMountedRef.current) {
        setError("WebSocket connection error")
      }
    }

    ws.onclose = (event) => {
      if (!isMountedRef.current) return
      if (!event.wasClean) {
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    wsRef.current = ws
  }, [])

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.onclose = null
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

  const send = React.useCallback(
    async (content: string) => {
      if (!content.trim() || isTyping) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])

      const token = getStoredAccessToken()
      if (token && wsRef.current?.readyState === WebSocket.OPEN) {
        setIsTyping(true)
        wsRef.current.send(
          JSON.stringify({ type: "chat_message", content: content.trim() }),
        )
      } else {
        setIsTyping(true)
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/ai/chat/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ message: content.trim() }),
            },
          )

          if (!res.ok) throw new Error("Chat request failed")

          const data = await res.json()

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
      }
    },
    [isTyping],
  )

  const clear = React.useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isTyping, error, send, clear, connect, disconnect }
}
