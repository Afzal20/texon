import { graphqlFetch, graphqlName, type ModelRow } from "@/lib/graphql/client"
import { MODEL_REGISTRY } from "@/lib/graphql/registry"

/**
 * GraphQL-backed data access helpers used by lib/api/* and lib/data/*.
 *
 * List/get return the DRF-style shape `{ data: rows }` with snake_case keys,
 * so existing page code (`res.data?.results ?? res.data`) keeps working.
 * Optional `params` (e.g. `{ lc_type: "import" }`) are applied as client-side
 * filters on the fetched rows.
 */

export type GqlParams = Record<string, unknown>
export type GqlRow = Record<string, unknown>
export type GqlListResult = { data: GqlRow[] & { results?: unknown } }

const CAMEL = /[_](.)?/g

export function toSnake(value: string): string {
  return value.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()
}

export function toCamel(value: string): string {
  return value.replace(CAMEL, (_, c: string) => (c ? c.toUpperCase() : ""))
}

function snakeRow(row: ModelRow): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(row)) {
    const k = toSnake(key)
    out[k] = k === "id" && typeof val === "string" && /^\d+$/.test(val) ? Number(val) : val
  }
  return out
}

function filterRows(rows: ModelRow[], params?: GqlParams): Record<string, unknown>[] {
  const mapped = rows.map(snakeRow)
  if (!params) return mapped
  return mapped.filter((row) =>
    Object.entries(params).every(([k, v]) => row[k] === undefined || row[k] === v || String(row[k]) === String(v)),
  )
}

export async function gqlList(
  app: string,
  model: string,
  params?: GqlParams,
  token?: string,
): Promise<GqlListResult> {
  const entry = MODEL_REGISTRY[app]?.[model]
  if (!entry) throw new Error(`Unknown GraphQL model ${app}.${model}`)
  const query = `query { ${entry.query} { ${entry.fields.join(" ")} } }`
  const res = await graphqlFetch<Record<string, ModelRow[]>>(query, undefined, token)
  return { data: filterRows(res[entry.query] ?? [], params) }
}

export async function gqlGet(
  app: string,
  model: string,
  id: number | string,
  token?: string,
): Promise<{ data: GqlRow | null }> {
  const entry = MODEL_REGISTRY[app]?.[model]
  if (!entry) throw new Error(`Unknown GraphQL model ${app}.${model}`)
  const query = `query { ${graphqlName(`${toSnake(model)}_by_id`)} (id: ${JSON.stringify(String(id))}) { ${entry.fields.join(" ")} } }`
  const res = await graphqlFetch<Record<string, ModelRow | null>>(query, undefined, token)
  const row = res[graphqlName(`${toSnake(model)}_by_id`)]
  return { data: row ? snakeRow(row) : null }
}

function literal(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return JSON.stringify(String(value ?? ""))
}

function mutationArgs(data: GqlParams): string {
  return Object.entries(data)
    .map(([key, value]) => `${toCamel(toSnake(key))}: ${literal(value)}`)
    .join(", ")
}

export async function gqlCreate(
  app: string,
  model: string,
  data: GqlParams,
  token?: string,
): Promise<{ data: GqlRow }> {
  const entry = MODEL_REGISTRY[app]?.[model]
  if (!entry) throw new Error(`Unknown GraphQL model ${app}.${model}`)
  const name = graphqlName(`create_${toSnake(model)}`)
  const out = graphqlName(toSnake(model))
  const query = `mutation { ${name} (${mutationArgs(data)}) { ok errors ${out} { ${entry.fields.join(" ")} } } }`
  const res = await graphqlFetch<Record<string, { ok: boolean; errors?: unknown; [k: string]: unknown }>>(
    query, undefined, token,
  )
  const result = res[name]
  if (!result?.ok) throw new Error(String(result?.errors ?? "Mutation failed"))
  return { data: snakeRow((result[out] ?? {}) as ModelRow) }
}

export async function gqlUpdate(
  app: string,
  model: string,
  id: number | string,
  data: GqlParams,
  token?: string,
): Promise<{ data: GqlRow }> {
  const entry = MODEL_REGISTRY[app]?.[model]
  if (!entry) throw new Error(`Unknown GraphQL model ${app}.${model}`)
  const name = graphqlName(`update_${toSnake(model)}`)
  const out = graphqlName(toSnake(model))
  const args = mutationArgs({ ...data, id: String(id) })
  const query = `mutation { ${name} (${args}) { ok errors ${out} { ${entry.fields.join(" ")} } } }`
  const res = await graphqlFetch<Record<string, { ok: boolean; errors?: unknown; [k: string]: unknown }>>(
    query, undefined, token,
  )
  const result = res[name]
  if (!result?.ok) throw new Error(String(result?.errors ?? "Mutation failed"))
  return { data: snakeRow((result[out] ?? {}) as ModelRow) }
}

export async function gqlDelete(
  app: string,
  model: string,
  id: number | string,
  token?: string,
): Promise<{ data: { success: boolean } }> {
  const name = graphqlName(`delete_${toSnake(model)}`)
  const query = `mutation { ${name} (id: ${JSON.stringify(String(id))}) { ok errors deletedId } }`
  const res = await graphqlFetch<Record<string, { ok: boolean; errors?: unknown }>>(query, undefined, token)
  const result = res[name]
  if (!result?.ok) throw new Error(String(result?.errors ?? "Delete failed"))
  return { data: { success: true } }
}