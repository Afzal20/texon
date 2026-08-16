import { MODEL_REGISTRY } from "./registry"

export const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/graphql/`

export interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string; locations?: { line: number; column: number }[] }[]
}

export class GraphQLError extends Error {
  status: number
  errors: GraphQLResponse<unknown>["errors"]

  constructor(message: string, status: number, errors: GraphQLResponse<unknown>["errors"]) {
    super(message)
    this.name = "GraphQLError"
    this.status = status
    this.errors = errors
  }
}

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const accessToken =
    token ??
    (typeof window !== "undefined" ? window.localStorage.getItem("django_access_token") : undefined)
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: variables ?? undefined }),
    cache: "no-store",
  })

  let json: GraphQLResponse<T>
  try {
    json = (await res.json()) as GraphQLResponse<T>
  } catch {
    throw new GraphQLError(`GraphQL request failed with status ${res.status}`, res.status, [])
  }

  if (!res.ok || json.errors?.length) {
    const messages = json.errors?.map((e) => e.message).join("\n")
    throw new GraphQLError(
      messages ?? `GraphQL request failed with status ${res.status}`,
      res.status,
      json.errors,
    )
  }

  return json.data as T
}

const GRAPHQL_CAMEL = /[_](.)?/g

/** GraphQL field-name conversion (same as graphene applies to snake_case attrs). */
export function graphqlName(snake: string): string {
  return snake.replace(GRAPHQL_CAMEL, (_, c: string) => (c ? c.toUpperCase() : ""))
}

export interface ModelRow {
  id: string
  [key: string]: unknown
}

/** app label -> model name -> rows */
export type AllData = Record<string, Record<string, ModelRow[]>>

function selection(entry: { query: string; fields: string[] }): string {
  return `{ ${entry.fields.join(" ")} }`
}

/** Build one mega-query selecting every model via its registry query name. */
export function buildFetchAllQuery(): string {
  const selections = Object.entries(MODEL_REGISTRY)
    .map(([app, models]) =>
      Object.entries(models)
        .map(
          ([model, entry]) =>
            `  ${graphqlName(`${app}_${model}`)}: ${entry.query} ${selection(entry)}`,
        )
        .join("\n"),
    )
    .join("\n")
  return `query FetchAllData {\n${selections}\n}`
}

/** Fetch every model's list data in one request. */
export async function fetchAllData(token?: string): Promise<AllData> {
  const raw = await graphqlFetch<Record<string, ModelRow[]>>(
    buildFetchAllQuery(),
    undefined,
    token,
  )
  const data: AllData = {}
  for (const [app, models] of Object.entries(MODEL_REGISTRY)) {
    data[app] = {}
    for (const model of Object.keys(models)) {
      const alias = graphqlName(`${app}_${model}`)
      const rows = raw[alias] ?? []
      data[app][model] = rows.map((row) => ({ ...row, id: String(row.id) }))
    }
  }
  return data
}

/** Fetch a single model's list data. */
export async function fetchModelData(
  app: string,
  model: string,
  token?: string,
): Promise<ModelRow[]> {
  const entry = MODEL_REGISTRY[app]?.[model]
  if (!entry) throw new GraphQLError(`Unknown model ${app}.${model}`, 400, [])
  const query = `query { ${entry.query} ${selection(entry)} }`
  const data = await graphqlFetch<Record<string, ModelRow[]>>(query, undefined, token)
  const rows = data[entry.query] ?? []
  return rows.map((row) => ({ ...row, id: String(row.id) }))
}