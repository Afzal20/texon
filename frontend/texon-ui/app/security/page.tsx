"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Edit, Plus } from "lucide-react"

const roles = [
  { name: "Factory Owner", level: "Super Admin", users: 2 },
  { name: "Floor Manager",  level: "Module Admin", users: 12 },
  { name: "Merchandiser",   level: "Standard User", users: 45 },
]

const modules = [
  {
    title: "Production Module",
    perms: [
      { label: "Read Access",   granted: true },
      { label: "Write Access",  granted: true },
      { label: "Delete Access", granted: false },
    ],
  },
  {
    title: "Inventory Module",
    perms: [
      { label: "Read Access",   granted: true },
      { label: "Write Access",  granted: false },
      { label: "Delete Access", granted: false },
    ],
  },
]

export default function Security() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security & Access Control</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage system roles, granular permissions, and account security protocols.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Nav */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardContent className="p-2">
                {[
                  { label: "Personal Profile", active: false },
                  { label: "Language & Region", active: false },
                  { label: "Notifications", active: false },
                  { label: "Security & Role", active: true },
                  { label: "Organization", active: false },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      item.active
                        ? "bg-accent text-primary border-l-[3px] border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <ShieldCheck className={`h-4 w-4 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Security & Role Section */}
            <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-bold">Security & Role-Based Access</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage system roles, granular permissions, and account security protocols.</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Role Management */}
                <div>
                  <div className="text-sm font-bold text-foreground mb-3">Role Management</div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] text-xs font-bold text-muted-foreground uppercase tracking-wide px-4 py-3 bg-muted/20 border-b border-border">
                      <div>Role Name</div><div>Permission Level</div><div>Active Users</div><div>Action</div>
                    </div>
                    {roles.map((role, i) => (
                      <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_80px] items-center px-4 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                        <div className="font-medium text-foreground">{role.name}</div>
                        <div className="text-muted-foreground">{role.level}</div>
                        <div className="text-muted-foreground">{role.users}</div>
                        <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                          <Edit className="h-3 w-3" /> Edit
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add New Role
                  </Button>
                </div>

                {/* Permissions Matrix */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-foreground">Permissions Matrix: Floor Manager</div>
                    <button className="text-xs text-primary font-semibold hover:underline">Reset to Default</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {modules.map((mod) => (
                      <div key={mod.title} className="border border-border rounded-lg p-4">
                        <div className="text-sm font-bold text-foreground mb-3">{mod.title}</div>
                        {mod.perms.map((perm) => (
                          <div key={perm.label} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-foreground/80">{perm.label}</span>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              perm.granted ? "bg-primary border-primary" : "bg-white border-muted-foreground/30"
                            }`}>
                              {perm.granted && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2FA */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-bold text-foreground mb-3">Two-Factor Authentication</div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm text-foreground">WhatsApp/SMS 2FA</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Secure login via mobile code</div>
                      </div>
                      {/* Toggle */}
                      <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground mb-3">Session Management</div>
                    <div className="space-y-2">
                      {[
                        { device: "Windows PC – Dhaka", time: "Active Now", active: true },
                        { device: "iPhone 14 – Dhaka", time: "2 hours ago", active: false },
                      ].map((s) => (
                        <div key={s.device} className="flex items-center justify-between text-sm p-3 border border-border rounded-lg">
                          <span className="text-foreground/80">{s.device}</span>
                          <span className={`text-xs font-semibold ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                    ↻ View Audit Logs
                  </button>
                  <Button className="bg-foreground hover:bg-foreground/90 text-background font-semibold">
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
