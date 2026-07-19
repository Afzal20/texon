"use client"

import * as React from "react"
import {
  Activity,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Factory,
  FileCheck2,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"

import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  texonModuleGroups,
  texonModules,
  type TexonModule,
  type TexonModuleAccent,
  type TexonModuleGroup,
  type TexonModuleIcon,
} from "@/lib/texon-modules"

const moduleIcons = {
  activity: Activity,
  calendar: CalendarDays,
  clipboard: ClipboardList,
  dollar: DollarSign,
  factory: Factory,
  fileCheck: FileCheck2,
  package: Package,
  settings: Settings,
  shield: ShieldCheck,
  users: Users,
} satisfies Record<TexonModuleIcon, typeof Activity>

const accentStyles = {
  indigo: {
    rail: "bg-indigo-500",
    icon: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  emerald: {
    rail: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  amber: {
    rail: "bg-amber-500",
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  rose: {
    rail: "bg-rose-500",
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  sky: {
    rail: "bg-sky-500",
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  slate: {
    rail: "bg-slate-500",
    icon: "bg-slate-50 text-slate-700 ring-slate-100",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    dot: "bg-slate-500",
  },
} satisfies Record<TexonModuleAccent, Record<"rail" | "icon" | "badge" | "dot", string>>

const totalModules = texonModules.length
const totalPages = texonModules.reduce((total, module) => total + module.items.length, 0)
const factoryPages = countPagesByGroup("Factory Operations")
const platformPages = countPagesByGroup("Platform & Reporting")

function countPagesByGroup(group: TexonModuleGroup) {
  return texonModules.reduce((total, module) => {
    return module.group === group ? total + module.items.length : total
  }, 0)
}

function moduleMatches(module: TexonModule, query: string) {
  if (!query) {
    return true
  }

  const haystack = [
    module.title,
    module.group,
    ...module.items,
  ].join(" ").toLowerCase()

  return haystack.includes(query)
}

function getVisibleItems(module: TexonModule, query: string) {
  if (!query) {
    return module.items
  }

  const moduleHeaderMatches =
    module.title.toLowerCase().includes(query) ||
    module.group.toLowerCase().includes(query)

  if (moduleHeaderMatches) {
    return module.items
  }

  return module.items.filter((item) => item.toLowerCase().includes(query))
}

export default function ModuleMapPage() {
  const [query, setQuery] = React.useState("")
  const [activeGroup, setActiveGroup] = React.useState<TexonModuleGroup | "All">("All")
  const normalizedQuery = query.trim().toLowerCase()

  const visibleModules = texonModules.filter((module) => {
    const groupMatches = activeGroup === "All" || module.group === activeGroup
    return groupMatches && moduleMatches(module, normalizedQuery)
  })

  return (
    <AppLayout>
      <div className="page-shell max-w-[1600px] space-y-6">
        <div className="page-header-row">
          <div className="min-w-0">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Texon IDE
            </div>
            <h2 className="page-title">Module Map</h2>
            <p className="page-subtitle mt-1 max-w-3xl">
              Merchandising, planning, production, commercial, store, quality,
              HR, finance, admin, reporting, and location operations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-7 rounded-md border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
              Static UI data
            </Badge>
            <Badge variant="outline" className="h-7 rounded-md border-sky-200 bg-sky-50 px-3 text-sky-700">
              {totalPages} pages
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-lg border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalModules}</div>
              <p className="mt-1 text-xs text-muted-foreground">Major ERP areas</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{totalPages}</div>
              <p className="mt-1 text-xs text-muted-foreground">Static workflows listed</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Factory Ops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{factoryPages}</div>
              <p className="mt-1 text-xs text-muted-foreground">Production-facing pages</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{platformPages}</div>
              <p className="mt-1 text-xs text-muted-foreground">Reporting and shared controls</p>
            </CardContent>
          </Card>
        </div>

        <div className="sticky top-[76px] z-20 rounded-lg border border-border bg-white p-3 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules or pages"
                className="h-9 w-full bg-muted/30 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={activeGroup === "All" ? "default" : "outline"}
                onClick={() => setActiveGroup("All")}
                className="h-9 gap-2"
              >
                All
                <span className={cn(
                  "rounded bg-white/20 px-1.5 text-[11px]",
                  activeGroup !== "All" && "bg-muted text-muted-foreground"
                )}>
                  {totalPages}
                </span>
              </Button>
              {texonModuleGroups.map((group) => {
                const isActive = activeGroup === group
                return (
                  <Button
                    key={group}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setActiveGroup(group)}
                    className="h-9 gap-2"
                  >
                    {group}
                    <span className={cn(
                      "rounded bg-white/20 px-1.5 text-[11px]",
                      !isActive && "bg-muted text-muted-foreground"
                    )}>
                      {countPagesByGroup(group)}
                    </span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-[152px] rounded-lg border border-border bg-white/90 p-3 shadow-sm">
              <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Module Index
              </div>
              <nav className="space-y-1">
                {texonModules.map((module) => {
                  const styles = accentStyles[module.accent]
                  return (
                    <a
                      key={module.slug}
                      href={`#${module.slug}`}
                      className="flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      <span className={cn("h-2 w-2 rounded-full", styles.dot)} />
                      <span className="min-w-0 flex-1 truncate">{module.title}</span>
                      <span className="rounded bg-muted px-1.5 text-[11px] text-muted-foreground">
                        {module.items.length}
                      </span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </aside>

          <div className="space-y-4">
            {visibleModules.map((module) => {
              const Icon = moduleIcons[module.icon]
              const styles = accentStyles[module.accent]
              const visibleItems = getVisibleItems(module, normalizedQuery)

              return (
                <Card
                  key={module.slug}
                  id={module.slug}
                  className="scroll-mt-40 rounded-lg border-border/80 bg-white"
                >
                  <div className={cn("h-1 w-full", styles.rail)} />
                  <CardHeader className="gap-4 px-6 sm:flex sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={cn("rounded-lg p-2 ring-1", styles.icon)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className={cn("rounded-md", styles.badge)}>
                            {module.group}
                          </Badge>
                          <Badge variant="secondary" className="rounded-md">
                            {module.items.length} pages
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
                      {visibleItems.map((item, index) => (
                        <li key={item} className="flex min-w-0 items-start gap-2 rounded-md py-1.5">
                          <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", styles.dot)} />
                          <span className="min-w-0 text-sm leading-5 text-foreground/85">{item}</span>
                          <span className="sr-only">Page {index + 1}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}

            {visibleModules.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
                <div className="text-base font-semibold">No matching pages</div>
                <p className="mt-1 text-sm text-muted-foreground">Try another module or workflow name.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setQuery("")
                    setActiveGroup("All")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
