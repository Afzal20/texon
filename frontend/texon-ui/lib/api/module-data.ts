"use client"

import { useEffect, useMemo, useState } from "react"
import { restList, type RestParams, type RestRow } from "./rest"

/**
 * Client-side fetch hook for workspace modules that previously rendered
 * hardcoded demo rows. Every table/metric on screen must come from these
 * backend rows via the generic REST layer — no fallback fixtures.
 */

export interface ModuleSource {
  /** Unique key the fetched rows are exposed under. */
  key: string
  app: string
  model: string
  params?: RestParams
}

export interface ModuleDataState {
  data: Record<string, RestRow[]>
  isLoading: boolean
  error: string | null
}

export function useModuleRows(sources: ModuleSource[]): ModuleDataState {
  const signature = useMemo(() => JSON.stringify(sources), [sources])
  const [state, setState] = useState<ModuleDataState>({ data: {}, isLoading: true, error: null })

  useEffect(() => {
    let cancelled = false
    const parsed: ModuleSource[] = JSON.parse(signature)

    setState({ data: {}, isLoading: true, error: null })

    Promise.all(
      parsed.map(async (src) => {
        try {
          const res = await restList(src.app, src.model, src.params)
          return [src.key, res.data as RestRow[]] as const
        } catch {
          // Endpoint may be forbidden/unavailable for this user's role —
          // surface an empty dataset rather than fake rows.
          return [src.key, []] as const
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      const data: Record<string, RestRow[]> = {}
      for (const [key, rows] of entries) data[key] = rows as RestRow[]
      setState({ data, isLoading: false, error: null })
    })

    return () => {
      cancelled = true
    }
  }, [signature])

  return state
}

/** Share (%) of rows whose ``field`` equals ``value`` — for progress bars. */
export function shareOf(rows: RestRow[], field: string, value: unknown): number {
  if (rows.length === 0) return 0
  const matching = rows.filter(
    (row) => String(row[field] ?? "") === String(value),
  ).length
  return Math.round((matching / rows.length) * 100)
}

/** Distinct values of ``field`` with row counts, sorted desc. */
export function tallyBy(rows: RestRow[], field: string): { value: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = String(row[field] ?? "—")
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}

export function sumOf(rows: RestRow[], field: string): number {
  return rows.reduce((sum, row) => sum + (Number(row[field]) || 0), 0)
}
