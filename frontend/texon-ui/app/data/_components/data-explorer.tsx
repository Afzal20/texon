"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { ALL_MODELS, type AllData, type RestRow } from "@/lib/api/rest"

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function rowFields(rows: RestRow[]): string[] {
  const first = rows[0]
  if (!first) return []
  return Object.keys(first).filter((k) => k !== "id")
}

function ModelTable({
  model,
  fields,
  rows,
}: {
  model: string
  fields: string[]
  rows: RestRow[]
}) {
  const [detailId, setDetailId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{model}</span>
          <Badge variant="secondary">{rows.length}</Badge>
        </div>
      </div>
      <div className="rounded-lg border overflow-auto max-h-80">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              {["id", ...fields].map((f) => (
                <th key={f} className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={String(row.id)}
                className="border-t hover:bg-muted/40 cursor-pointer"
                onClick={() => setDetailId(detailId === String(row.id) ? null : String(row.id))}
              >
                {["id", ...fields].map((f) => (
                  <td key={f} className="px-2 py-1 whitespace-nowrap">
                    {formatValue(row[f])}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-2 py-3 text-muted-foreground">
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {detailId && (
        <pre className="rounded-lg bg-muted p-3 text-xs overflow-auto max-h-60">
          {JSON.stringify(rows.find((r) => String(r.id) === detailId), null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function DataExplorer({ data }: { data: AllData }) {
  const [filter, setFilter] = useState("")
  const [openApps, setOpenApps] = useState<Record<string, boolean>>({})

  const visibleModels = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return ALL_MODELS
    return ALL_MODELS.filter(
      ({ app, model }) => app.toLowerCase().includes(q) || model.toLowerCase().includes(q),
    )
  }, [filter])

  const byApp = useMemo(() => {
    const grouped: Record<string, typeof ALL_MODELS> = {}
    for (const entry of visibleModels) {
      ;(grouped[entry.app] ??= []).push(entry)
    }
    return grouped
  }, [visibleModels])

  const totalRows = useMemo(() => {
    let n = 0
    for (const app of Object.values(data))
      for (const rows of Object.values(app)) n += rows.length
    return n
  }, [data])

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Data Explorer</h1>
          <p className="text-sm text-muted-foreground">
            All ERP data fetched via the generic REST endpoints (<code>/api/v1/&lt;model&gt;/</code>)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{ALL_MODELS.length} models</Badge>
          <Badge variant="secondary">{totalRows} records</Badge>
        </div>
      </div>

      <Input
        placeholder="Filter by app or model…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      {Object.entries(byApp).map(([app, models]) => {
        const rowsInApp = models.reduce((n, { model }) => n + (data[app]?.[model]?.length ?? 0), 0)
        const open = openApps[app] ?? false
        return (
          <Card key={app}>
            <Collapsible open={open} onOpenChange={(v) => setOpenApps((p) => ({ ...p, [app]: v }))}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer select-none">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-mono">{app}</span>
                    </span>
                    <span className="flex gap-2">
                      <Badge variant="outline">{models.length} models</Badge>
                      <Badge variant="secondary">{rowsInApp} rows</Badge>
                    </span>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {models.map(({ model }) => {
                    const rows = data[app]?.[model] ?? []
                    return (
                      <ModelTable
                        key={model}
                        model={model}
                        fields={rowFields(rows)}
                        rows={rows}
                      />
                    )
                  })}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}

      {Object.keys(byApp).length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No models match “{filter}”
          </CardContent>
        </Card>
      )}
    </div>
  )
}