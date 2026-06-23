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
  Scissors,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Module Map", url: "/modules", icon: FileCheck2 },
  { title: "Order Management", url: "/orders", icon: ClipboardList },
  { title: "Production Planning", url: "/planning", icon: Factory },
  { title: "Inventory Control", url: "/inventory", icon: Package },
  { title: "AI Insights", url: "/ai-insights", icon: BrainCircuit },
  { title: "Performance", url: "/performance", icon: Activity },
  { title: "Costing & BOM", url: "/costing", icon: DollarSign },
  { title: "Cutting & Nesting", url: "/cutting", icon: Scissors },
  { title: "Compliance", url: "/compliance", icon: FileCheck2 },
  { title: "HR & Payroll", url: "/hr", icon: Users },
  { title: "Scheduling", url: "/scheduling", icon: CalendarDays },
  { title: "Security", url: "/security", icon: ShieldCheck },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 overflow-y-auto flex-1">
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-9 rounded-md text-sm font-medium transition-all duration-150 relative group",
                    isActive
                      ? "bg-accent text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <a href={item.url}>
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-r-full" />
                    )}
                    <item.icon
                      className={cn(
                        "size-4 mr-2 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border space-y-1 shrink-0">
        <Button
          className="w-full justify-start font-semibold text-sm gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="size-4" />
          Quick Report
        </Button>

        <SidebarMenu className="gap-0.5 mt-1">
          {[
            { title: "Settings", url: "/settings", icon: Settings },
            { title: "Support", url: "/support", icon: HelpCircle },
          ].map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-9 rounded-md text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <a href={item.url}>
                    <item.icon className="size-4 mr-2 shrink-0" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        {/* User info */}
        <div className="flex items-center gap-2 px-2 pt-2 border-t border-border mt-1">
          <Avatar className="h-7 w-7 border shrink-0">
            <AvatarImage src="https://i.pravatar.cc/150?u=rafiqul" alt="User" />
            <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">RI</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Rafiqul Islam</div>
            <div className="text-[10px] text-muted-foreground truncate">Factory Manager</div>
          </div>
          <ChevronRight className="size-3 text-muted-foreground shrink-0" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
