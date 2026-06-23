"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  PackageMinus, FileMinus, ClipboardCheck, TrendingUp, AlertTriangle, 
  Truck, Sparkles, Search, ChevronDown, Filter, MoreHorizontal, 
  Map, ChevronLeft, ChevronRight, TrendingDown, Box
} from "lucide-react"

export default function Inventory() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Control Center</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage fabrics, trims, and AI-predicted stock flow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <PackageMinus className="h-4 w-4" /> Receive Goods
            </Button>
            <Button variant="outline" className="gap-2">
              <FileMinus className="h-4 w-4" /> Record Issue
            </Button>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white">
              <ClipboardCheck className="h-4 w-4" /> Inventory Audit
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.4M</div>
              <p className="text-xs text-blue-600 font-medium flex items-center mt-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.2% vs last month
              </p>
            </CardContent>
          </Card>
          
          {/* Card 2 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Items Below Buffer</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">14</div>
              <p className="text-xs text-muted-foreground mt-2">3 critical shortages</p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Pending Receptions</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground/50" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-2">Expected today: 2</p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Insight: Deadstock Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2%</div>
              <p className="text-xs text-blue-600 font-medium mt-2 hover:underline cursor-pointer">
                Review suggested allocations →
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search SKU, Batch, or Item Name..." className="pl-9 bg-white" />
          </div>
          <div className="h-8 w-px bg-border mx-2 hidden md:block"></div>
          <Button variant="outline" className="gap-2 bg-white">
            All Categories <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" className="gap-2 bg-white">
            All Warehouses <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="flex-1"></div>
          <Button variant="ghost" className="gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" /> More Filters
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Tracking Table Area */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-lg font-semibold">Fabric Roll Tracking</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-6 py-3 border-b bg-muted/10 text-xs font-semibold text-muted-foreground">
                  <div>Item Name</div>
                  <div>Batch No.</div>
                  <div>Color</div>
                  <div className="text-right">Current Stock</div>
                  <div className="text-right">Allocated</div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {[
                    { name: "100% Cotton Jersey (160GSM)", batch: "BCH-8821-A", color: "Navy Blue", hex: "bg-slate-900", stock: "4,500 Yds", allocated: "3,200 Yds" },
                    { name: "Poly-Spandex Blend (180GSM)", batch: "BCH-8822-C", color: "Heather Grey", hex: "bg-gray-300", stock: "1,200 Kgs", allocated: "1,200 Kgs" },
                    { name: "Denim Twill 12oz", batch: "BCH-7740-D", color: "Indigo", hex: "bg-blue-800", stock: "350 Yds", allocated: "300 Yds", alert: true },
                    { name: "Organic Cotton Rib", batch: "BCH-8901-A", color: "Optic White", hex: "bg-slate-100 border", stock: "2,800 Yds", allocated: "1,500 Yds" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 border-b hover:bg-muted/5 transition-colors text-sm">
                      <div className="font-medium text-foreground">{row.name}</div>
                      <div className="font-mono text-muted-foreground text-xs">{row.batch}</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${row.hex}`}></div>
                        <span className="text-foreground/80">{row.color}</span>
                      </div>
                      <div className={`text-right font-mono font-medium ${row.alert ? 'text-red-600' : ''}`}>{row.stock}</div>
                      <div className="text-right font-mono text-muted-foreground">{row.allocated}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t mt-auto flex items-center justify-between text-sm text-muted-foreground bg-muted/5">
                <div>Showing 1-4 of 124 records</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side Cards */}
          <div className="space-y-6">
            {/* Quick Retrieval Locator */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center gap-2 border-b">
                <Map className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Quick Retrieval Locator</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative w-full aspect-[4/3] bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-gray-50 border rounded-md overflow-hidden flex items-center justify-center">
                  {/* Mock map elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] opacity-60"></div>
                  
                  {/* Aisles */}
                  <div className="absolute left-[30%] top-[20%] bg-white px-2 py-1 text-xs font-bold border shadow-sm rounded">A1</div>
                  <div className="absolute left-[60%] top-[20%] bg-white px-2 py-1 text-xs font-bold border shadow-sm rounded">A2</div>
                  
                  {/* Pulsating dot indicator */}
                  <div className="absolute left-[65%] top-[60%] w-6 h-6 bg-blue-500/30 rounded-full animate-ping flex items-center justify-center">
                  </div>
                  <div className="absolute left-[65%] top-[60%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] z-10 translate-x-1.5 translate-y-1.5"></div>
                </div>
              </CardContent>
            </Card>

            {/* AI Reorder Predictions */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center gap-2 border-b">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base font-semibold">AI Reorder Predictions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Based on PO #10294 (Summer Collection), stockouts predicted in 7 days.
                </p>
                
                <div className="bg-red-50 border border-red-100 rounded-md p-3 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500"></div>
                  <div className="flex items-start gap-3 pl-2">
                    <div className="mt-0.5 bg-red-100 p-1.5 rounded text-red-600">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1 text-red-900">Denim Twill 12oz</div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-red-800/70">Current: 350 Yds</span>
                        <span className="text-red-700 font-bold">Needed: 500 Yds</span>
                      </div>
                      <div className="h-1.5 w-full bg-red-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-50 p-1.5 rounded border border-blue-100 text-blue-600">
                      <Box className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">Zippers (Nylon 6")</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Lead Time: 14 Days</span>
                        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Reorder Now</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                  Generate PO Drafts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </AppLayout>
  )
}
