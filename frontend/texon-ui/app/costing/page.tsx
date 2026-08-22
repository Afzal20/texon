"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle2, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { getCostSheets } from "@/lib/api/costing"

type CostSheetRow = Record<string, unknown>

const money = (v: unknown) =>
  `$${Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Costing() {
  const [sheets, setSheets] = React.useState<CostSheetRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)

  React.useEffect(() => {
    getCostSheets()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setSheets(items as CostSheetRow[])
        if (items.length > 0) setSelectedId(Number((items[0] as CostSheetRow).id))
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const selected: CostSheetRow | undefined =
    sheets.find((s) => Number(s.id) === selectedId) ?? sheets[0]

  const breakdown: { label: string; value: string }[] = selected
    ? [
        { label: "Fabric", value: money(selected.fabric_cost) },
        { label: "Accessory", value: money(selected.accessory_cost) },
        { label: "Trims", value: money(selected.trim_cost) },
        { label: "CM (Cost of Making)", value: money(selected.labor_cost) },
        { label: "Overhead", value: money(selected.overhead_cost) },
        { label: "Commercial / Logistics", value: money(selected.commercial_cost) },
      ]
    : []

  const marginPct = Number(selected?.margin ?? 0)
  const sellingPrice = Number(selected?.selling_price ?? 0)

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Costing & BOM</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {selected
                ? `${String(selected.style_name ?? "—")} | ${String(selected.cost_date ?? "")} | `
                : "Live cost sheets from the backend."}
              {selected && (
                <span className="text-primary font-semibold">Status: {String(selected.status_display ?? selected.status ?? "—")}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => toast.success("BOM exported to spreadsheet")}><Download className="h-4 w-4" /> Export</Button>
            <Button className="gap-2" onClick={() => toast.info("Approval workflow starting soon")}>
              <CheckCircle2 className="h-4 w-4" /> Approval Workflow
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5 min-w-0">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Margin</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground break-words">{selected ? `${marginPct.toFixed(2)}%` : "—"}</div>
              <p className="text-xs text-muted-foreground mt-2">{selected ? String(selected.status_display ?? "") : "No sheet selected"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 min-w-0">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Selling Price / Unit</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground break-words">{selected ? money(sellingPrice) : "—"}</div>
              <p className="text-xs text-muted-foreground mt-2">From cost sheet</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 min-w-0">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Cost</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground break-words">{selected ? money(selected.total_cost) : "—"}</div>
              <p className="text-xs text-muted-foreground mt-2">{sheets.length} sheet(s) on record</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sheets table */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Cost Sheets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_0.9fr] text-xs font-bold text-muted-foreground uppercase tracking-wide px-6 py-3 border-b border-border bg-muted/20">
                <div>Style</div>
                <div>Fabric</div>
                <div>Trims & Acc.</div>
                <div>CM</div>
                <div>Status</div>
              </div>
              {isLoading && (
                <div className="px-6 py-8 text-center text-xs text-muted-foreground">Loading…</div>
              )}
              {!isLoading && sheets.length === 0 && (
                <div className="px-6 py-8 text-center text-xs text-muted-foreground">No cost sheets yet.</div>
              )}
              {sheets.map((s) => (
                <button
                  key={String(s.id)}
                  onClick={() => setSelectedId(Number(s.id))}
                  className={`w-full text-left grid grid-cols-[1.6fr_1fr_1fr_1fr_0.9fr] items-center px-6 py-4 border-b border-border hover:bg-muted/10 transition-colors text-sm ${Number(s.id) === Number(selected?.id) ? "bg-primary/5" : ""}`}
                >
                  <div className="font-medium text-foreground text-xs">{String(s.style_name ?? s.style ?? "—")}</div>
                  <div className="font-mono text-xs text-muted-foreground">{money(s.fabric_cost)}</div>
                  <div className="font-mono text-xs text-muted-foreground">{money(Number(s.trim_cost ?? 0) + Number(s.accessory_cost ?? 0))}</div>
                  <div className="font-mono text-xs text-muted-foreground">{money(s.labor_cost)}</div>
                  <div>
                    <span className="text-xs font-semibold px-2 py-1 rounded border bg-muted text-muted-foreground">{String(s.status_display ?? s.status ?? "—")}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Breakdown */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Cost Summary Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!selected && <p className="text-xs text-muted-foreground">Select a cost sheet.</p>}
                {breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
                {selected && (
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between text-base font-bold text-foreground">
                      <span>Total Manufacturing Cost</span>
                      <span className="font-mono">{money(selected.total_cost)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Margin (Calculated)</div>
                    <div className="text-2xl font-bold text-primary mt-1">{selected ? `${marginPct.toFixed(2)}%` : "—"}</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Margin</span>
                    <span>Target FOB: {selected ? money(sellingPrice) : "—"}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, Math.max(0, marginPct))}%` }} />
                  </div>
                </div>
                <Button className="w-full mt-4 gap-2" variant="outline" onClick={() => toast.success("Pricing updated")}>
                  <RefreshCw className="h-4 w-4" /> Update Pricing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
