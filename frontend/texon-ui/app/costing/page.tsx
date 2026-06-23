"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, AlertTriangle, CheckCircle2, Clock, Sparkles, RefreshCw, TrendingUp } from "lucide-react"

const bomItems = [
  { desc: "Cotton Twill 280 GSM, Olive Drab (C-100%)", supplier: "Artistic Milliners", cons: "1.45 Yds", unitPrice: "$2.10", total: "$3.045", status: "Sourced", statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { desc: "Pocketing Fabric, TC 80/20, 110 GSM",        supplier: "Envoy Textiles",    cons: "0.30 Yds", unitPrice: "$0.85", total: "$0.255", status: "Sourced", statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { desc: "Fusible Interlining, 60 GSM",                supplier: "Coats PLC",         cons: "0.15 Yds", unitPrice: "$0.45", total: "$0.068", status: "Pending", statusColor: "bg-amber-100 text-amber-700 border-amber-200", alert: true },
]

const costBreakdown = [
  { label: "Fabric Total",         value: "$3.368" },
  { label: "Trims Total",          value: "$1.150" },
  { label: "CM (Cost of Making)",  value: "$1.850" },
  { label: "Wash/Embellishment",   value: "$0.850" },
  { label: "Logistics/Testing",    value: "$0.350" },
]

export default function Costing() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Costing & BOM: PO-84920</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Men's Cargo Pant (Style: HCP-24-A) | Created: Oct 12, 2023 |{" "}
              <span className="text-primary font-semibold">Status: In Review</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export BOM</Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <CheckCircle2 className="h-4 w-4" /> Approval Workflow
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Target Margin %</div>
              <div className="text-4xl font-bold text-foreground">18.5%</div>
              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" /> +0.5%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Cost / Unit (FOB)</div>
              <div className="text-4xl font-bold text-foreground">$8.42 <span className="text-sm font-normal text-muted-foreground">USD</span></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50/80 to-white/80 backdrop-blur-md border-indigo-100/50 shadow-sm hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="text-xs font-bold text-primary uppercase tracking-wider">AI Predict: Cost Accuracy</div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">High Confidence</span>
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">Potential Savings Identified</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fabric wastage reduction on marker 2 could save{" "}
                <span className="text-primary font-bold">$0.12/unit.</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* BOM Table */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Tabs */}
            <div className="flex border-b border-border px-4">
              {["Fabric", "Trims & Accessories", "Operations/Labor"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    i === 0
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] text-xs font-bold text-muted-foreground uppercase tracking-wide px-6 py-3 border-b border-border bg-muted/20">
                <div>Item Description</div>
                <div>Supplier</div>
                <div>Consumption</div>
                <div>Unit Price</div>
                <div>Total Cost</div>
                <div>Status</div>
              </div>
              {bomItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 border-b border-border hover:bg-muted/10 transition-colors text-sm">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    {item.alert && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                    {item.desc}
                  </div>
                  <div className="text-muted-foreground">{item.supplier}</div>
                  <div className="font-mono text-muted-foreground">{item.cons}</div>
                  <div className="font-mono">{item.unitPrice}</div>
                  <div className="font-mono font-semibold">{item.total}</div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded border ${item.statusColor}`}>{item.status}</span>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-muted/30 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Fabric Subtotal</span>
                <span className="text-sm font-bold text-foreground font-mono">$3.368 / unit</span>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <div className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Cost Summary Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {costBreakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between text-base font-bold text-foreground">
                    <span>Total Manufacturing Cost</span>
                    <span className="font-mono">$7.568</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span>Target FOB</span>
                    <span className="font-mono">$8.420</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-md border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Net Margin (Calculated)</div>
                    <div className="text-2xl font-bold text-primary mt-1">$0.852 <span className="text-sm">(10.12%)</span></div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: 10.12%</span>
                    <span>Target: 18.5%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "55%" }} />
                  </div>
                </div>
                <Button className="w-full mt-4 gap-2 bg-accent hover:bg-accent/80 text-primary border border-primary/20">
                  <RefreshCw className="h-4 w-4" /> Update Pricing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
