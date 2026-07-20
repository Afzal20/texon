"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, FileText, Shirt, CalendarDays, Hash, DollarSign, Percent, Info, User, Wrench, Package, TrendingUp, AlertCircle, CheckCircle2, Clock, Layers, Factory, ClipboardList, UserCheck, LineChart } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  Building, FileText, Shirt, CalendarDays, Hash, DollarSign, Percent, Info, User, Wrench, Package, TrendingUp, AlertCircle, CheckCircle2, Clock, Layers, Factory, ClipboardList, UserCheck, LineChart,
}

export type DetailField = {
  label: string
  key: string
  type?: "text" | "date" | "currency" | "number" | "badge" | "icon"
  icon?: string
  formatter?: (value: unknown) => string
}

export function MerchandisingDetail({
  module,
  title,
  fields,
  data,
  isLoading,
  error,
}: {
  module: string
  title: string
  fields: DetailField[]
  data: Record<string, unknown> | null
  isLoading: boolean
  error: string | null
}) {
  const titleStr = isLoading
    ? "Loading..."
    : error
      ? "Error"
      : data
        ? `${title} #${data.id}`
        : "Not found"

  if (isLoading) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 w-full animate-pulse rounded bg-muted" />
          ))}
        </main>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
          <div className="flex flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-12 text-center">
            <AlertCircle className="mb-2 size-8 text-rose-500" />
            <p className="text-lg font-semibold text-rose-800">Failed to load</p>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
            <a href={`/merchandising/${module}`} className="mt-4 text-sm font-medium text-primary hover:underline">Back to {module.replace(/-/g, " ")}</a>
          </div>
        </main>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
          <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Record not found</p>
            <a href={`/merchandising/${module}`} className="mt-4 text-sm font-medium text-primary hover:underline">Back to {module.replace(/-/g, " ")}</a>
          </div>
        </main>
      </AppLayout>
    )
  }

  const formatValue = (field: DetailField): string => {
    const value = data[field.key]
    if (value === null || value === undefined) return "-"
    if (field.formatter) return field.formatter(value)
    switch (field.type) {
      case "date":
        return new Date(String(value)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      case "currency":
        return "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      case "number":
        return Number(value).toLocaleString()
      case "badge": {
        const str = String(value).replace(/_/g, " ")
        const tone = str === "approved" || str === "active" || str === "completed" || str === "resolved" || str === "on track" || str === "exceeded" || str === "implemented" || str === "in stock" || str === "running"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : str === "rejected" || str === "overdue" || str === "behind" || str === "at risk" || str === "below target" || str === "pending"
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        return `<span class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${tone}">${str.charAt(0).toUpperCase() + str.slice(1)}</span>`
      }
      default:
        return String(value)
    }
  }

  const renderValue = (field: DetailField) => {
    const raw = data[field.key]
    if (field.type === "badge") {
      const str = String(raw ?? "").replace(/_/g, " ")
      if (!raw) return <span className="text-muted-foreground">-</span>
      const tone = str === "approved" || str === "active" || str === "completed" || str === "resolved" || str === "on track" || str === "exceeded" || str === "implemented" || str === "in stock" || str === "running"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : str === "rejected" || str === "overdue" || str === "behind" || str === "at risk" || str === "below target" || str === "pending"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>{str.charAt(0).toUpperCase() + str.slice(1)}</span>
    }
    return <span>{formatValue(field)}</span>
  }

  const Icon = data.icon ? iconMap[data.icon as string] : undefined

  const curatedKeys = new Set(fields.map((f) => f.key))
  const extraKeys = Object.keys(data).filter((k) => !curatedKeys.has(k) && k !== "icon")

  const formatRawValue = (v: unknown): string => {
    if (v === null || v === undefined) return "-"
    if (typeof v === "boolean") return v ? "Yes" : "No"
    if (typeof v === "number") return v.toLocaleString()
    if (typeof v === "object") {
      try { return JSON.stringify(v) } catch { return String(v) }
    }
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      try { return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) } catch { return s }
    }
    return s
  }

  const humanLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <AppLayout>
      <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
        <a href={`/merchandising/${module}`} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to {module.replace(/-/g, " ")}
        </a>

        <div className="flex items-center gap-3">
          {Icon && <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-5" /></div>}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{titleStr}</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b px-6 py-5">
            <CardTitle className="text-base">Curated Fields</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="divide-y">
              {fields.map((field) => (
                <div key={field.key} className="flex items-start gap-4 px-6 py-4 text-sm">
                  <dt className="flex w-48 items-center gap-2 font-medium text-muted-foreground">
                    {field.icon && React.createElement(iconMap[field.icon] ?? Info, { className: "size-4 shrink-0" })}
                    {field.label}
                  </dt>
                  <dd className="flex-1">{renderValue(field)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {extraKeys.length > 0 && (
          <Card>
            <CardHeader className="border-b px-6 py-5">
              <CardTitle className="text-base">Additional Fields</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y">
                {extraKeys.map((key) => (
                  <div key={key} className="flex items-start gap-4 px-6 py-4 text-sm">
                    <dt className="flex w-48 items-center gap-2 font-medium text-muted-foreground">
                      {humanLabel(key)}
                    </dt>
                    <dd className="flex-1 font-mono text-xs">{formatRawValue(data[key])}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </main>
    </AppLayout>
  )
}
