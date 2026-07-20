"use client"

import * as React from "react"
import { RawItemsViewer } from "@/components/data/RawDataViewer"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, FileText, TrendingUp, TrendingDown, Clock, Download, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getFixedAssets } from "@/lib/api/fixed-assets"

type FixedAsset = {
  id: number
  name?: string
  asset_tag?: string
  category?: string
  purchase_date?: string
  purchase_cost?: string | number
  current_value?: string | number
  location?: string
  status?: string
}

const defaultAssets: FixedAsset[] = [
  { id: 1, name: "Sewing Machine Juki 5550", asset_tag: "FA-001", category: "Machinery", purchase_date: "2023-01-15", purchase_cost: "4500", current_value: "3600", location: "Unit A", status: "In use" },
  { id: 2, name: "Cutting Table C-12", asset_tag: "FA-002", category: "Equipment", purchase_date: "2023-03-20", purchase_cost: "2800", current_value: "2100", location: "Cutting Room", status: "In use" },
  { id: 3, name: "Industrial Boiler", asset_tag: "FA-003", category: "Utility", purchase_date: "2022-11-01", purchase_cost: "12500", current_value: "8500", location: "Utility Room", status: "Maintenance" },
  { id: 4, name: "Forklift Toyota", asset_tag: "FA-004", category: "Vehicle", purchase_date: "2023-06-10", purchase_cost: "22000", current_value: "18500", location: "Warehouse", status: "In use" },
  { id: 5, name: "Air Compressor", asset_tag: "FA-005", category: "Utility", purchase_date: "2022-08-05", purchase_cost: "6800", current_value: "4200", location: "Unit B", status: "In use" },
  { id: 6, name: "Generator 500kVA", asset_tag: "FA-006", category: "Utility", purchase_date: "2021-12-20", purchase_cost: "35000", current_value: "18000", location: "Power Room", status: "In use" },
]

const statusStyles: Record<string, string> = {
  "In use": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Maintenance": "bg-amber-50 text-amber-700 border-amber-200",
  "Retired": "bg-slate-50 text-slate-700 border-slate-200",
  "Disposed": "bg-red-50 text-red-700 border-red-200",
}

export default function FixedAssetManagementPage() {
  const [assets, setAssets] = React.useState<FixedAsset[]>([])
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    getFixedAssets().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      if (items.length > 0) setAssets(items)
      else setAssets(defaultAssets)
    }).catch(() => setAssets(defaultAssets))
  }, [])

  const totalValue = assets.reduce((s, a) => s + Number(a.current_value ?? a.purchase_cost ?? 0), 0)
  const totalCost = assets.reduce((s, a) => s + Number(a.purchase_cost ?? 0), 0)
  const inUse = assets.filter(a => a.status === "In use").length
  const maintenance = assets.filter(a => a.status === "Maintenance").length

  const filtered = assets.filter(a =>
    !search || [a.name, a.asset_tag, a.category, a.location, a.status]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <a href="/fixed-assets" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3 w-3" /> Fixed Assets
            </a>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Fixed Asset Management</h2>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Active</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Track and manage all fixed assets across locations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Asset register exported")}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" className="gap-2" onClick={() => toast.info("Add asset dialog opening...")}>
              <Plus className="h-4 w-4" /> Add Asset
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Assets</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{assets.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered fixed assets</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Current depreciated value</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In Use</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{inUse}</div>
              <p className="text-xs text-muted-foreground mt-1">Active assets</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Under Maintenance</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{maintenance}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled maintenance</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base font-semibold">Asset Register</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
              <div>Asset / Tag</div>
              <div>Category</div>
              <div>Location</div>
              <div>Purchase Date</div>
              <div>Cost</div>
              <div>Current Value</div>
              <div>Status</div>
            </div>
            {filtered.map((a) => (
              <div key={a.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div>
                  <div className="font-medium text-foreground text-xs">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{a.asset_tag}</div>
                </div>
                <div className="text-xs text-muted-foreground">{a.category}</div>
                <div className="text-xs text-muted-foreground">{a.location}</div>
                <div className="text-xs text-muted-foreground">{a.purchase_date}</div>
                <div className="text-xs font-mono font-medium">${Number(a.purchase_cost ?? 0).toLocaleString()}</div>
                <div className="text-xs font-mono font-medium">${Number(a.current_value ?? 0).toLocaleString()}</div>
                <div>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", statusStyles[a.status ?? ""] || "bg-muted text-muted-foreground")}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              Showing {filtered.length} of {assets.length} asset(s)
            </div>
          </CardContent>
        </Card>
      </div>
      <RawItemsViewer items={rawItems} />
    </AppLayout>
  )
}
