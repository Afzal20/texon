"use client"

import * as React from "react"
import { Sparkles, AlertTriangle, ArrowRight, Lightbulb, History, Search, TrendingUp, Users } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function AiCommandCenter() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3">
        <Sparkles className="mr-2 h-5 w-5 shrink-0 text-blue-600" />
        <input
          className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="What is the delay risk for PO-84920?"
        />
        <div className="flex gap-1 ml-auto shrink-0">
          <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">EN</kbd>
          <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">BN</kbd>
          <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘K</kbd>
        </div>
      </div>
      
      <div className="flex h-[400px]">
        {/* Left Side: Live Insight & Suggestions */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="p-4 flex-1 overflow-y-auto">
            {/* Live Insight */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Live Insight
              </div>
              <div className="border rounded-md p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono font-medium">PO-84920</span>
                    <span className="text-sm font-medium text-muted-foreground">H&M</span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-600 font-bold text-lg">
                      <AlertTriangle className="h-4 w-4" />
                      82%
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase">High Risk</div>
                  </div>
                </div>
                <h4 className="text-base font-semibold mb-3">Delay Risk Assessment</h4>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ship Date</div>
                    <div className="font-medium font-mono text-xs">2023-11-15</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bottleneck</div>
                    <div className="font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-600" />
                      Dyeing Unit 3
                    </div>
                  </div>
                </div>
                <button className="w-full text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-md py-2 flex items-center justify-center gap-1 transition-colors">
                  View Full Analysis <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Suggested Queries */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                <Lightbulb className="h-3 w-3" />
                Suggested Queries
              </div>
              <div className="flex flex-col gap-1">
                {["Fabric stock levels for Unit 2", "List expiring fire licenses", "Current production efficiency on Line 4"].map((query) => (
                  <button key={query} className="text-left text-sm p-2 hover:bg-muted rounded-md transition-colors text-foreground/80 hover:text-foreground">
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity */}
        <div className="w-[280px] bg-muted/20 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              <History className="h-3 w-3" />
              Recent Activity
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: Search, text: "Monthly power consum...", time: "2 hours ago" },
                { icon: Users, text: "HR absent report", time: "Yesterday" },
                { icon: TrendingUp, text: "Generated Q3 Forecast", time: "Oct 12", color: "text-blue-600" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <item.icon className={`h-4 w-4 mt-0.5 ${item.color || "text-muted-foreground"}`} />
                  <div>
                    <div className="text-sm font-medium leading-none mb-1 text-foreground/90">{item.text}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-4 py-2 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="border bg-background rounded px-1">↵</kbd> to select</span>
          <span className="flex items-center gap-1"><kbd className="border bg-background rounded px-1">↑</kbd><kbd className="border bg-background rounded px-1">↓</kbd> to navigate</span>
          <span className="flex items-center gap-1"><kbd className="border bg-background rounded px-1">ESC</kbd> to close</span>
        </div>
        <div className="text-[10px] font-medium text-muted-foreground">
          Powered by <span className="text-blue-600 font-bold">RMG ERP AI</span>
        </div>
      </div>
    </CommandDialog>
  )
}
