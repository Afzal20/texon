"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Download, Plus, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, 
  Filter, MoreVertical, Search, CheckSquare, X, Mail, Star, ExternalLink, Bot, ArrowRight
} from "lucide-react"

export default function OrderManagement() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time pipeline tracking and buyer intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="h-4 w-4" /> New Order
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Order Value (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$12.4M</div>
              <p className="text-xs text-blue-600 font-medium flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% vs last quarter
              </p>
            </CardContent>
          </Card>
          
          {/* Card 2 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Active Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-2">Across 12 regions</p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Avg Lead Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42 Days</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-2">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3 days efficiency gain
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="border-red-100 bg-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Samples Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
              <p className="text-xs text-red-600 font-medium flex items-center mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                5 approaching deadline
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          {/* Main Pipeline Table Area */}
          <Card className="lg:col-span-5 flex flex-col relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Active Pipeline</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" /> Save View
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search orders or styles..." className="pl-9 h-9 text-sm" />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-2">All Stages <ChevronDown className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">All Buyers <ChevronDown className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">Priority <Filter className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[40px_2fr_1fr_1fr_2fr] items-center px-6 py-3 border-y bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <div className="w-4 h-4 rounded border border-gray-300"></div>
                  <div>ORDER / BUYER</div>
                  <div>STYLE ID</div>
                  <div>QTY</div>
                  <div>STAGE</div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {[
                    { id: "PO-2024-8921", buyer: "H&M Group", style: "HM-A992", qty: "12,500", stage: "Production (75%)", progress: 75, color: "bg-blue-600" },
                    { id: "PO-2024-8845", buyer: "Zara (Inditex)", style: "ZR-FW24-11", qty: "8,000", stage: "Fabric Sourcing", progress: 30, color: "bg-red-500", alert: true },
                    { id: "PO-2024-9002", buyer: "Levi's", style: "LV-501-DNM", qty: "25,000", stage: "PO Received", progress: 10, color: "bg-gray-300" },
                    { id: "PO-2024-8711", buyer: "Uniqlo", style: "UQ-HEAT-TOP", qty: "45,000", stage: "Cutting (100%)", progress: 100, color: "bg-emerald-500" },
                  ].map((row, i) => (
                    <div key={i} className={`grid grid-cols-[40px_2fr_1fr_1fr_2fr] items-center px-6 py-4 border-b hover:bg-muted/10 transition-colors ${i === 1 || i === 2 ? 'bg-blue-50/30' : ''}`}>
                      <div className={`w-4 h-4 rounded border ${i === 1 || i === 2 ? 'border-blue-500 bg-blue-500 text-white flex items-center justify-center' : 'border-gray-300'}`}>
                        {(i === 1 || i === 2) && <CheckSquare className="h-3 w-3" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{row.id}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{row.buyer}</div>
                      </div>
                      <div className="text-sm font-mono">{row.style}</div>
                      <div className="text-sm font-medium">{row.qty}</div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold ${row.alert ? 'text-red-600' : 'text-foreground/80'}`}>
                            {row.stage}
                          </span>
                          {row.alert && <AlertTriangle className="h-3 w-3 text-red-600" />}
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar Overlay */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg shadow-lg flex items-center py-2 px-4 gap-4 animate-in slide-in-from-bottom-5">
                <div className="text-sm font-semibold text-blue-700 pr-4 border-r border-blue-200">
                  2 items<br/>selected
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-blue-100/50">
                    <TrendingUp className="h-4 w-4" /> Update Stage
                  </Button>
                  <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-blue-100/50">
                    <Download className="h-4 w-4" /> Export Selected
                  </Button>
                  <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-blue-100/50">
                    <Mail className="h-4 w-4" /> Send Notification
                  </Button>
                  <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-blue-100/50">
                    <AlertTriangle className="h-4 w-4" /> Mark Priority
                  </Button>
                </div>
                <div className="pl-2 border-l border-blue-200">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-blue-100/50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <div className="p-4 border-t text-center">
              <Button variant="link" className="text-blue-600 font-semibold gap-1 text-sm">
                View All Orders <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Right Side Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Risk Forecast */}
            <Card className="border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Risk Forecast
                </CardTitle>
                <CardDescription className="text-sm mt-2 text-foreground/80 leading-relaxed">
                  Analysis of current production line efficiency vs delivery schedules indicates a potential bottleneck.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-red-700 text-sm">Zara PO-2024-8845</span>
                    <span className="text-[10px] uppercase font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">High Risk</span>
                  </div>
                  <p className="text-xs text-red-800/80 leading-relaxed">
                    Fabric sourcing delay (Denim 12oz) overlaps with Line 4 scheduled maintenance. Predicted 4-day shipment delay.
                  </p>
                </div>
                <Button className="w-full bg-[#5c4bdf] hover:bg-[#4b3cbf] text-white">
                  View Mitigation Options <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Top Buyer Portfolio */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Top Buyer Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {[
                    { initials: "HM", name: "H&M Group", orders: "3 Active Orders", units: "142k Units", score: "4.9", trend: "up" },
                    { initials: "ZA", name: "Zara", orders: "2 Active Orders", units: "85k Units", score: "4.2", trend: "neutral" },
                    { initials: "LV", name: "Levi's", orders: "1 Active Order", units: "25k Units", score: "4.8", trend: "up" },
                  ].map((buyer, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-700 border">
                          {buyer.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{buyer.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{buyer.orders}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium">{buyer.units}</div>
                        <div className={`text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 ${buyer.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          <Star className="h-3 w-3 fill-current" />
                          {buyer.score} Rel.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kanban Board Area */}
        <Card className="bg-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-white rounded-t-xl">
            <CardTitle className="text-lg font-semibold">Sampling & Development Queue</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 font-semibold gap-2">
              Filter <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proto / 1st Fit</h4>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                </div>
                
                <Card className="border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                  <CardContent className="p-4">
                    <div className="font-mono text-xs font-semibold mb-2">HM-A992-PRT</div>
                    <div className="text-sm font-medium mb-1 text-foreground">Basic Crew Tee</div>
                    <div className="text-xs text-muted-foreground">Due: Tomorrow</div>
                  </CardContent>
                </Card>
                
                <Card className="border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
                  <CardContent className="p-4 bg-emerald-50/30">
                    <div className="font-mono text-xs font-semibold mb-2 text-muted-foreground">LV-501-PRT</div>
                    <div className="text-sm font-medium mb-1 text-foreground">Denim Jacket</div>
                    <div className="text-xs text-emerald-600 font-medium">Approved 09/20</div>
                  </CardContent>
                </Card>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PP / Size Set</h4>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">2</span>
                </div>
                
                <Card className="border-red-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500"></div>
                  <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 rounded-full bg-red-500"></div></div>
                  <CardContent className="p-4 bg-red-50/30 pl-5">
                    <div className="font-mono text-xs font-semibold mb-2 text-muted-foreground">ZR-FW24-PP</div>
                    <div className="text-sm font-medium mb-1 text-foreground">Wool Blend Coat</div>
                    <div className="text-xs text-red-600 font-medium">Rejected: Measurement Spec</div>
                  </CardContent>
                </Card>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top / Shipping</h4>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">1</span>
                </div>
                
                <Card className="border shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                  <CardContent className="p-4">
                    <div className="font-mono text-xs font-semibold mb-2 text-muted-foreground">UQ-HEAT-TOP</div>
                    <div className="text-sm font-medium mb-1 text-foreground">HeatTech Base Layer</div>
                    <div className="text-xs text-muted-foreground">Sent to buyer, pending OK</div>
                  </CardContent>
                </Card>
              </div>
              
            </div>
          </CardContent>
        </Card>
        
      </div>
    </AppLayout>
  )
}
