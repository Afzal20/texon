"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, BrainCircuit, TrendingUp, AlertTriangle, Activity, Zap } from "lucide-react"
import { toast } from "sonner"
import { getAiConversations } from "@/lib/api/ai"

export default function AiInsights() {
  const [conversations, setConversations] = React.useState<any[]>([])

  React.useEffect(() => {
    getAiConversations().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setConversations(items)
    }).catch(() => {})
  }, [])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">AI Insights & Optimization</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Machine learning analysis and predictive recommendations across all operations.
              </p>
            </div>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs whitespace-nowrap self-start mt-2">
              Sample data — connect backend for live AI insights
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-accent" onClick={() => toast.info("Deep analysis running...")}>
              <Activity className="h-4 w-4" /> Run Deep Analysis
            </Button>
          </div>
        </div>

        {/* High Priority Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          <Card className="bg-white border-red-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-500" />
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-2 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Critical Bottleneck Predicted</h3>
                    <p className="text-xs text-red-700/80 mt-0.5">Sewing Line 04 • High Confidence (94%)</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wide bg-red-100 text-red-700 px-2 py-1 rounded">Immediate Action</span>
              </div>
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                Analysis of current production line efficiency vs delivery schedules indicates a potential bottleneck. Fabric sourcing delay (Denim 12oz) overlaps with scheduled maintenance. Predicted <span className="font-bold text-red-600">4-day shipment delay</span> for PO-2024-8845.
              </p>
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Mitigation</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Re-route cutting batch #45A to Line 02</span>
                  <Button size="sm" onClick={() => toast.success("Mitigation executed")} className="bg-primary hover:bg-primary/90 text-white h-7 text-xs px-4">Execute</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-500" />
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Optimization Opportunity</h3>
                    <p className="text-xs text-blue-700/80 mt-0.5">Energy Usage • Medium Confidence (78%)</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wide bg-blue-100 text-blue-700 px-2 py-1 rounded">Opportunity</span>
              </div>
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                Historical data analysis shows peak energy consumption occurs between 14:00 and 16:00. Rescheduling high-draw processes (like continuous tumbling) to off-peak hours could reduce energy costs.
              </p>
              <div className="bg-muted/30 border border-border rounded-lg p-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Recommended Mitigation</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Adjust Finishing Schedule (-$450/week)</span>
                  <Button size="sm" onClick={() => toast.info("Schedule review coming soon")} className="bg-primary hover:bg-primary/90 text-white h-7 text-xs px-4">Review Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Insight Categories */}
        <h3 className="text-xl font-bold tracking-tight pt-4">Categorized Insights</h3>
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Production */}
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" /> Production Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Line 01 Outperforming</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Line 01 is operating at 106% of target. Supervisor R. Ahmed has optimized the sleeve attachment process. Document and share with Line 02.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Defect Rate Anomaly</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sudden 2.4% spike in &quot;Uneven Stitching&quot; defects on Machine #442. Recommend immediate maintenance check.
                </p>
              </div>
              <Button variant="link" onClick={() => toast.info("Full insights coming soon")} className="px-0 h-auto text-primary font-semibold text-xs">View all Production Insights →</Button>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-600" /> Inventory & Supply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Deadstock Risk</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  4,500 Yds of Navy Blue Jersey (BCH-8821-A) has been idle for 45 days. Consider offering discount to Buyer X for upcoming summer program.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Lead Time Prediction</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Supplier &quot;Trims Co&quot; is trending 3 days late on average for metal zippers. Adjust buffer stock for Q3 orders.
                </p>
              </div>
              <Button variant="link" onClick={() => toast.info("Full insights coming soon")} className="px-0 h-auto text-primary font-semibold text-xs">View all Inventory Insights →</Button>
            </CardContent>
          </Card>

          {/* Costing */}
          <Card className="bg-white border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Marker Efficiency</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Retraining the cutting marker for PO-84920 with Model v3.2 can yield an additional 2.1% fabric saving.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Overtime Cost Alert</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Current scheduling trajectory suggests a 15% overrun in overtime budget for Unit 04 this month.
                </p>
              </div>
              <Button variant="link" onClick={() => toast.info("Full insights coming soon")} className="px-0 h-auto text-primary font-semibold text-xs">View all Cost Insights →</Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </AppLayout>
  )
}
