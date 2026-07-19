"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Construction } from "lucide-react"

const pages = [
  { title: "Group-company & multi-company", slug: "group-company-multi-company" },
  { title: "Multi-currency support", slug: "multi-currency-support" },
  { title: "Location-based operations", slug: "location-based-operations" },
  { title: "Inter-modules integrated system", slug: "inter-modules-integrated-system" }
]

export default function MultiCompanyMultiLocationIndexPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Multi-Company / Multi-Location</h2>
            <p className="text-muted-foreground mt-1 text-sm">4 modules</p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
            <Construction className="h-3 w-3" /> Under Development
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a key="group-company-multi-company" href="multi-company/group-company-multi-company">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Group-company & multi-company
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="multi-currency-support" href="multi-company/multi-currency-support">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Multi-currency support
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="location-based-operations" href="multi-company/location-based-operations">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Location-based operations
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="inter-modules-integrated-system" href="multi-company/inter-modules-integrated-system">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Inter-modules integrated system
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
