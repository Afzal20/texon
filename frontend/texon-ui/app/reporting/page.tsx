"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Construction } from "lucide-react"

const pages = [
  { title: "MIS reporting", slug: "mis-reporting" },
  { title: "Management dashboards", slug: "management-dashboards" },
  { title: "All reports export to Excel & PDF", slug: "all-reports-export-to-excel-pdf" },
  { title: "Order-wise profitability", slug: "order-wise-profitability" },
  { title: "Style-wise profitability", slug: "style-wise-profitability" },
  { title: "Production efficiency reports", slug: "production-efficiency-reports" }
]

export default function ReportingExportIndexPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reporting & Export</h2>
            <p className="text-muted-foreground mt-1 text-sm">6 modules</p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
            <Construction className="h-3 w-3" /> Under Development
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a key="mis-reporting" href="reporting/mis-reporting">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  MIS reporting
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="management-dashboards" href="reporting/management-dashboards">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Management dashboards
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="all-reports-export-to-excel-pdf" href="reporting/all-reports-export-to-excel-pdf">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  All reports export to Excel & PDF
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="order-wise-profitability" href="reporting/order-wise-profitability">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Order-wise profitability
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="style-wise-profitability" href="reporting/style-wise-profitability">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Style-wise profitability
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="production-efficiency-reports" href="reporting/production-efficiency-reports">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Production efficiency reports
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
