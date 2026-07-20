"use client"

import * as React from "react"
import { MerchandisingWorkspace } from "../merchandising-workspace"
import { getSkillInventories } from "@/lib/api/merchandising"
import { getProductionLines } from "@/lib/api/production"

const fmtCount = (n: number) => n.toLocaleString()

export default function SkillInventoryPage() {
  const [data, setData] = React.useState<{ metrics?: { label: string; value: string; note: string; trend: "up" | "down" | "neutral" }[]; rows?: string[][] }>({})
  const [rawItems, setRawItems] = React.useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    Promise.all([
      getSkillInventories(),
      getProductionLines(),
    ]).then(([skillRes, lineRes]) => {
      const items = Array.isArray(skillRes.data?.results) ? skillRes.data.results : Array.isArray(skillRes.data) ? skillRes.data : []
      setRawItems(items as Record<string, unknown>[])
      const lineList: any[] = Array.isArray(lineRes.data?.results) ? lineRes.data.results : Array.isArray(lineRes.data) ? lineRes.data : []
      const lineMap = new Map(lineList.map((l: any) => [l.id, l.name]))
      const operators = new Set(items.map((i: any) => i.operator_name).filter(Boolean))
      const multiSkill = items.filter((i: any) => i.multi_skill)
      const experts = items.filter((i: any) => i.skill_level === "expert")
      setData({
        metrics: [
          { label: "Operators tracked", value: fmtCount(operators.size), note: `Across ${lineMap.size} lines`, trend: "neutral" as const },
          { label: "Records", value: fmtCount(items.length), note: "Skill entries", trend: "neutral" as const },
          { label: "Multi-skill", value: fmtCount(multiSkill.length), note: operators.size ? `${Math.round(multiSkill.length / items.length * 100)}%` : "0%", trend: "up" as const },
          { label: "Experts", value: fmtCount(experts.length), note: "Highest skill level", trend: "up" as const },
        ],
        rows: items.slice(0, 4).map((i: any) => [
          i.operator_name ?? `Operator #${i.id}`,
          lineMap.get(i.production_line) ?? `Line #${i.production_line ?? "—"}`,
          i.skill_name || "—",
          i.skill_level ?? "Beginner",
          i.multi_skill ? "Yes" : "No",
          i.skill_level ? i.skill_level.charAt(0).toUpperCase() + i.skill_level.slice(1) : "Beginner",
          String(i.id),
        ]),
      })
    }).catch((err) => setError(err?.message || "Failed to load data"))
      .finally(() => setIsLoading(false))
  }, [])

  return <MerchandisingWorkspace module="skill-inventory" metrics={data.metrics} rows={data.rows} isLoading={isLoading} error={error} rowLink={(row) => `/merchandising/skill-inventory/${row[row.length - 1]}`} rawItems={rawItems} />
}
