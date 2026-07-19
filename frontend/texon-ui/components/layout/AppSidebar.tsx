"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Package,
  BrainCircuit,
  Settings,
  HelpCircle,
  Plus,
  ShieldCheck,
  CalendarDays,
  Users,
  Activity,
  FileCheck2,
  DollarSign,
  ChevronRight,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Search,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarResizeHandle,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getGroupedCategories, type NavCategory } from "@/components/data/navigation"

const quickLinks = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Module Map", url: "/modules", icon: FileCheck2 },
  { title: "AI Insights", url: "/ai-insights", icon: BrainCircuit },
  { title: "Settings", url: "/settings", icon: Settings },
]

const STORAGE_KEY = "sidebar-tree-state"

function loadTreeState(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveTreeState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function AnimatedContainer({
  open,
  className,
  children,
}: {
  open: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("grid transition-[grid-template-rows] duration-200 ease-in-out", className)}
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

function TreeCategory({ cat, treeState, setTreeState }: { cat: NavCategory; treeState: Record<string, boolean>; setTreeState: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
  const pathname = usePathname()
  const isActive = cat.pages.some((p) => pathname === `/pages/${p.slug}`)
  const open = treeState[cat.title] ?? false

  const toggle = () => {
    const next = { ...treeState, [cat.title]: !open }
    setTreeState(next)
    saveTreeState(next)
  }

  React.useEffect(() => {
    if (isActive && !open) {
      const next = { ...treeState, [cat.title]: true }
      setTreeState(next)
      saveTreeState(next)
    }
  }, [isActive])

  return (
    <div>
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
          isActive
            ? "text-primary bg-primary/10 shadow-sm"
            : open
              ? "text-foreground bg-muted/40"
              : "text-foreground/70 hover:bg-muted/50 hover:text-foreground/90"
        )}
      >
        <cat.icon className={cn(
          "size-4 shrink-0 transition-colors duration-150",
          isActive ? "text-primary" : open ? "text-primary/70" : "text-muted-foreground"
        )} />
        <span className="flex-1 text-left truncate">{cat.title}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-in-out",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <AnimatedContainer open={open}>
        <div className="ml-4 pl-3 border-l border-primary/20 mt-0.5 space-y-0.5">
          {cat.pages.map((page) => {
            const href = page.url
            const active = pathname === href
            return (
              <a
                key={page.slug}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded text-[13px] transition-all duration-150",
                  active
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150",
                  active ? "bg-primary" : "bg-primary/30"
                )} />
                <span className="truncate">{page.title}</span>
              </a>
            )
          })}
        </div>
      </AnimatedContainer>
    </div>
  )
}

function TreeGroup({ name, cats, treeState, setTreeState }: { name: string; cats: NavCategory[]; treeState: Record<string, boolean>; setTreeState: React.Dispatch<React.SetStateAction<Record<string, boolean>>> }) {
  const open = treeState[name] ?? true

  const toggle = () => {
    const next = { ...treeState, [name]: !open }
    setTreeState(next)
    saveTreeState(next)
  }

  return (
    <div className="mb-2">
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150",
          open ? "text-primary/80" : "text-muted-foreground/60 hover:text-muted-foreground"
        )}
      >
        <ChevronDown
          className={cn(
            "size-3 shrink-0 transition-transform duration-200 ease-in-out",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
        <span>{name}</span>
      </button>
      <AnimatedContainer open={open}>
        <div className="space-y-0.5 mt-0.5">
          {cats.map((cat) => (
            <TreeCategory key={cat.title} cat={cat} treeState={treeState} setTreeState={setTreeState} />
          ))}
        </div>
      </AnimatedContainer>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const grouped = getGroupedCategories()
  const [search, setSearch] = React.useState("")
  const [treeState, setTreeState] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    setTreeState(loadTreeState())
  }, [])

  const filteredGrouped = React.useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toLowerCase()
    const result: Record<string, NavCategory[]> = {}
    for (const [group, cats] of Object.entries(grouped)) {
      const filtered = cats
        .map((cat) => ({
          ...cat,
          pages: cat.pages.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              cat.title.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.pages.length > 0)
      if (filtered.length > 0) result[group] = filtered
    }
    return result
  }, [grouped, search])

  return (
    <Sidebar
      {...props}
      className="border-r border-border bg-white"
      style={{ "--sidebar-background": "0 0% 100%" } as React.CSSProperties}
    >
      {/* Logo / Brand */}
      <SidebarHeader className="h-[64px] flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md shrink-0">
            <Factory className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-foreground">RMG ERP Premium</span>
            <span className="text-[10px] text-muted-foreground">Elite Factory Solutions</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/40 border-border/50"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex flex-wrap gap-1">
          {quickLinks.map((item) => {
            const active = pathname === item.url
            return (
              <a
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-3" />
                {item.title}
              </a>
            )
          })}
        </div>
      </div>

      {/* Navigation Tree */}
      <SidebarContent className="px-2 py-1 overflow-y-auto flex-1">
        {Object.entries(filteredGrouped).map(([group, cats]) => (
          <TreeGroup key={group} name={group} cats={cats} treeState={treeState} setTreeState={setTreeState} />
        ))}
        {Object.keys(filteredGrouped).length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No pages found
          </div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-border space-y-2 shrink-0 relative z-10">
        <Button
          onClick={() => toast.info("Quick report feature coming soon")}
          className="w-full justify-start font-semibold text-sm gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="size-4" />
          Quick Report
        </Button>

        <SidebarMenu className="gap-0.5 mt-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "h-9 rounded-md text-sm font-medium transition-all duration-150",
                pathname === "/support"
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <a href="/support" onClick={(e) => { e.preventDefault(); toast.info("Support page coming soon"); }}>
                <HelpCircle className="size-4 mr-2 shrink-0" />
                <span>Support</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User info */}
        <SidebarMenu className="mt-1">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-auto py-2"
                >
                  <Avatar className="h-8 w-8 rounded-lg border">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold">RI</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Rafiqul Islam</span>
                    <span className="truncate text-xs text-muted-foreground">Factory Manager</span>
                  </div>
                  <ChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border">
                      <AvatarImage src="" alt="Rafiqul Islam" />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-bold">RI</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Rafiqul Islam</span>
                      <span className="truncate text-xs text-muted-foreground">Factory Manager</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>My Performance</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarResizeHandle />
    </Sidebar>
  )
}
