"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Banknote, Building2, CalendarClock, ChartNoAxesCombined, CircleDollarSign, FileBarChart2, Landmark, ReceiptText, TrendingUp, WalletCards } from "lucide-react"
import { toast } from "sonner"
import { getAccountsSummary } from "@/lib/api/commercial"

interface AccountsSummary {
  cash_available: string
  cash_trend: string
  receivables_due: string
  receivables_count: number
  payables_scheduled: string
  payables_note: string
  portfolio_contribution: string
  portfolio_margin: string
}

const modules = [
  { title: "Accounts Payable", description: "Supplier obligations, approvals, and payment runs.", href: "/accounts-finance/accounts-payable", icon: ReceiptText, metric: "open" },
  { title: "Accounts Receivable", description: "Buyer invoices, collections, and aging exposure.", href: "/accounts-finance/accounts-receivable", icon: CircleDollarSign, metric: "open" },
  { title: "Supplier Bills", description: "Bill validation with PO and GRN matching.", href: "/accounts-finance/supplier-bills", icon: FileBarChart2, metric: "in review" },
  { title: "Buyer Payments", description: "Inbound receipts, advances, and allocation.", href: "/accounts-finance/buyer-payments", icon: Banknote, metric: "received" },
  { title: "Cost Center Tracking", description: "Budget utilization and departmental spend.", href: "/accounts-finance/cost-center-tracking", icon: Building2, metric: "utilized" },
  { title: "Order-wise Profit & Loss", description: "Actual margin insight across active orders.", href: "/accounts-finance/order-wise-profit-loss", icon: TrendingUp, metric: "avg margin" },
  { title: "Bank & Cash Management", description: "Liquidity, reconciliation, and bank accounts.", href: "/accounts-finance/bank-cash-management", icon: Landmark, metric: "available" },
  { title: "Expense Tracking", description: "Expense claims, reimbursements, and exceptions.", href: "/accounts-finance/expense-tracking", icon: WalletCards, metric: "MTD" },
  { title: "Financial Reporting", description: "Management packs and period-close reporting.", href: "/accounts-finance/financial-reporting", icon: ChartNoAxesCombined, metric: "close status" },
  { title: "Integrated Financial Accounting", description: "Controlled general ledger and journal activity.", href: "/accounts-finance/integrated-financial-accounting-system", icon: CalendarClock, metric: "journals" },
]

export default function AccountsFinanceIndexPage() {
  const [summary, setSummary] = React.useState<AccountsSummary | null>(null)

  React.useEffect(() => {
    getAccountsSummary().then((res) => setSummary(res.data)).catch(() => {})
  }, [])

  return (
    <AppLayout>
      <main className="mx-auto max-w-[1600px] space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-3xl font-bold tracking-tight">Accounts &amp; Finance</h1><Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Current Period</Badge></div>
            <p className="mt-1 text-sm text-muted-foreground">A connected view of cash, collections, supplier obligations, and profitability.</p>
          </div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => toast.success("Management pack exported")}>Export management pack</Button><Button onClick={() => toast.info("Finance task center opened")}>Open finance tasks</Button></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Cash available", summary?.cash_available ?? "$786.4K", summary?.cash_trend ?? "current balance", "text-emerald-600"],
            ["Receivables due", summary?.receivables_due ?? "$428.6K", summary?.receivables_count ? `${summary.receivables_count} invoices due` : "8 invoices due this week", "text-amber-600"],
            ["Payables scheduled", summary?.payables_scheduled ?? "$312.8K", summary?.payables_note ?? "Next payment run scheduled", "text-primary"],
            ["Portfolio contribution", summary?.portfolio_contribution ?? "$842.6K", summary?.portfolio_margin ?? "projected gross margin", "text-emerald-600"],
          ].map(([label, value, note, tone]) => (
            <Card key={label} className="gap-3 border-border/70 py-4 shadow-none"><CardContent className="p-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className={`mt-2 text-xs font-medium ${tone}`}>{note}</p></CardContent></Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="gap-0 py-0 xl:col-span-2">
            <CardHeader className="border-b px-5 py-5"><CardTitle>Finance workspace</CardTitle><CardDescription>Open a module to continue operational work.</CardDescription></CardHeader>
            <CardContent className="grid gap-px bg-border p-px sm:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon
                return <a href={module.href} key={module.title} className="group bg-card p-5 transition-colors hover:bg-muted/40"><div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div><ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-4 font-medium">{module.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{module.description}</p></a>
              })}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="gap-4">
              <CardHeader className="p-0"><CardTitle className="text-base">Priority actions</CardTitle><CardDescription>Items requiring finance attention today.</CardDescription></CardHeader>
              <CardContent className="space-y-3 p-0">
                {["Review accounts payable aging report", "Follow up on outstanding receivables", "Reconcile bank statements for last month", "Review expense reports pending approval"].map((task, index) => <button key={task} onClick={() => toast.info(`Opening task ${index + 1}`)} className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${index < 2 ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"}`}>{index + 1}</span><span className="text-sm leading-snug">{task}</span></button>)}
              </CardContent>
            </Card>
            <Card className="gap-3 border-primary/15 bg-primary/5"><CardContent className="p-0"><p className="text-sm font-medium">All finance activity is connected</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Bills, receipts, operational costs, and journals retain a clear source and approval trail.</p></CardContent></Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
