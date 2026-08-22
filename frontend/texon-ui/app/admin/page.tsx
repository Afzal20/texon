"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Users, Shield, Database, FolderArchive,
  Lock, MapPin, DollarSign, Settings, BarChart3
} from "lucide-react"
import { toast } from "sonner"
import { restList } from "@/lib/api/rest"

interface PageStat {
  users: number
  roles: number
  locations: number
  buyers: number
  modules: number
}

const modules = [
  "Order Management",
  "Commercial",
  "HR & Payroll",
  "Inventory",
  "Production",
  "Accounts",
  "Compliance",
]

export default function ControlPanelAdminIndexPage() {
  const [stats, setStats] = useState<PageStat>({ users: 0, roles: 0, locations: 0, buyers: 0, modules: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      restList("authentication", "User"),
      restList("rbac", "Role"),
      restList("multi_company", "LocationBasedOperation"),
      restList("buyers", "Buyer"),
    ])
      .then(([users, roles, locations, buyers]) => {
        setStats({
          users: users.data?.length ?? 0,
          roles: roles.data?.length ?? 0,
          locations: locations.data?.length ?? 0,
          buyers: buyers.data?.length ?? 0,
          modules: modules.length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pages = [
    { title: "User Management", slug: "user-management", desc: "Manage user accounts, roles, and access levels.", icon: Users, stat: loading ? "Loading…" : `${stats.users} users`, color: "text-primary" },
    { title: "Security & Access Control", slug: "security-access-control", desc: "System roles, permissions, and security protocols.", icon: Shield, stat: loading ? "Loading…" : `${stats.roles} roles`, color: "text-emerald-600" },
    { title: "Backup & Recovery", slug: "backup-recovery", desc: "Automated data protection and disaster recovery.", icon: Database, stat: "Not configured", color: "text-amber-600" },
    { title: "Document Archiving", slug: "document-archiving", desc: "Centralized document repository with retention policies.", icon: FolderArchive, stat: "Not configured", color: "text-violet-600" },
    { title: "Role-Based Permissions", slug: "role-based-permissions", desc: "Define roles and granular module-level permissions.", icon: Lock, stat: loading ? "Loading…" : `${stats.modules} modules`, color: "text-blue-600" },
    { title: "Micro-Level Permissions", slug: "micro-level-permissions-user-location-sub-company", desc: "Granular access by user, location, and sub-company.", icon: MapPin, stat: loading ? "Loading…" : `${stats.locations} locations`, color: "text-rose-600" },
    { title: "Buyer/Marketing Price Permissions", slug: "buyer-marketing-team-wise-price-level-permission", desc: "Price level visibility and editing rights by buyer/team.", icon: DollarSign, stat: loading ? "Loading…" : `${stats.buyers} buyers`, color: "text-cyan-600" },
  ]

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Control Panel / Admin</h2>
              <p className="text-muted-foreground mt-1 text-sm">System administration, security, and access control modules.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("System settings opening...")}>
                <Settings className="h-4 w-4" /> System Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Audit log opening...")}>
                <BarChart3 className="h-4 w-4" /> Audit Log
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => {
            const Icon = page.icon
            return (
              <a key={page.slug} href={`/admin/${page.slug}`}>
                <Card className="hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full bg-white border-border/50 shadow-sm group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className={`h-5 w-5 ${page.color}`} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-sm font-semibold mt-3">{page.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{page.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <span className="text-xs font-medium text-primary">{page.stat}</span>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}