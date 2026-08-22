"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"
import { getSupplierDocuments } from "@/lib/api/commercial"

export default function SupplierDocumentReceiveAcceptancePage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getSupplierDocuments()
      .then((res) => {
        const items = (Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []) as Record<string, unknown>[]
        setRawItems(items as Record<string, unknown>[])
        if (!items.length) return

        const pending = items.filter((i: Record<string, unknown>) => i.status === "pending").length
        const rejected = items.filter((i: Record<string, unknown>) => i.status === "rejected").length
        const accepted = items.filter((i: Record<string, unknown>) => i.status === "accepted" || i.status === "resubmitted").length
        const acceptanceRate = items.length ? Math.round((accepted / items.length) * 100) : 0

        setData({
          metrics: [
            { label: "Documents received", value: String(items.length), note: "All records", trend: "up" as const },
            { label: "Pending review", value: String(pending), note: "Awaiting acceptance", trend: "neutral" as const },
            { label: "Rejected documents", value: String(rejected), note: "Need resubmission", trend: rejected > 0 ? ("down" as const) : ("neutral" as const) },
            { label: "Acceptance rate", value: `${acceptanceRate}%`, note: `${accepted} accepted of ${items.length}`, trend: "up" as const },
          ],
          rows: items.slice(0, 8).map((i: Record<string, unknown>) => [
            String(i.document_number ?? "-"),
            String(i.supplier_name ?? i.supplier ?? "-"),
            typeof i.purchase_order === "object" && i.purchase_order !== null
              ? String((i.purchase_order as Record<string, unknown>).po_number ?? "-")
              : String(i.purchase_order ?? "-"),
            String(i.document_type_display ?? i.document_type ?? "-"),
            String(i.received_date ?? "-"),
            String(i.status_display ?? i.status ?? "-"),
          ]),
        })
      })
      .catch((err) => setError(err?.message || "Failed"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <CommercialManagementWorkspace
      module="supplier-document-receive-acceptance"
      metrics={data.metrics}
      rows={data.rows}
      isLoading={isLoading}
      error={error}
      rawItems={rawItems}
    />
  )
}
