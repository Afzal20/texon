"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { fetchAllData, type AllData } from "@/lib/api/rest"

export async function fetchAllFromRest(): Promise<AllData> {
  const token = await getApiToken()
  return fetchAllData(token)
}
