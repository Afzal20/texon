"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, FileText, Search, Filter,
  Download, Plus, FolderArchive, Clock, AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const categories = [
  { name: "Commercial", count: 0, color: "bg-primary/10 text-primary" },
  { name: "Compliance", count: 0, color: "bg-emerald-50 text-emerald-700" },
  { name: "Quality", count: 0, color: "bg-amber-50 text-amber-700" },
  { name: "HR", count: 0, color: "bg-violet-50 text-violet-700" },
  { name: "Production", count: 0, color: "bg-blue-50 text-blue-700" },
  { name: "Procurement", count: 0, color: "bg-rose-50 text-rose-700" },
]

export default function DocumentArchivingPage() {
  const [search, setSearch] = useState("")

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Control Panel / Admin
              </a>
              <h2 className="text-3xl font-bold tracking-tight">Document Archiving</h2>
              <p className="text-muted-foreground mt-1 text-sm">Centralized document repository with retention policies and compliance tracking.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Documents exported")}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button size="sm" className="gap-2" onClick={() => toast.info("Upload dialog opening...")}>
                <Plus className="h-4 w-4" /> Archive Document
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground mt-1">No documents archived yet</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Storage Used</CardTitle>
              <FolderArchive className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">0</span>
                <span className="text-sm text-muted-foreground">MB</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Not tracked on the backend</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">0</div>
              <p className="text-xs text-muted-foreground mt-1">Retention period ending</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Cards */}
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <Card key={i} className="bg-white border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={cn("text-3xl font-bold", cat.color.split(" ")[1])}>{cat.count}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{cat.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Table */}
        <Card className="bg-white border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-base font-semibold">Archived Documents</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search documents..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.info("Filter dialog coming soon")}>
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr_0.8fr_0.8fr] text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 border-b border-border bg-muted/20">
              <div>Document Name</div>
              <div>Category</div>
              <div>Department</div>
              <div>Archived By</div>
              <div>Date</div>
              <div>Size</div>
              <div>Status</div>
            </div>
            <div className="px-6 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No archived documents found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Document archiving is not tracked on the backend yet — uploads will appear here once it is.
              </p>
            </div>
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              Showing 0 of 0 document(s)
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}