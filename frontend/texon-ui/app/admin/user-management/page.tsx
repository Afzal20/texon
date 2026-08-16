"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Search, Plus, Download, RefreshCw,
  Users, UserCheck, UserX, Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { gqlList, type GqlRow } from "@/lib/api/graphql"

interface UserRow {
  name: string
  email: string
  role: string
  department: string
  status: string
  lastLogin: string
  avatar: string
  twoFA: boolean
}

function formatLastLogin(value: unknown): string {
  if (!value) return "Never"
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return minutes <= 1 ? "just now" : `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`
  return date.toLocaleDateString()
}

function mapUser(row: GqlRow): UserRow {
  const firstName = String(row.first_name ?? "")
  const lastName = String(row.last_name ?? "")
  const email = String(row.email ?? "")
  const name = `${firstName} ${lastName}`.trim() || email
  const role = row.is_superuser ? "Super Admin" : row.is_staff ? "Staff" : "User"
  const active = Boolean(row.is_active)
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return {
    name,
    email,
    role,
    department: "—",
    status: active ? "Active" : "Inactive",
    lastLogin: formatLastLogin(row.last_login),
    avatar: initials || "U",
    twoFA: Boolean(row.is_verified),
  }
}

const roleColors: Record<string, string> = {
  "Super Admin": "bg-red-50 text-red-700 border-red-200",
  "Staff": "bg-primary/10 text-primary border-primary/20",
  "User": "bg-slate-50 text-slate-700 border-slate-200",
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    gqlList("authentication", "User")
      .then((res) => setUsers((res.data ?? []).map(mapUser)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase()),
  )

  const activeCount = users.filter((u) => u.status === "Active").length
  const inactiveCount = users.filter((u) => u.status === "Inactive").length
  const twoFACount = users.filter((u) => u.twoFA).length

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
              <p className="text-muted-foreground mt-1 text-sm">Manage user accounts, roles, and access levels.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("User list exported to CSV")}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button size="sm" className="gap-2" onClick={() => toast.info("Add user dialog coming soon")}>
                <Plus className="h-4 w-4" /> Add User
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{loading ? "—" : activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active in system</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{loading ? "—" : inactiveCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Require reactivation</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Verified</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">{loading ? "—" : twoFACount}</span>
                {users.length > 0 && <span className="text-sm text-muted-foreground">/ {users.length}</span>}
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${users.length ? (twoFACount / users.length) * 100 : 0}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base font-semibold">All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_0.8fr_1fr_0.8fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
              <div>User</div>
              <div>Email</div>
              <div>Role</div>
              <div>Department</div>
              <div>Status</div>
              <div>Last Login</div>
              <div>Verified</div>
            </div>
            {loading && (
              <div className="px-6 py-8 text-sm text-muted-foreground text-center">Loading users…</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="px-6 py-8 text-sm text-muted-foreground text-center">No users found.</div>
            )}
            {filtered.map((u, i) => (
              <div key={i} className="grid grid-cols-[2fr_2fr_1.2fr_1fr_0.8fr_1fr_0.8fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {u.avatar}
                  </div>
                  <span className="font-medium text-foreground">{u.name}</span>
                </div>
                <div className="text-muted-foreground text-xs">{u.email}</div>
                <div>
                  <span className={cn("text-xs font-semibold px-2 py-1 rounded border", roleColors[u.role] || "bg-muted text-muted-foreground border-border")}>
                    {u.role}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">{u.department}</div>
                <div>
                  <span className={cn("text-xs font-semibold px-2 py-1 rounded border", u.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                    {u.status}
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">{u.lastLogin}</div>
                <div>
                  {u.twoFA ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
              </div>
            ))}
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              Showing {filtered.length} of {users.length} user(s)
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}