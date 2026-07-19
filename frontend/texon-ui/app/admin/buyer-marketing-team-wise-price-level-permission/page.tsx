"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, DollarSign, Users, Tag, Search,
  Plus, Edit, CheckCircle2, XCircle, MoreVertical,
  Filter, Eye, Lock, Unlock, BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const priceLevels = [
  { level: "Level 1 – Premium", code: "PL1", range: "$12.00 – $18.00", assignedTeams: ["Zara", "H&M Premium"], status: "Active", color: "bg-primary/10 text-primary border-primary/20" },
  { level: "Level 2 – Standard", code: "PL2", range: "$8.00 – $12.00", assignedTeams: ["H&M", "Levi's", "Uniqlo"], status: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { level: "Level 3 – Budget", code: "PL3", range: "$4.00 – $8.00", assignedTeams: ["Primark", "Decathlon"], status: "Active", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { level: "Level 4 – Outlet", code: "PL4", range: "$2.00 – $4.00", assignedTeams: [], status: "Inactive", color: "bg-red-50 text-red-700 border-red-200" },
]

const buyerTeams = [
  { name: "Zara (Inditex)", buyer: "Zara", team: "Premium Retail", level: "PL1", users: 3, spend: "$2.4M", status: "Active" },
  { name: "H&M Group", buyer: "H&M", team: "Fast Fashion", level: "PL2", users: 8, spend: "$4.8M", status: "Active" },
  { name: "Levi's", buyer: "Levi's", team: "Denim Specialist", level: "PL2", users: 4, spend: "$1.2M", status: "Active" },
  { name: "Uniqlo (Fast Retailing)", buyer: "Uniqlo", team: "Casual Wear", level: "PL2", users: 5, spend: "$3.1M", status: "Active" },
  { name: "Primark", buyer: "Primark", team: "Value Retail", level: "PL3", users: 6, spend: "$2.8M", status: "Active" },
  { name: "Decathlon", buyer: "Decathlon", team: "Sportswear", level: "PL3", users: 2, spend: "$0.9M", status: "Active" },
  { name: "Target", buyer: "Target", team: "Mass Market", level: "PL4", users: 3, spend: "$1.5M", status: "Inactive" },
]

const marketingTeams = [
  { name: "Premium Accounts", members: 4, buyers: ["Zara", "H&M Premium"], level: "PL1", status: "Active" },
  { name: "Volume Accounts", members: 8, buyers: ["H&M", "Uniqlo", "Levi's"], level: "PL2", status: "Active" },
  { name: "Value Accounts", members: 5, buyers: ["Primark", "Decathlon"], level: "PL3", status: "Active" },
  { name: "New Business", members: 3, buyers: ["Target"], level: "PL4", status: "Active" },
]

export default function BuyerMarketingTeamwisePriceLevelPermissionPage() {
  const [search, setSearch] = useState("")

  const filtered = buyerTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer.toLowerCase().includes(search.toLowerCase()) ||
      t.team.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">Buyer/Marketing Team Price Permissions</h2>
              <p className="text-muted-foreground mt-1 text-sm">Control price level visibility and editing rights by buyer and marketing team.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Permission matrix exported")}>
                <BarChart3 className="h-4 w-4" /> Export Matrix
              </Button>
              <Button size="sm" className="gap-2" onClick={() => toast.info("Add assignment dialog coming soon")}>
                <Plus className="h-4 w-4" /> Add Assignment
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price Levels</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{priceLevels.filter(p => p.status === "Active").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active price tiers</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Buyer Assignments</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{buyerTeams.filter(b => b.status === "Active").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active buyer accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Marketing Teams</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{marketingTeams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Team-wise assignments</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Users with Access</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{buyerTeams.reduce((sum, b) => sum + b.users, 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all teams</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Buyer Team Table */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle className="text-base font-semibold">Buyer & Team Assignments</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search buyers..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Filter dialog coming soon")}>
                    <Filter className="h-3.5 w-3.5" /> Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_1fr_0.8fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
                  <div>Buyer / Team</div>
                  <div>Marketing Team</div>
                  <div>Price Level</div>
                  <div>Users</div>
                  <div>Annual Spend</div>
                  <div>Status</div>
                </div>
                {filtered.map((b, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_1fr_0.8fr] items-center px-6 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div>
                      <div className="font-medium text-foreground text-xs">{b.name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.buyer}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{b.team}</div>
                    <div>
                      <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", priceLevels.find(p => p.code === b.level)?.color || "bg-muted text-muted-foreground border-border")}>
                        {b.level}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{b.users}</div>
                    <div className="text-xs font-medium text-foreground">{b.spend}</div>
                    <div>
                      <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", b.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Price Levels + Teams */}
          <div className="space-y-4">
            {/* Price Levels */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Price Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {priceLevels.map((p, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg space-y-2 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.level}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", p.color)}>
                        {p.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{p.range}</span>
                      <span className="text-muted-foreground">{p.assignedTeams.length} teams</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.assignedTeams.map((t, j) => (
                        <span key={j} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-1" onClick={() => toast.info(`Editing ${p.level}`)}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <span className={cn("text-[10px] font-semibold", p.status === "Active" ? "text-emerald-600" : "text-red-500")}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Marketing Teams */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" /> Marketing Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {marketingTeams.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.name}</div>
                      <p className="text-xs text-muted-foreground">{t.members} members • {t.buyers.length} buyers</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded border", priceLevels.find(p => p.code === t.level)?.color || "bg-muted text-muted-foreground border-border")}>
                        {t.level}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info(`Editing ${t.name}`)}>
                        <Edit className="h-3 w-3" />
                      </Button>
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
