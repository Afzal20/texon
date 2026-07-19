"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Shield, Key, Users, Lock,
  Smartphone, Monitor, MoreVertical, Plus,
  Edit, CheckCircle2, AlertTriangle, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const roles = [
  { name: "Factory Owner", level: "Super Admin", users: 2, color: "bg-red-50 text-red-700 border-red-200" },
  { name: "Floor Manager", level: "Module Admin", users: 12, color: "bg-primary/10 text-primary border-primary/20" },
  { name: "Merchandiser", level: "Standard User", users: 45, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Quality Checker", level: "Standard User", users: 18, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Line Supervisor", level: "Limited User", users: 8, color: "bg-amber-50 text-amber-700 border-amber-200" },
]

const sessions = [
  { device: "Windows PC", location: "Dhaka", browser: "Chrome 120", status: "Active Now", time: "Now", icon: Monitor },
  { device: "iPhone 14", location: "Dhaka", browser: "Safari", status: "Recent", time: "2 hours ago", icon: Smartphone },
  { device: "Android Tablet", location: "Gazipur", browser: "Chrome Mobile", status: "Expired", time: "1 day ago", icon: Smartphone },
]

const permissions = {
  production: { read: true, write: true, delete: false },
  inventory: { read: true, write: false, delete: false },
  commercial: { read: true, write: true, delete: false },
  hr: { read: true, write: false, delete: false },
  compliance: { read: true, write: true, delete: false },
  admin: { read: true, write: true, delete: true },
}

export default function SecurityAccessControlPage() {
  const [selectedRole, setSelectedRole] = useState("Floor Manager")

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
              <div className="text-3xl font-bold text-foreground">{roles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Configured system roles</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Sessions</CardTitle>
              <Globe className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{sessions.filter(s => s.status === "Active Now").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">2FA Coverage</CardTitle>
              <Key className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">85%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Failed Logins (24h)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-xs text-red-600 font-semibold mt-1">1 account temporarily locked</p>
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
                  Permissions Matrix: <span className="text-primary">{selectedRole}</span>
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
                {Object.entries(permissions).map(([module, perms], i) => (
                  <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div className="font-medium text-foreground capitalize">{module.replace(/([A-Z])/g, " $1").trim()}</div>
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
                  <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Authenticator App</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Use Google Authenticator or similar</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-muted relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">Backup Codes</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Generate one-time recovery codes</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success("Backup codes generated")}>
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Management */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" /> Session Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {sessions.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{s.device}</span>
                          <span className="text-xs text-muted-foreground">— {s.location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.browser}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn("text-xs font-semibold", s.status === "Active Now" ? "text-emerald-600" : s.status === "Recent" ? "text-muted-foreground" : "text-red-500")}>
                          {s.status}
                        </span>
                        <p className="text-[10px] text-muted-foreground">{s.time}</p>
                      </div>
                    </div>
                  )
                })}
                <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-2" onClick={() => toast.success("All other sessions terminated")}>
                  Terminate All Other Sessions
                </Button>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" /> Recent Login Attempts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {[
                  { user: "Rafiqul Islam", status: "Success", time: "2 hours ago", ip: "192.168.1.45", color: "text-emerald-600" },
                  { user: "Salma Begum", status: "Success", time: "1 hour ago", ip: "192.168.1.82", color: "text-emerald-600" },
                  { user: "Unknown", status: "Failed", time: "3 hours ago", ip: "45.33.12.8", color: "text-red-600" },
                  { user: "Abdul Karim", status: "Success", time: "4 hours ago", ip: "192.168.1.91", color: "text-emerald-600" },
                ].map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-1.5 h-1.5 rounded-full", l.status === "Success" ? "bg-emerald-500" : "bg-red-500")} />
                      <span className="font-medium text-foreground">{l.user}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="font-mono">{l.ip}</span>
                      <span className={cn("font-semibold", l.color)}>{l.status}</span>
                      <span>{l.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Download({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
