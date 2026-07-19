"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Construction, ArrowLeft } from "lucide-react"

export default function FixedAssetManagementPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <a href="fixed-assets" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
              <ArrowLeft className="h-3 w-3" /> Fixed Assets
            </a>
            <h2 className="text-3xl font-bold tracking-tight">Fixed asset management</h2>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
            <Construction className="h-3 w-3" /> Coming Soon
          </Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Module Under Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This module is currently being built. Check back soon for updates.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
