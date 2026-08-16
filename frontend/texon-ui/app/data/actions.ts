"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { fetchAllData, type AllData } from "@/lib/graphql/client"

export async function fetchAllFromGraphQL(): Promise<AllData> {
  const token = await getApiToken()
  return fetchAllData(token)
}