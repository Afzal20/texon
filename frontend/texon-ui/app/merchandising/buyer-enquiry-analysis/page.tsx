"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getBuyerEnquiries, getBuyers } from "@/lib/api/merchandising"
import type { Buyer } from "@/app/buyers/types"

const fmtCount = (n: number) => n.toLocaleString()

export default function BuyerEnquiryAnalysisPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getBuyerEnquiries(),
      getBuyers(),
    ]).then(([enqRes, buyerRes]) => {
      const items = Array.isArray(enqRes.data?.results) ? enqRes.data.results : Array.isArray(enqRes.data) ? enqRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const buyerList: Buyer[] = Array.isArray(buyerRes.data?.results) ? buyerRes.data.results : Array.isArray(buyerRes.data) ? buyerRes.data : []
      const buyerMap = new Map(buyerList.map((b) => [b.id, b.name]))
      const open = items.filter((i: any) => i.status === "received" || i.status === "under_review")
      const converted = items.filter((i: any) => i.status === "converted")
      const lost = items.filter((i: any) => i.status === "lost")
      const quoted = items.filter((i: any) => i.status === "quoted")
      setData({
        metrics: [
          { label: "Open enquiries", value: fmtCount(open.length), note: `${open.length} awaiting response`, trend: "neutral" as const },
          { label: "Converted to order", value: fmtCount(converted.length), note: items.length ? `${Math.round(converted.length / items.length * 100)}% conversion` : "0%", trend: "up" as const },
          { label: "Quoted", value: fmtCount(quoted.length), note: "Awaiting buyer decision", trend: "neutral" as const },
          { label: "Lost opportunities", value: fmtCount(lost.length), note: "Did not convert", trend: "down" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          `ENQ-${i.id}`,
          buyerMap.get(i.buyer) ?? `Buyer #${i.buyer}`,
          i.notes?.slice(0, 60) || "-",
          i.enquiry_date ?? "-",
          "-",
          i.status?.replace("_", " ") ?? "Received",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="buyer-enquiry-analysis" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/buyer-enquiry-analysis/${row[row.length - 1]}`} rawItems={rawItems} />
}
