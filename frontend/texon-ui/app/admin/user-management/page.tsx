"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Search, Plus, Download, RefreshCw,
  Users, UserCheck, UserX, Shield, MoreVertical,
  Edit, Trash2, Mail, Phone, Building2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const users = [
  { name: "Rafiqul Islam", email: "r.islam@dhakaplant.com", role: "Floor Manager", department: "Production", status: "Active", lastLogin: "2 hours ago", avatar: "RI", twoFA: true },
  { name: "Salma Begum", email: "s.begum@dhakaplant.com", role: "Quality Checker", department: "Quality Control", status: "Active", lastLogin: "1 hour ago", avatar: "SB", twoFA: true },
  { name: "Abdul Karim", email: "a.karim@dhakaplant.com", role: "Line Supervisor", department: "Production", status: "Active", lastLogin: "30 minutes ago", avatar: "AK", twoFA: false },
  { name: "Nusrat Jahan", email: "n.jahan@dhakaplant.com", role: "Merchandiser", department: "Merchandising", status: "Active", lastLogin: "1 day ago", avatar: "NJ", twoFA: true },
  { name: "Kamal Hossain", email: "k.hossain@dhakaplant.com", role: "Store Manager", department: "Inventory", status: "Active", lastLogin: "3 hours ago", avatar: "KH", twoFA: true },
  { name: "Fatema Begum", email: "f.begum@dhakaplant.com", role: "HR Officer", department: "HR & Payroll", status: "Inactive", lastLogin: "5 days ago", avatar: "FB", twoFA: false },
  { name: "Rahim Uddin", email: "r.uddin@dhakaplant.com", role: "Sewing Operator", department: "Production", status: "Active", lastLogin: "4 hours ago", avatar: "RU", twoFA: false },
  { name: "Anisur Rahman", email: "a.rahman@dhakaplant.com", role: "IE Engineer", department: "IE & Planning", status: "Active", lastLogin: "12 hours ago", avatar: "AR", twoFA: true },
]

const roleColors: Record<string, string> = {
  "Floor Manager": "bg-primary/10 text-primary border-primary/20",
  "Quality Checker": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Line Supervisor": "bg-amber-50 text-amber-700 border-amber-200",
  "Merchandiser": "bg-violet-50 text-violet-700 border-violet-200",
  "Store Manager": "bg-blue-50 text-blue-700 border-blue-200",
  "HR Officer": "bg-rose-50 text-rose-700 border-rose-200",
  "Sewing Operator": "bg-slate-50 text-slate-700 border-slate-200",
  "IE Engineer": "bg-cyan-50 text-cyan-700 border-cyan-200",
}

export default function UserManagementPage() {
  const [search, setSearch] = useState("")

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
              <div className="text-3xl font-bold text-foreground">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active in system</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{inactiveCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Require reactivation</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">2FA Enabled</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">{twoFACount}</span>
                <span className="text-sm text-muted-foreground">/ {users.length}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(twoFACount / users.length) * 100}%` }} />
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
              <div>2FA</div>
            </div>
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
