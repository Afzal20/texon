"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, FolderArchive, Search, Plus, Download,
  FileText, CheckCircle2, Clock, AlertTriangle,
  Archive, Eye, Trash2, MoreVertical, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const documents = [
  { name: "PO-2024-8921_Commercial_Invoice.pdf", category: "Commercial", department: "Commercial", archivedBy: "Nusrat Jahan", date: "Jul 15, 2026", size: "2.4 MB", status: "Archived", retention: "7 years" },
  { name: "BSCI_Audit_Report_2024.pdf", category: "Compliance", department: "Quality Control", archivedBy: "Salma Begum", date: "Jul 12, 2026", size: "5.1 MB", status: "Archived", retention: "10 years" },
  { name: "Fabric_Test_Certificate_BCH-8821-A.pdf", category: "Quality", department: "Quality Control", archivedBy: "Abdul Karim", date: "Jul 10, 2026", size: "1.8 MB", status: "Archived", retention: "5 years" },
  { name: "Monthly_Payroll_Jul-2026.xlsx", category: "HR", department: "HR & Payroll", archivedBy: "Fatema Begum", date: "Jul 8, 2026", size: "340 KB", status: "Archived", retention: "10 years" },
  { name: "Production_Report_Line04_Jul15.pdf", category: "Production", department: "Production", archivedBy: "Rafiqul Islam", date: "Jul 15, 2026", size: "890 KB", status: "Pending Review", retention: "3 years" },
  { name: "Supplier_Agreement_TextileCo.pdf", category: "Procurement", department: "Procurement", archivedBy: "Kamal Hossain", date: "Jul 5, 2026", size: "1.2 MB", status: "Archived", retention: "10 years" },
  { name: "Fire_Safety_Certificate_UnitB.pdf", category: "Compliance", department: "Compliance", archivedBy: "Anisur Rahman", date: "Jun 28, 2026", size: "3.4 MB", status: "Archived", retention: "5 years" },
  { name: "Buyer_PO_Zara_FW24.xlsx", category: "Commercial", department: "Merchandising", archivedBy: "Nusrat Jahan", date: "Jun 20, 2026", size: "420 KB", status: "Archived", retention: "7 years" },
]

const categories = [
  { name: "Commercial", count: 24, color: "bg-primary/10 text-primary" },
  { name: "Compliance", count: 18, color: "bg-emerald-50 text-emerald-700" },
  { name: "Quality", count: 31, color: "bg-amber-50 text-amber-700" },
  { name: "HR", count: 15, color: "bg-violet-50 text-violet-700" },
  { name: "Production", count: 42, color: "bg-blue-50 text-blue-700" },
  { name: "Procurement", count: 12, color: "bg-rose-50 text-rose-700" },
]

export default function DocumentArchivingPage() {
  const [search, setSearch] = useState("")

  const filtered = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
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
              <div className="text-3xl font-bold text-foreground">142</div>
              <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Storage Used</CardTitle>
              <FolderArchive className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground">847</span>
                <span className="text-sm text-muted-foreground">MB</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "42%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">42% of 2 GB quota</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">3</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">2</div>
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
            {filtered.map((d, i) => (
              <div key={i} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.8fr_0.8fr_0.8fr] items-center px-6 py-3 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground text-xs truncate">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{d.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{d.category}</div>
                <div className="text-xs text-muted-foreground">{d.department}</div>
                <div className="text-xs text-muted-foreground">{d.archivedBy}</div>
                <div className="text-xs text-muted-foreground">{d.date}</div>
                <div className="text-xs text-muted-foreground font-mono">{d.size}</div>
                <div>
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded border", d.status === "Archived" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              Showing {filtered.length} of {documents.length} document(s)
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
