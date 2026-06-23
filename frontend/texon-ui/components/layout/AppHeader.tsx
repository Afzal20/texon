"use client"

import { Search, Bell, MessageSquare, Globe, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 h-[64px] border-b border-border bg-white/70 backdrop-blur-md shadow-sm flex items-center justify-between px-4 shrink-0 gap-4 transition-all">
      {/* Left: trigger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
        <h1 className="font-bold text-base text-foreground hidden md:block whitespace-nowrap">
          RMG Industrial Intelligence
        </h1>
      </div>

      {/* Center: Search */}
      <div className="relative hidden md:flex items-center max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search orders..."
          className="w-full pl-9 pr-14 h-9 bg-muted/40 border-border text-sm focus-visible:ring-primary"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Language toggle */}
        <span className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground px-1">
          BN/EN
        </span>

        {/* Icon buttons */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-white" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
            <Globe className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Command button */}
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold text-sm px-4 h-9"
          onClick={() => {
            // Trigger Ctrl+K
            const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true })
            document.dispatchEvent(event)
          }}
        >
          <Sparkles className="h-4 w-4" />
          AI Command
        </Button>

        {/* Avatar */}
        <Avatar className="h-8 w-8 border-2 border-border cursor-pointer hover:border-primary transition-colors">
          <AvatarImage src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="User" />
          <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
