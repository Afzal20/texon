"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Plus, Users, UserCheck, CalendarClock, CreditCard, TrendingUp } from "lucide-react"

export default function HR() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Factory Overview</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real-time metrics for Unit 04 operations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export Report</Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4" /> New Employee
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-border shadow-sm relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Workforce</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">2,450</div>
              <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" /> +12 vs last month
              </p>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-muted/40 rounded-tl-full" />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attendance (Live)</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">94.2%</div>
              <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "94.2%" }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Leave</CardTitle>
              <CalendarClock className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">38</div>
              <p className="text-xs text-muted-foreground mt-2">Requires immediate review</p>
              <button className="text-xs text-primary font-semibold mt-1 hover:underline">View</button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payroll Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Processing</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-xs text-muted-foreground">Step 2 of 4: Verification</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HR Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Directory",
              desc: "Manage employee records, roles, and department assignments.",
              icon: Users,
              stats: [{ label: "Total Employees", val: "2,450" }, { label: "Departments", val: "14" }],
              action: "View Directory",
            },
            {
              title: "Attendance",
              desc: "Live tracking of attendance, late arrivals, and absenteeism.",
              icon: UserCheck,
              stats: [{ label: "Present Today", val: "2,309" }, { label: "Absent", val: "141" }],
              action: "View Attendance",
            },
            {
              title: "Payroll",
              desc: "Process salaries, overtime, deductions, and bonuses.",
              icon: CreditCard,
              stats: [{ label: "This Month", val: "$182,400" }, { label: "Pending", val: "Processing" }],
              action: "Run Payroll",
              highlight: true,
            },
            {
              title: "Leave Management",
              desc: "Approve or reject leave requests and track leave balances.",
              icon: CalendarClock,
              stats: [{ label: "Pending Requests", val: "38" }, { label: "Approved This Month", val: "74" }],
              action: "Review Leaves",
              alert: true,
            },
            {
              title: "Recruitment",
              desc: "Track open positions, applications, and onboarding status.",
              icon: Plus,
              stats: [{ label: "Open Positions", val: "12" }, { label: "Interviews Scheduled", val: "7" }],
              action: "View Positions",
            },
            {
              title: "Training & Development",
              desc: "Skill development programs and training completion tracking.",
              icon: TrendingUp,
              stats: [{ label: "Active Programs", val: "5" }, { label: "Completion Rate", val: "78%" }],
              action: "View Programs",
            },
          ].map((mod) => (
            <Card key={mod.title} className={`bg-white border-border shadow-sm hover:shadow-md transition-shadow ${mod.highlight ? "border-primary/30" : ""} ${mod.alert ? "border-red-200" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${mod.highlight ? "bg-primary/10" : mod.alert ? "bg-red-50" : "bg-muted"}`}>
                    <mod.icon className={`h-4 w-4 ${mod.highlight ? "text-primary" : mod.alert ? "text-red-600" : "text-muted-foreground"}`} />
                  </div>
                  {mod.alert && <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Action Needed</span>}
                </div>
                <CardTitle className="text-sm font-bold mt-2">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mod.desc}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {mod.stats.map((s) => (
                    <div key={s.label} className="bg-muted/40 rounded-md px-3 py-2">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{s.val}</div>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className={`w-full text-xs h-8 ${mod.highlight ? "bg-primary hover:bg-primary/90 text-white" : "bg-muted hover:bg-muted/80 text-foreground"}`}
                >
                  {mod.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </AppLayout>
  )
}
