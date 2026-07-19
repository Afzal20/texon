"use client"

import * as React from "react"
import { Sparkles, Send, X, Loader2, ArrowUpRight, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

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
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  function handleSend(prompt?: string) {
    const text = (prompt ?? input).trim()
    if (!text || isTyping) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateResponse(text),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 1200 + Math.random() * 800)
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
            {/* Header */}
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

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
            >
              {messages.length === 0 && (
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
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
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

            {/* Input */}
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

function generateResponse(query: string): string {
  const lower = query.toLowerCase()
  if (lower.includes("production") || lower.includes("output"))
    return "Today's production output is at 12,450 units across 6 active lines. Line 3 is leading with 3,200 units (94% efficiency). Line 5 is slightly behind target due to a brief downtime event at 10:15 AM. Overall OEE is at 78.3%, up 2.1% from yesterday."
  if (lower.includes("risk") || lower.includes("bottleneck"))
    return "I've identified 2 bottleneck risks: (1) PO-84920 (H&M) has an 82% delay risk due to Dyeing Unit 3 capacity constraints. (2) PO-85012 (Zara) fabric sourcing for Denim 12oz is 4 days behind schedule. I recommend reassigning Line 7 to cover the Zara order after Line 5 completes its current batch."
  if (lower.includes("inventory") || lower.includes("fabric"))
    return "Current fabric inventory summary: Cotton jersey (180gsm) — 12,400m in stock, reorder at 8,000m. Denim 12oz — 3,200m remaining (critical for PO-85012). 3 deadstock alerts flagged for surplus polyester blend (8,500m, aged 90+ days). I recommend initiating a markdown sale or contacting buyers for uptake."
  if (lower.includes("hr") || lower.includes("attendance"))
    return "Today's attendance: 892 out of 940 employees checked in (94.9%). Cutting department at 97.2%, Sewing at 93.8%, Finishing at 91.4%. 12 employees on approved leave, 3 unexcused absences flagged. Shift B starts at 2:00 PM with expected 100% coverage."
  if (lower.includes("compliance") || lower.includes("audit"))
    return "Compliance status: 2 upcoming audits — OEKO-TEX recertification (Oct 28) and buyer audit by H&M (Nov 5). Current score: 87/100. 3 open audit findings from the last SEDEX audit need corrective action by Nov 1. ESG metrics are within target except water recycling (currently at 62%, target 75%)."
  return `Based on your query about "${query}", here's what I found: The Texon ERP system has the latest data available. To give you a more specific answer, could you provide more details such as a specific order number, line ID, or date range? I can pull up detailed analytics for any aspect of your factory operations.`
}
