"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react"

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "boolean") return v ? "Yes" : "No"
  if (typeof v === "number") return v.toLocaleString()
  if (typeof v === "object") {
    try { return JSON.stringify(v) } catch { return String(v) }
  }
  if (typeof v === "string") return v
  return String(v)
}

function humanLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function RawFieldTable({ data, label = "All Fields" }: { data: Record<string, unknown>; label?: string }) {
  const [open, setOpen] = useState(false)
  const keys = Object.keys(data).filter((k) => k !== "icon")
  if (keys.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex cursor-pointer flex-row items-center justify-between border-b px-6 py-4" onClick={() => setOpen(!open)}>
        <CardTitle className="text-base">{label} ({keys.length})</CardTitle>
        {open ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
      </CardHeader>
      {open && (
        <CardContent className="p-0">
          <dl className="divide-y">
            {keys.map((key) => (
              <div key={key} className="flex items-start gap-4 px-6 py-3 text-sm">
                <dt className="w-48 shrink-0 font-medium text-muted-foreground">{humanLabel(key)}</dt>
                <dd className="flex-1 font-mono text-xs leading-relaxed break-all">{formatValue(data[key])}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
    </Card>
  )
}

export function RawItemsViewer({ items, label = "Raw API Data" }: { items: Record<string, unknown>[]; label?: string }) {
  const [open, setOpen] = useState(false)
  if (!items || items.length === 0) return null

  const displayLabel = `${label} (${items.length} item${items.length !== 1 ? "s" : ""})`

  return (
    <Card>
      <CardHeader className="flex cursor-pointer flex-row items-center justify-between border-b px-6 py-4" onClick={() => setOpen(!open)}>
        <CardTitle className="text-base">{displayLabel}</CardTitle>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </CardHeader>
      {open && (
        <CardContent className="divide-y p-0">
          {items.map((item, idx) => (
            <div key={idx} className="p-0">
              <div className="bg-muted/30 px-6 py-2 text-xs font-semibold text-muted-foreground">Item #{idx + 1}</div>
              <dl className="divide-y">
                {Object.entries(item).filter(([k]) => k !== "icon").map(([key, value]) => (
                  <div key={key} className="flex items-start gap-4 px-6 py-2 text-sm">
                    <dt className="w-48 shrink-0 font-medium text-muted-foreground">{humanLabel(key)}</dt>
                    <dd className="flex-1 font-mono text-xs break-all">{formatValue(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
