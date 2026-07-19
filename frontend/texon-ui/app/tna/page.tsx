"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Construction } from "lucide-react"

const pages = [
  { title: "Task/job/order management & monitoring", slug: "task-job-order-management-monitoring" },
  { title: "Task scheduling (front/back calculation)", slug: "task-scheduling-front-back-calculation" },
  { title: "SMS, email, auto-alarm notification", slug: "sms-email-auto-alarm-notification" },
  { title: "Export/import data in CSV/Excel", slug: "export-import-data-in-csv-excel" },
  { title: "Graphic view of task/job/order status", slug: "graphic-view-of-task-job-order-status" },
  { title: "Critical path analysis", slug: "critical-path-analysis" },
  { title: "Task splitting at any level", slug: "task-splitting-at-any-level" },
  { title: "Task dependency specification", slug: "task-dependency-specification" }
]

export default function TnATimeActionIndexPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">TnA (Time & Action)</h2>
            <p className="text-muted-foreground mt-1 text-sm">8 modules</p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">
            <Construction className="h-3 w-3" /> Under Development
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a key="task-job-order-management-monitoring" href="tna/task-job-order-management-monitoring">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Task/job/order management & monitoring
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="task-scheduling-front-back-calculation" href="tna/task-scheduling-front-back-calculation">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Task scheduling (front/back calculation)
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="sms-email-auto-alarm-notification" href="tna/sms-email-auto-alarm-notification">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  SMS, email, auto-alarm notification
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="export-import-data-in-csv-excel" href="tna/export-import-data-in-csv-excel">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Export/import data in CSV/Excel
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="graphic-view-of-task-job-order-status" href="tna/graphic-view-of-task-job-order-status">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Graphic view of task/job/order status
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="critical-path-analysis" href="tna/critical-path-analysis">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Critical path analysis
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="task-splitting-at-any-level" href="tna/task-splitting-at-any-level">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Task splitting at any level
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="task-dependency-specification" href="tna/task-dependency-specification">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Task dependency specification
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
