"use client"

import * as React from "react"
import { IEPlanningWorkspace } from "../ie-planning-workspace"

export default function POWiseTnaTimeActionPage() {
  const [data] = React.useState<{metrics?: any[]; rows?: string[][]}>({})

  React.useEffect(() => {}, [])

  return <IEPlanningWorkspace module="po-wise-tna-time-action" metrics={data.metrics} rows={data.rows} />
}
