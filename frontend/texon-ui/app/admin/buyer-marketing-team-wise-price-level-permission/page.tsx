"use client"

import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Users, Search,
  Plus, Edit, Filter, BarChart3, Tag, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { restList, type RestRow } from "@/lib/api/rest"

interface BuyerRow {
  name: string
  code: string
  team: string
  level: string
  users: string
  country: string
  status: string
}

export default function BuyerMarketingTeamwisePriceLevelPermissionPage() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    restList("buyers", "Buyer")
      .then((res) => {
        setBuyers(
          (res.data ?? []).map((b: RestRow) => ({
            name: String(b.name ?? "—"),
            code: String(b.code ?? ""),
            team: String(b.contact_person ?? "") || "—",
            level: "—",
            users: "—",
            country: String(b.country ?? "") || "—",
            status: b.is_active ? "Active" : "Inactive",
          })),
        )
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = buyers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.team.toLowerCase().includes(search.toLowerCase()),
  )

  const activeCount = buyers.filter((b) => b.status === "Active").length
  const inactiveCount = buyers.filter((b) => b.status === "Inactive").length
  const countries = new Set(buyers.map((b) => b.country).filter((c) => c && c !== "—")).size

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
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Buyers</CardTitle>
              <Tag className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : activeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Active buyer accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inactive Buyers</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : inactiveCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Inactive accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Buyers</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : buyers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered buyers</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Countries</CardTitle>
              <Globe className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{loading ? "—" : countries}</div>
              <p className="text-xs text-muted-foreground mt-1">Buyer countries</p>
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
                  <div>Contact</div>
                  <div>Code</div>
                  <div>Country</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {loading && <div className="px-6 py-8 text-xs text-muted-foreground text-center">Loading buyers…</div>}
                {!loading && filtered.length === 0 && <div className="px-6 py-8 text-xs text-muted-foreground text-center">No buyers found.</div>}
                {filtered.map((b, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_1fr_0.8fr] items-center px-6 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                    <div>
                      <div className="font-medium text-foreground text-xs">{b.name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.code}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{b.team}</div>
                    <div className="text-xs text-muted-foreground">{b.code}</div>
                    <div className="text-xs text-muted-foreground font-mono">{b.country}</div>
                    <div>
                      <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", b.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>
                        {b.status}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-1" onClick={() => toast.info(`Editing ${b.name} price permissions`)}>
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
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
              <CardContent className="pt-4">
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Price level configuration is not tracked on the backend yet.
                </div>
              </CardContent>
            </Card>

            {/* Marketing Teams */}
            <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" /> Marketing Teams
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Marketing team assignments are not tracked on the backend yet.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}