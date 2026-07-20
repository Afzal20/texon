"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download, Plus, TrendingUp, TrendingDown, AlertTriangle, ChevronDown,
  Filter, MoreVertical, Search, CheckSquare, X, Mail, Bot, ArrowRight, Star
} from "lucide-react"
import { toast } from "sonner"
import { getPurchaseOrders, getBuyerPortfolios } from "@/lib/data/order-actions"
import type { PurchaseOrder, BuyerPortfolio } from "@/lib/data/orders"

const STAGES = [
  { label: "Production", color: "bg-blue-600" },
  { label: "Fabric Sourcing", color: "bg-red-500" },
  { label: "PO Received", color: "bg-gray-300" },
  { label: "Cutting", color: "bg-emerald-500" },
]

export default function OrderManagement() {
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([])
  const [portfolios, setPortfolios] = React.useState<BuyerPortfolio[]>([])
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    getPurchaseOrders().then(setOrders).catch(() => {})
    getBuyerPortfolios().then(setPortfolios).catch(() => {})
  }, [])

  const filteredOrders = search
    ? orders.filter(o =>
        o.po_number.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer_name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const totalValue = orders.reduce((sum, o) => sum + (parseFloat(o.total_value) || 0), 0)
  const activeBuyers = new Set(orders.map(o => o.buyer_name)).size
  const pendingSamples = orders.filter(o => o.status === "pending").length

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Real-time pipeline tracking and buyer intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => toast.success("Orders exported to CSV")}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white" onClick={() => toast.info("New order form coming soon")}>
              <Plus className="h-4 w-4" /> New Order
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Order Value (YTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(totalValue / 1_000_000).toFixed(1)}M</div>
              <p className="text-xs text-blue-600 font-medium flex items-center mt-3">
                <TrendingUp className="h-3 w-3 mr-1" />
                {orders.length} active orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Active Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeBuyers}</div>
              <p className="text-xs text-muted-foreground mt-3">{portfolios.length} with portfolio data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.reduce((s, o) => s + (o.quantity || 0), 0).toLocaleString()}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center mt-3">
                <TrendingDown className="h-3 w-3 mr-1" />
                across all orders
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-100 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.filter(o => o.status === "pending" || o.status === "draft").length}</div>
              <p className="text-xs text-red-600 font-medium flex items-center mt-3">
                <AlertTriangle className="h-3 w-3 mr-1" />
                awaiting processing
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-5 flex flex-col relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Active Pipeline</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.success("View saved")}>
                    <Download className="h-3.5 w-3.5" /> Save View
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toast.info("Menu coming soon")}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search orders or styles..."
                    className="pl-9 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-2">All Stages <ChevronDown className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">All Buyers <ChevronDown className="h-3.5 w-3.5" /></Button>
                <Button variant="outline" size="sm" className="h-9 gap-2">Priority <Filter className="h-3.5 w-3.5" /></Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="w-full">
                <div className="grid grid-cols-[40px_2fr_1fr_1fr_2fr] items-center px-6 py-3 border-y bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <div></div>
                  <div>PO NUMBER / BUYER</div>
                  <div>STYLE</div>
                  <div>QTY</div>
                  <div>STATUS</div>
                </div>

                <div className="flex flex-col">
                  {filteredOrders.length === 0 && (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                      {search ? "No orders match your search." : "No orders loaded yet."}
                    </div>
                  )}
                  {filteredOrders.slice(0, 10).map((order, i) => {
                    const stageIdx = i % STAGES.length
                    const stage = STAGES[stageIdx]
                    return (
                      <div key={order.id} className="grid grid-cols-[40px_2fr_1fr_1fr_2fr] items-center px-6 py-4 border-b hover:bg-muted/10 transition-colors">
                        <div className="w-4 h-4 rounded border border-gray-300" />
                        <div>
                          <div className="font-medium text-sm text-foreground">{order.po_number}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{order.buyer_name}</div>
                        </div>
                        <div className="text-sm font-mono">{order.style_name}</div>
                        <div className="text-sm font-medium">{order.quantity?.toLocaleString()}</div>
                        <div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === "in_progress" ? "bg-blue-100 text-blue-700" : order.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>

            {filteredOrders.length > 10 && (
              <div className="p-4 border-t text-center">
                <Button variant="link" className="text-blue-600 font-semibold gap-1 text-sm" onClick={() => toast.info("Full orders list coming soon")}>
                  View All Orders ({filteredOrders.length}) <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-blue-100 bg-gradient-to-b from-blue-50 to-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Risk Forecast
                </CardTitle>
                <CardDescription className="text-sm mt-2 text-foreground/80 leading-relaxed">
                  {orders.length > 0
                    ? `Analysis of ${orders.length} active orders against production capacity.`
                    : "Loading order data for AI analysis..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.filter(o => o.status === "in_progress").length > 0 ? (
                  <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-red-700 text-sm">Risk Alert</span>
                      <span className="text-[10px] uppercase font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">Monitor</span>
                    </div>
                    <p className="text-xs text-red-800/80 leading-relaxed">
                      {orders.filter(o => o.status === "in_progress").length} orders in progress. Check delivery schedules against production capacity.
                    </p>
                  </div>
                ) : null}
                <Button className="w-full bg-[#5c4bdf] hover:bg-[#4b3cbf] text-white" onClick={() => toast.info("AI mitigation analysis coming soon")}>
                  View Mitigation Options <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Buyer Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {portfolios.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">No portfolio data loaded.</div>
                  )}
                  {portfolios.slice(0, 5).map((bp, i) => (
                    <div key={bp.buyer_id ?? i} className="flex items-center justify-between p-4 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-700 border">
                          {bp.buyer_name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{bp.buyer_name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{bp.active_orders} Active Orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-medium">{(bp.total_units ?? 0).toLocaleString()} units</div>
                        <div className="text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 text-emerald-600">
                          <Star className="h-3 w-3 fill-current" />
                          ${((bp.total_value ?? 0) / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
