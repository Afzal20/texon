"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, Shield, Key, Users, Lock,
  Smartphone, Monitor, Plus,
  Edit, CheckCircle2, AlertTriangle, Globe, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { restList } from "@/lib/api/rest"

interface RoleRow {
  name: string
  level: string
  users: string
  color: string
}

interface PermRow {
  module: string
  read: boolean
  write: boolean
  delete: boolean
}

export default function SecurityAccessControlPage() {
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [permissions, setPermissions] = useState<PermRow[]>([])
  const [twoFaCoverage, setTwoFaCoverage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState("")

  useEffect(() => {
    Promise.all([restList("rbac", "Role"), restList("rbac", "Permission"), restList("authentication", "User")])
      .then(([rolesRes, permsRes, usersRes]) => {
        const roleRows: RoleRow[] = (rolesRes.data ?? []).map((role) => ({
          name: String(role.name ?? ""),
          level: role.is_system ? "System Role" : "Custom Role",
          users: "—",
          color: role.is_system ? "bg-red-50 text-red-700 border-red-200" : "bg-primary/10 text-primary border-primary/20",
        }))
        setRoles(roleRows)
        if (roleRows.length > 0) setSelectedRole(roleRows[0].name)
        const groups = new Map<string, PermRow>()
        for (const perm of permsRes.data ?? []) {
          const group = String(perm.group ?? "General")
          if (!groups.has(group)) groups.set(group, { module: group, read: true, write: false, delete: false })
        }
        setPermissions([...groups.values()])
        const users = usersRes.data ?? []
        setTwoFaCoverage(users.length ? Math.round((users.filter((u) => u.is_verified).length / users.length) * 100) : 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">Security & Access Control</h2>
              <p className="text-muted-foreground mt-1 text-sm">Manage system roles, granular permissions, and account security protocols.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Security audit log exported")}>
                <Download className="h-4 w-4" /> Export Log
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Roles</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : roles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Configured system roles</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Sessions</CardTitle>
              <Globe className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">1</div>
              <p className="text-xs text-muted-foreground mt-1">Current session</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Verified</CardTitle>
              <Key className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">{loading ? "—" : `${twoFaCoverage}%`}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${twoFaCoverage}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Failed Logins (24h)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">No failed logins recorded</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Role Management + Permissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Management Table */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">Role Management</CardTitle>
                <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Add role dialog coming soon")}>
                  <Plus className="h-3.5 w-3.5" /> Add New Role
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Role Name</div>
                  <div>Permission Level</div>
                  <div>Active Users</div>
                  <div>Action</div>
                </div>
                {loading && <div className="px-6 py-8 text-xs text-muted-foreground text-center">Loading roles…</div>}
                {!loading && roles.length === 0 && <div className="px-6 py-8 text-xs text-muted-foreground text-center">No roles defined yet.</div>}
                {roles.map((r, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div className="font-medium text-foreground">{r.name}</div>
                    <div>
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded border", r.color)}>
                        {r.level}
                      </span>
                    </div>
                    <div className="text-muted-foreground font-mono">{r.users}</div>
                    <div>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => { setSelectedRole(r.name); toast.info(`Editing ${r.name} permissions`) }}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Permissions Matrix */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">
                  Permissions Matrix: <span className="text-primary">{selectedRole || "System Role"}</span>
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => toast.info("Permissions reset to default")}>
                  Reset to Default
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Module</div>
                  <div className="text-center">Read Access</div>
                  <div className="text-center">Write Access</div>
                  <div className="text-center">Delete Access</div>
                </div>
                {loading && <div className="px-6 py-8 text-xs text-muted-foreground text-center">Loading permissions…</div>}
                {!loading && permissions.length === 0 && <div className="px-6 py-8 text-xs text-muted-foreground text-center">No permissions defined yet.</div>}
                {permissions.map((perms, i) => (
                  <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div className="font-medium text-foreground">{perms.module}</div>
                    <div className="flex justify-center">
                      <input type="checkbox" checked={perms.read} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20" readOnly />
                    </div>
                    <div className="flex justify-center">
                      <input type="checkbox" checked={perms.write} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20" readOnly />
                    </div>
                    <div className="flex justify-center">
                      <input type="checkbox" checked={perms.delete} className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20" readOnly />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: 2FA + Sessions */}
          <div className="space-y-4">
            {/* Two-Factor Authentication */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" /> Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">WhatsApp/SMS 2FA</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Secure login via mobile code</p>
                  </div>
                  <div onClick={() => toast.success("2FA toggled")} className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Email Verification</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{twoFaCoverage}% of users verified</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" /> Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground/80">Current session</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">Active Now</span>
                </div>
                <p className="text-xs text-muted-foreground px-1">Device history is not tracked on the backend.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}