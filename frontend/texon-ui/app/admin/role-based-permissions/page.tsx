"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, Shield, Plus, Users, Lock,
  Edit, CheckCircle2, XCircle,
  ChevronDown, ChevronRight, Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { restList } from "@/lib/api/rest"

interface PermMatrix {
  read: boolean
  write: boolean
  delete: boolean
}

interface RoleRow {
  name: string
  description: string
  level: string
  users: string
  color: string
  permissions: Record<string, PermMatrix>
}

export default function RolebasedPermissionsPage() {
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [userCount, setUserCount] = useState(0)
  const [permissionCount, setPermissionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([restList("rbac", "Role"), restList("rbac", "Permission"), restList("authentication", "User")])
      .then(([rolesRes, permsRes, usersRes]) => {
        const groups = new Map<string, PermMatrix>()
        for (const perm of permsRes.data ?? []) {
          const group = String(perm.group ?? "General")
          if (!groups.has(group)) groups.set(group, { read: true, write: false, delete: false })
        }
        const roleRows: RoleRow[] = (rolesRes.data ?? []).map((role) => ({
          name: String(role.name ?? ""),
          description: String(role.description ?? ""),
          level: role.is_system ? "System Role" : "Custom Role",
          users: "—",
          color: role.is_system ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/10 text-primary border-primary/20",
          permissions: Object.fromEntries(groups),
        }))
        setRoles(roleRows)
        setUserCount((usersRes.data ?? []).length)
        setPermissionCount(groups.size)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleRole = (name: string) => {
    setExpandedRole(expandedRole === name ? null : name)
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">Role-Based Permissions</h2>
              <p className="text-muted-foreground mt-1 text-sm">Define roles and granular module-level permissions for your organization.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-2" onClick={() => toast.info("Create role dialog coming soon")}>
                <Plus className="h-4 w-4" /> Create Role
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : roles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Custom system roles</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Users Assigned</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : userCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all roles</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Permission Modules</CardTitle>
              <Lock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : permissionCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Controllable modules</p>
            </CardContent>
          </Card>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {loading && <div className="py-10 text-sm text-muted-foreground text-center">Loading roles…</div>}
          {!loading && roles.length === 0 && <div className="py-10 text-sm text-muted-foreground text-center">No roles defined yet.</div>}
          {roles.map((role) => (
            <Card key={role.name} className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => toggleRole(role.name)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{role.name}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide", role.color)}>
                        {role.level}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground font-mono">{role.users} users</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); toast.info(`Editing ${role.name}`) }}>
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {expandedRole === role.name ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedRole === role.name && (
                <div className="border-t border-border bg-muted/5">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border">
                    <div>Module</div>
                    <div className="text-center">Read</div>
                    <div className="text-center">Write</div>
                    <div className="text-center">Delete</div>
                  </div>
                  {Object.entries(role.permissions).map(([module, perms], i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                      <div className="font-medium text-foreground text-xs">{module}</div>
                      <div className="flex justify-center">
                        {perms.read ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                      </div>
                      <div className="flex justify-center">
                        {perms.write ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                      </div>
                      <div className="flex justify-center">
                        {perms.delete ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                      </div>
                    </div>
                  ))}
                  <div className="p-4 border-t border-border flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => toast.info("Permission template loading...")}>
                      Clone as Template
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700" onClick={() => toast.warning("Cannot delete built-in role")}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Role
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
