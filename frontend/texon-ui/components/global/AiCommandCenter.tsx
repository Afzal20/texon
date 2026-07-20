"use client"

import * as React from "react"
import { Sparkles, Send, X, Loader2, ArrowUpRight, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAiChat } from "@/hooks/use-ai-chat"

const SUGGESTIONS = [
  {
    icon: "📊",
    title: "Production Summary",
    prompt: "Give me a summary of today's production output across all lines.",
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    prompt: "What are the current bottleneck risks for active orders?",
  },
  {
    icon: "🧵",
    title: "Inventory Status",
    prompt: "Check fabric inventory levels and flag any deadstock alerts.",
  },
  {
    icon: "👥",
    title: "HR Attendance",
    prompt: "Show attendance overview for today across all departments.",
  },
]

export function AiCommandCenter() {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const initializedRef = React.useRef(false)

  const { messages, isTyping, error, send, clear, connect, disconnect } = useAiChat()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        !(target instanceof Element && target.closest("[data-ai-trigger]"))
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  React.useEffect(() => {
    if (open && !initializedRef.current) {
      initializedRef.current = true
      connect()
    }
    if (!open) {
      disconnect()
    }
  }, [open, connect, disconnect])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleSend(prompt?: string) {
    const text = (prompt ?? input).trim()
    if (!text || isTyping) return

    setInput("")
    send(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {open && (
        <div ref={panelRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-full max-w-lg h-[680px] flex flex-col rounded-2xl border bg-white shadow-2xl overflow-hidden z-[200] animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10">
                  <Sparkles className="size-4.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    AI Assistant
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Ask anything about your factory
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
            >
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </div>
              )}

              {messages.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
                    <Bot className="size-7 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1">
                    How can I help?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Ask about production, inventory, orders, compliance, or
                    anything else.
                  </p>

                  <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => handleSend(s.prompt)}
                        className="flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left hover:bg-muted/60 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{s.icon}</span>
                          <ArrowUpRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-medium text-foreground leading-tight">
                          {s.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                      <Sparkles className="size-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md",
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex items-center justify-center size-7 rounded-lg bg-slate-800 shrink-0 mt-0.5">
                      <User className="size-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 shrink-0">
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about production, orders, inventory..."
                  className="flex-1 h-10 rounded-xl border-border/60 bg-muted/40 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/40"
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10 rounded-xl shrink-0"
                >
                  {isTyping ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-[10px] text-muted-foreground">
                  Press <kbd className="font-mono px-1 py-0.5 rounded border bg-muted text-[9px]">Enter</kbd> to send
                  {" · "}
                  <kbd className="font-mono px-1 py-0.5 rounded border bg-muted text-[9px]">Ctrl+K</kbd> to toggle
                </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
