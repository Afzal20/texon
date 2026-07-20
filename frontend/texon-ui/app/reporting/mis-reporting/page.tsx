"use client"

import * as React from "react"
import { ReportingWorkspace } from "../reporting-workspace"
import { getReports } from "@/lib/api/reports"

export default function MisReportingPage() {
  const [reports, setReports] = React.useState<any[]>([])
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])

  React.useEffect(() => {
    getReports().then((res) => {
      const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
      setRawItems(items as Record<string, unknown>[])
      setReports(items)
    }).catch(() => {})
  }, [])

  return <ReportingWorkspace module="mis-reporting" rawItems={rawItems} />
}
