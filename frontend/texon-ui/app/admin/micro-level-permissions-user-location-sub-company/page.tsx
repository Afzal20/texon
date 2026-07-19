"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Users, MapPin, Building2, Search,
  Plus, Edit, CheckCircle2, XCircle, ChevronDown,
  ChevronRight, Shield, Filter, MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const locations = [
  { name: "Unit A – Wovens", code: "UAW", status: "Active", users: 120 },
  { name: "Unit B – Knits", code: "UBK", status: "Active", users: 95 },
  { name: "Unit C – Denim", code: "UCD", status: "Active", users: 80 },
  { name: "Head Office", code: "HO", status: "Active", users: 35 },
]

const subCompanies = [
  { name: "Texon Industrial Ltd.", code: "TIL", locations: 3, status: "Active" },
  { name: "Elite Fashion Wear", code: "EFW", locations: 1, status: "Active" },
  { name: "Dhaka Textile Co.", code: "DTC", locations: 2, status: "Inactive" },
]

const userPermissions = [
  { name: "Rafiqul Islam", role: "Floor Manager", location: "Unit A – Wovens", subCompany: "Texon Industrial Ltd.", modules: ["Production", "Inventory", "Order Management"], access: "Full", status: "Active" },
  { name: "Salma Begum", role: "Quality Checker", location: "Unit A – Wovens", subCompany: "Texon Industrial Ltd.", modules: ["Quality", "Compliance"], access: "Standard", status: "Active" },
  { name: "Kamal Hossain", role: "Store Manager", location: "Unit B – Knits", subCompany: "Texon Industrial Ltd.", modules: ["Inventory"], access: "Standard", status: "Active" },
  { name: "Nusrat Jahan", role: "Merchandiser", location: "Head Office", subCompany: "Texon Industrial Ltd.", modules: ["Order Management", "Commercial"], access: "Standard", status: "Active" },
  { name: "Abdul Karim", role: "Line Supervisor", location: "Unit C – Denim", subCompany: "Elite Fashion Wear", modules: ["Production"], access: "Limited", status: "Active" },
  { name: "Anisur Rahman", role: "IE Engineer", location: "Unit A – Wovens", subCompany: "Texon Industrial Ltd.", modules: ["Production", "IE & Planning"], access: "Standard", status: "Active" },
]

const accessColors: Record<string, string> = {
  "Full": "bg-primary/10 text-primary border-primary/20",
  "Standard": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Limited": "bg-amber-50 text-amber-700 border-amber-200",
  "None": "bg-red-50 text-red-700 border-red-200",
}

export default function MicrolevelPermissionsUserLocationSubCompanyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("users")
  const [search, setSearch] = useState("")

  const filtered = userPermissions.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase()) ||
      u.subCompany.toLowerCase().includes(search.toLowerCase()),
  )

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
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
              <h2 className="text-3xl font-bold tracking-tight">Micro-Level Permissions</h2>
              <p className="text-muted-foreground mt-1 text-sm">Granular access control by user, location, and sub-company.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Bulk assignment dialog coming soon")}>
                <Users className="h-4 w-4" /> Bulk Assign
              </Button>
              <Button size="sm" className="gap-2" onClick={() => toast.info("Add permission dialog coming soon")}>
                <Plus className="h-4 w-4" /> Add Permission
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{userPermissions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">With custom permissions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{locations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active locations</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sub-Companies</CardTitle>
              <Building2 className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{subCompanies.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered entities</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Permission Overrides</CardTitle>
              <Shield className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">24</div>
              <p className="text-xs text-muted-foreground mt-1">Custom overrides applied</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: User Permissions Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">User Permission Assignments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1.5fr_1fr_1.2fr_1.2fr_1.5fr_0.8fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>User</div>
                  <div>Role</div>
                  <div>Location</div>
                  <div>Sub-Company</div>
                  <div>Modules</div>
                  <div>Access</div>
                </div>
                {filtered.map((u, i) => (
                  <div key={i} className="grid grid-cols-[1.5fr_1fr_1.2fr_1.2fr_1.5fr_0.8fr] items-center px-6 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-foreground text-xs">{u.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{u.role}</div>
                    <div className="text-xs text-muted-foreground">{u.location}</div>
                    <div className="text-xs text-muted-foreground">{u.subCompany}</div>
                    <div className="flex flex-wrap gap-1">
                      {u.modules.map((m, j) => (
                        <span key={j} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
                      ))}
                    </div>
                    <div>
                      <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", accessColors[u.access])}>
                        {u.access}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Locations & Sub-Companies */}
          <div className="space-y-4">
            {/* Locations */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors border-b border-border"
                onClick={() => toggleSection("locations")}
              >
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Locations ({locations.length})
                </CardTitle>
                {expandedSection === "locations" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              {expandedSection === "locations" && (
                <CardContent className="space-y-2 pt-4">
                  {locations.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-foreground">{loc.name}</div>
                        <p className="text-xs text-muted-foreground">{loc.code} • {loc.users} users</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{loc.status}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info(`Editing ${loc.name} permissions`)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Sub-Companies */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors border-b border-border"
                onClick={() => toggleSection("subcompanies")}
              >
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-500" /> Sub-Companies ({subCompanies.length})
                </CardTitle>
                {expandedSection === "subcompanies" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              {expandedSection === "subcompanies" && (
                <CardContent className="space-y-2 pt-4">
                  {subCompanies.map((sc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-foreground">{sc.name}</div>
                        <p className="text-xs text-muted-foreground">{sc.code} • {sc.locations} location(s)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", sc.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                          {sc.status}
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info(`Editing ${sc.name} permissions`)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.info("Location assignment dialog opening...")}>
                  <MapPin className="h-3.5 w-3.5" /> Assign User to Location
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.info("Sub-company transfer dialog opening...")}>
                  <Building2 className="h-3.5 w-3.5" /> Transfer to Sub-Company
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => toast.info("Permission audit report generated")}>
                  <Shield className="h-3.5 w-3.5" /> Generate Audit Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
