"use client"

import * as React from "react"
import { CRMWorkspace } from "../crm-workspace"
import { getBuyers } from "@/lib/api/crm"
import { getBuyerPortfolios } from "@/lib/api/merchandising"

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtCount = (n: number) => n.toLocaleString()

export default function BuyerProfilePage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})

  React.useEffect(() => {
    Promise.all([getBuyers(), getBuyerPortfolios()]).then(([buyersRes, portfoliosRes]) => {
      const items = Array.isArray(buyersRes.data?.results) ? buyersRes.data.results : Array.isArray(buyersRes.data) ? buyersRes.data : []
      const portfolios = Array.isArray(portfoliosRes.data?.results) ? portfoliosRes.data.results : Array.isArray(portfoliosRes.data) ? portfoliosRes.data : []
      if (!items.length) return

      const portfolioMap = new Map<number, any>(portfolios.map((p: any) => [p.buyer, p]))
      const active = items.filter((i: any) => i.is_active)
      const countries = new Set(items.map((i: any) => i.country).filter(Boolean))
      const rated = items.filter((i: any) => i.rating)
      const avgRating = rated.length
        ? rated.reduce((s: number, i: any) => s + Number(i.rating.rating ?? 0), 0) / rated.length
        : 0

      setData({
        metrics: [
          { label: "Total buyers", value: fmtCount(items.length), note: `${active.length} active profiles`, trend: "neutral" as const },
          { label: "Active buyers", value: fmtCount(active.length), note: `${items.length - active.length} inactive`, trend: "up" as const },
          { label: "Countries", value: fmtCount(countries.size), note: "Unique sourcing regions", trend: "neutral" as const },
          { label: "Avg rating", value: avgRating.toFixed(1), note: `Across ${rated.length} rated buyer(s)`, trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => {
          const pf = portfolioMap.get(i.id)
          return [
            `${i.name} (${i.code})`,
            i.contact_person || "-",
            i.country ?? "-",
            pf ? fmtCount(pf.active_orders) : "-",
            pf ? fmt(Number(pf.total_value)) : "-",
            i.is_active ? "Active" : "Inactive",
          ]
        }),
      })
    }).catch(() => {})
  }, [])

  return <CRMWorkspace module="buyer-profile" metrics={data.metrics} rows={data.rows} />
}
