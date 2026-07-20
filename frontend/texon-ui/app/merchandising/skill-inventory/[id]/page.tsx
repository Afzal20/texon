"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { MerchandisingDetail } from "../../merchandising-detail"
import { getSkillInventory } from "@/lib/api/merchandising"
import type { DetailField } from "../../merchandising-detail"

const fields: DetailField[] = [
  { label: "Operator name", key: "operator_name", icon: "User" },
  { label: "Production line", key: "production_line", icon: "Factory" },
  { label: "Skill name", key: "skill_name", icon: "Wrench" },
  { label: "Skill level", key: "skill_level", type: "badge", icon: "TrendingUp" },
  { label: "Multi-skill", key: "multi_skill", type: "badge", formatter: (v) => v ? "Yes" : "No", icon: "CheckCircle2" },
  { label: "Last assessed", key: "last_assessed", type: "date", icon: "CalendarDays" },
  { label: "Notes", key: "notes", icon: "FileText" },
]

function SkillInventoryDetailPageInner() {
  const params = useParams()
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSkillInventory(Number(params.id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setIsLoading(false))
  }, [params.id])

  return <MerchandisingDetail module="skill-inventory" title="Skill record" fields={fields} data={data} isLoading={isLoading} error={error} />
}

export default function SkillInventoryDetailPage() {
  return (
    <React.Suspense fallback={<MerchandisingDetail module="skill-inventory" title="Skill record" fields={fields} data={null} isLoading={true} error={null} />}>
      <SkillInventoryDetailPageInner />
    </React.Suspense>
  )
}
