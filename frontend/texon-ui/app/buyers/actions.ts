"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { apiFetch, ApiError } from "@/lib/api"
import type { Buyer, BuyersListResponse } from "./types"
import type { BuyerFormValues } from "./schema"

async function getAuthToken(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error("Not authenticated")
  }

  return session.access_token
}

export async function getBuyers(
  search?: string,
  page = 1,
): Promise<BuyersListResponse> {
  const token = await getAuthToken()
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  params.set("page", String(page))

  return apiFetch<BuyersListResponse>(
    `/api/v1/buyers/?${params.toString()}`,
    {},
    token,
  )
}

export async function getBuyer(id: number): Promise<Buyer> {
  const token = await getAuthToken()
  return apiFetch<Buyer>(`/api/v1/buyers/${id}/`, {}, token)
}

export async function createBuyer(
  values: BuyerFormValues,
): Promise<Buyer> {
  const token = await getAuthToken()

  const buyer = await apiFetch<Buyer>(
    "/api/v1/buyers/",
    {
      method: "POST",
      body: JSON.stringify(values),
    },
    token,
  )

  revalidatePath("/buyers")
  return buyer
}

export async function updateBuyer(
  id: number,
  values: BuyerFormValues,
): Promise<Buyer> {
  const token = await getAuthToken()

  const buyer = await apiFetch<Buyer>(
    `/api/v1/buyers/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(values),
    },
    token,
  )

  revalidatePath("/buyers")
  return buyer
}

export async function deleteBuyer(id: number): Promise<void> {
  const token = await getAuthToken()

  await apiFetch<unknown>(
    `/api/v1/buyers/${id}/`,
    { method: "DELETE" },
    token,
  )

  revalidatePath("/buyers")
}

export async function submitBuyer(
  id: number | null,
  values: BuyerFormValues,
): Promise<{ success: boolean; data?: Buyer; error?: string }> {
  try {
    const data = id ? await updateBuyer(id, values) : await createBuyer(values)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        typeof error.data === "object" && error.data !== null
          ? Object.entries(error.data as Record<string, string[]>)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join("; ")
          : error.message
      return { success: false, error: message }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }
  }
}
