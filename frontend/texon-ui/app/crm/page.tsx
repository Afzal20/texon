"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

const pages = [
  { title: "Buyer profile", slug: "buyer-profile" },
  { title: "Buyer communication records", slug: "buyer-communication-records" },
  { title: "Order amendment history", slug: "order-amendment-history" },
  { title: "Buyer-wise profitability", slug: "buyer-wise-profitability" }
]

export default function CRMIndexPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">CRM</h2>
            <p className="text-muted-foreground mt-1 text-sm">4 modules</p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
            Live — API Connected
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a key="buyer-profile" href="crm/buyer-profile">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Buyer profile
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="buyer-communication-records" href="crm/buyer-communication-records">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Buyer communication records
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="order-amendment-history" href="crm/order-amendment-history">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Order amendment history
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="buyer-wise-profitability" href="crm/buyer-wise-profitability">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Buyer-wise profitability
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
