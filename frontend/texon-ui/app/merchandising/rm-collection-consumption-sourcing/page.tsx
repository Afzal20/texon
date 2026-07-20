"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getFabrics, getAccessories, getTrims } from "@/lib/api/inventory"

const fmtCount = (n: number) => n.toLocaleString()
const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function RmCollectionConsumptionSourcingPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getFabrics(),
      getAccessories(),
      getTrims(),
    ]).then(([fabRes, accRes, trimRes]) => {
      const fabrics = Array.isArray(fabRes.data?.results) ? fabRes.data.results : Array.isArray(fabRes.data) ? fabRes.data : []
      const accessories = Array.isArray(accRes.data?.results) ? accRes.data.results : Array.isArray(accRes.data) ? accRes.data : []
      const trims = Array.isArray(trimRes.data?.results) ? trimRes.data.results : Array.isArray(trimRes.data) ? trimRes.data : []
      const totalItems = fabrics.length + accessories.length + trims.length
      const allMaterials = [
        ...fabrics.map((i: any) => ({ ...i, _type: "Fabric" })),
        ...accessories.map((i: any) => ({ ...i, _type: "Accessory" })),
        ...trims.map((i: any) => ({ ...i, _type: "Trim" })),
      ]
      setRawItems(allMaterials as Record<string, unknown>[])
      const lowStock = allMaterials.filter((i: any) => Number(i.quantity ?? 0) <= Number(i.threshold_quantity ?? 0))
      const fabricValue = fabrics.reduce((s: number, i: any) => s + Number(i.unit_price ?? 0) * Number(i.quantity ?? 0), 0)
      setData({
        metrics: [
          { label: "Materials tracked", value: fmtCount(totalItems), note: "Fabrics, trims, accessories", trend: "neutral" as const },
          { label: "Low stock items", value: fmtCount(lowStock.length), note: "Below threshold", trend: "down" as const },
          { label: "Fabrics in stock", value: fmt(fabricValue), note: `Across ${fabrics.length} fabrics`, trend: "neutral" as const },
          { label: "Total items", value: fmtCount(totalItems), note: "All material types", trend: "neutral" as const },
        ],
        rows: allMaterials.slice(0, 4).map((i: any) => [
          i.name ?? i.code ?? "-",
          i._type,
          "-",
          String(i.quantity ?? 0),
          "-",
          Number(i.quantity ?? 0) <= Number(i.threshold_quantity ?? 0) ? "Low stock" : "In stock",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="rm-collection-consumption-sourcing" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/rm-collection-consumption-sourcing/${row[row.length - 1]}`} rawItems={rawItems} />
}
