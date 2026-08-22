"use client"

import * as React from "react"
import { ReportingWorkspace } from "../reporting-workspace"
import { restList } from "@/lib/api/rest"

export default function OrderWiseProfitabilityPage() {
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    restList("orders", "Order")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : []
        setRawItems(items as Record<string, unknown>[])
      })
      .catch(() => {})
  }, [])

  return <ReportingWorkspace module="order-wise-profitability" rawItems={rawItems} />
}

