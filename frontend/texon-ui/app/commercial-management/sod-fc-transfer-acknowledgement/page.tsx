"use client"

import * as React from "react"
import { CommercialManagementWorkspace } from "../commercial-management-workspace"

export default function SODFCTransferPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return <CommercialManagementWorkspace module="sod-fc-transfer-acknowledgement" isLoading={isLoading} />
}
