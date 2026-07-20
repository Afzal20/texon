"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { getFabric, getAccessory, getTrim } from "@/lib/api/inventory"

const typeConfigs = [
  { key: "fabric", label: "Fabric", fn: getFabric },
  { key: "accessory", label: "Accessory", fn: getAccessory },
  { key: "trim", label: "Trim", fn: getTrim },
] as const

const fieldLabels: Record<string, string> = {
  name: "Name",
  code: "Code",
  color: "Color",
  composition: "Composition",
  width: "Width",
  quantity: "Quantity",
  unit: "Unit",
  threshold_quantity: "Threshold qty",
  unit_price: "Unit price",
  category: "Category",
  warehouse: "Warehouse",
  is_active: "Status",
  created_at: "Created",
  updated_at: "Updated",
}

const typeFieldMap: Record<string, string[]> = {
  fabric: ["name", "code", "color", "composition", "width", "quantity", "unit", "threshold_quantity", "unit_price", "warehouse", "is_active", "created_at", "updated_at"],
  accessory: ["name", "code", "category", "quantity", "unit", "threshold_quantity", "unit_price", "warehouse", "is_active", "created_at", "updated_at"],
  trim: ["name", "code", "quantity", "unit", "threshold_quantity", "unit_price", "warehouse", "is_active", "created_at", "updated_at"],
}

function MaterialDetail({ data, materialType }: { data: Record<string, unknown>; materialType: string }) {
  const typeName = materialType.charAt(0).toUpperCase() + materialType.slice(1)
  const fields = typeFieldMap[materialType] ?? typeFieldMap.fabric

  return (
    <AppLayout>
      <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
        <a href="/merchandising/rm-collection-consumption-sourcing" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to materials
        </a>
        <h1 className="text-2xl font-bold tracking-tight">{typeName} #{String(data.id)}</h1>
        <Card>
          <CardHeader className="border-b px-6 py-5">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="divide-y">
              {fields.map((key) => {
                const value = data[key]
                return (
                  <div key={key} className="flex items-start gap-4 px-6 py-4 text-sm">
                    <dt className="w-48 font-medium text-muted-foreground">{fieldLabels[key] ?? key}</dt>
                    <dd className="flex-1">
                      {key === "is_active"
                        ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${value ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{value ? "Active" : "Inactive"}</span>
                        : key === "unit_price"
                          ? "$" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : key === "created_at" || key === "updated_at"
                            ? new Date(String(value)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            : String(value ?? "-")}
                    </dd>
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}

function RmDetailInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [materialType, setMaterialType] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const id = Number(params.id)
    const tryFetch = async () => {
      for (const cfg of typeConfigs) {
        try {
          const res = await cfg.fn(id)
          setData(res.data)
          setMaterialType(cfg.key)
          return
        } catch { }
      }
      setError("Material not found")
    }
    tryFetch().finally(() => setIsLoading(false))
  }, [params.id])

  if (isLoading) {
    return (
      <AppLayout>
        <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-5 w-full animate-pulse rounded bg-muted" />)}
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
            <p className="text-lg font-semibold text-rose-800">{error}</p>
            <a href="/merchandising/rm-collection-consumption-sourcing" className="mt-4 text-sm font-medium text-primary hover:underline">Back to materials</a>
          </div>
        </main>
      </AppLayout>
    )
  }

  if (!data || !materialType) return null
  return <MaterialDetail data={data} materialType={materialType} />
}

export default function RmDetailPage() {
  return (
    <React.Suspense fallback={
      <AppLayout>
        <main className="mx-auto max-w-[960px] space-y-6 p-6 md:p-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-5 w-full animate-pulse rounded bg-muted" />)}
        </main>
      </AppLayout>
    }>
      <RmDetailInner />
    </React.Suspense>
  )
}
